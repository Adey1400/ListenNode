package com.acousticsense.backend.controller;

import com.acousticsense.backend.model.Machine;
import com.acousticsense.backend.model.MachineLog;
import com.acousticsense.backend.repo.MachineLogRepo;
import com.acousticsense.backend.repo.MachineRepo;
import com.acousticsense.backend.service.SseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap; 

@RestController
@RequestMapping("/api/machines")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class MachineController {

    private final MachineRepo machineRepo;
    private final MachineLogRepo machineLogRepo;
    private final SseService sseService;

    // THE TRACKER: Required for the Smart Throttle to remember machine timings
    private final Map<Long, LocalDateTime> lastNormalSaveTime = new ConcurrentHashMap<>();

    @PostMapping
    public Machine createMachine(@RequestBody Machine machine) {
        return machineRepo.save(machine);
    }

    @GetMapping
    public List<Machine> getAllMachines() {
        return machineRepo.findAll();
    }

    @GetMapping("/{id}/logs")
    public ResponseEntity<List<MachineLog>> getMachineLogs(@PathVariable Long id) {
        // Fetches the 20 most recent logs from the database
        List<MachineLog> history = machineLogRepo.findTop20ByMachineIdOrderByTimestampDesc(id);
        return ResponseEntity.ok(history);
    }

    /**
     * SSE endpoint for real-time machine alerts.
     * Clients connect here and receive streamed alerts for their machine.
     */
    @GetMapping(value = "/{id}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamMachineAlerts(@PathVariable Long id) {
        log.info("New SSE client connected for Machine {}", id);
        return sseService.subscribe(id);
    }
    //Learn Bridge
    @PostMapping("/{id}/learn")
    public ResponseEntity<?> triggerLearnMode(@PathVariable Long id) {
        log.info("React requested Learn Mode for Machine {}", id);
        
        try {
            // NOTE: Ask your senior for HIS IP address or Ngrok URL where his Python script is listening!
            String seniorPythonUrl = "http://192.168.0.176:80/startButton" + id;
            
            // We use RestTemplate to shoot the empty JSON object to his laptop
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            
            // Sending the empty object {}
            restTemplate.postForEntity(seniorPythonUrl, Map.of(), String.class);
            
            log.info("Successfully sent Learn trigger to Python script for Machine {}", id);
            return ResponseEntity.ok(Map.of("success", true, "message", "Learn mode initiated for 60s"));
            
        } catch (Exception e) {
            log.error("Failed to reach Python script for Learn Mode: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("success", false, "error", "Could not reach AI microservice"));
        }
    }

    /**
     * Webhook endpoint for receiving AI inference results from Python microservice.
     * No authentication required (public endpoint, secured by IP/ngrok token if needed).
     * Broadcasts results via SSE to connected React clients.
     */
    @PostMapping("/{id}/ai-result")
    public ResponseEntity<?> receiveAiInferenceResult(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {

        try {
            // Validate payload
            if (payload == null || payload.isEmpty()) {
                log.warn("Received empty payload for Machine {}", id);
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Invalid payload: empty data"
                ));
            }

            // Extract and validate inference data
            Object statusObj = payload.get("status");
            Object confidenceObj = payload.get("confidence");
            Object healthObj = payload.get("healthPercentage"); // <-- ADDED: Extract health
            Object temperatureObj = payload.get("temperature"); // Extract temperature
            Object vibrationObj = payload.get("vibration"); // Extract vibration

            if (statusObj == null || confidenceObj == null) {
                log.warn("Missing required fields in AI result for Machine {}. Payload: {}", id, payload.keySet());
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Missing required fields: status, confidence"
                ));
            }

            String aiStatus = statusObj.toString();
            Double confidence;
            try {
                confidence = Double.parseDouble(confidenceObj.toString());
                if (confidence < 0.0 || confidence > 1.0) {
                    throw new NumberFormatException("Confidence out of range [0.0, 1.0]");
                }
            } catch (NumberFormatException e) {
                log.warn("Invalid confidence value for Machine {}: {}", id, confidenceObj);
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Invalid confidence: must be between 0.0 and 1.0"
                ));
            }

            // <-- ADDED: Parse the health percentage (Default to 100.0 if missing/invalid)
            Double healthPercentage = 100.0;
            if (healthObj != null) {
                try {
                    healthPercentage = Double.parseDouble(healthObj.toString());
                } catch (NumberFormatException e) {
                    log.warn("Invalid health percentage for Machine {}: {}", id, healthObj);
                }
            }
            
            // Parse temperature (optional, defaults to null if missing/invalid)
            Double temperature = null;
            if (temperatureObj != null) {
                try {
                    temperature = Double.parseDouble(temperatureObj.toString());
                } catch (NumberFormatException e) {
                    log.warn("Invalid temperature for Machine {}: {}", id, temperatureObj);
                }
            }
            
            // Parse vibration (optional, defaults to null if missing/invalid)
            Double vibration = null;
            if (vibrationObj != null) {
                try {
                    vibration = Double.parseDouble(vibrationObj.toString());
                } catch (NumberFormatException e) {
                    log.warn("Invalid vibration for Machine {}: {}", id, vibrationObj);
                }
            }

            // Fetch the machine
            Machine machine = machineRepo.findById(id)
                    .orElseThrow(() -> {
                        log.error("Machine {} not found for AI result", id);
                        return new RuntimeException("Machine not found");
                    });

            // Creating the log entry
            MachineLog logEntry = MachineLog.builder()
                    .machine(machine)
                    .timestamp(LocalDateTime.now())
                    .aiResult(aiStatus)
                    .confidenceScore(confidence)
                    .healthPercentage(healthPercentage) // NOW THIS WORKS!
                    .build();
          
            // ==========================================
            // Smart Throttle Logic (60 sec rule)
            // ==========================================
            boolean isAnomaly = !aiStatus.toLowerCase().contains("normal");
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime lastSave = lastNormalSaveTime.getOrDefault(id, LocalDateTime.MIN);
            
            // Saving if it's an anomaly, OR if it has been 60+ seconds since the last Normal save
            boolean shouldSaveToDb = isAnomaly || Duration.between(lastSave, now).getSeconds() >= 60;
            
            // Declare broadcastLog so we have something to send to React regardless of saving
            MachineLog broadcastLog = logEntry; 

            if (shouldSaveToDb) {
                // Actually save to PostgreSQL and update the broadcastLog with the saved ID
                broadcastLog = machineLogRepo.save(logEntry);
                
                // If it was a Normal reading, reset the timer for this machine
                if (!isAnomaly) {
                    lastNormalSaveTime.put(id, now);
                }
                log.info("SAVED TO DB: Machine {}: {} (confidence: {})", id, aiStatus, confidence);
            } else {
                log.debug("THROTTLED (Not Saved): Machine {}: {} (confidence: {})", id, aiStatus, confidence);
            }

            // Set temperature and vibration on the broadcast log (NOT saved to DB)
            broadcastLog.setTemperature(temperature);
            broadcastLog.setVibration(vibration);
            
            // ALWAYS Broadcast to React via SSE (Even if we throttled the database save!)
            sseService.sendAlert(id, broadcastLog);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "savedToDb", shouldSaveToDb,
                "message", shouldSaveToDb ? "AI result processed and saved to DB" : "AI result processed and throttled",
                "broadcast", Map.of(
                    "temperature", temperature,
                    "vibration", vibration
                )
            ));

        } catch (RuntimeException e) {
            log.error("Error processing AI result for Machine {}", id, e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Internal server error"
            ));
        }
    }
}