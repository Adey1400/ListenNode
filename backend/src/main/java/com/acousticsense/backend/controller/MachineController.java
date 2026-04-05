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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/machines")
@RequiredArgsConstructor
@Slf4j
public class MachineController {

    private final MachineRepo machineRepo;
    private final MachineLogRepo machineLogRepo;
    private final SseService sseService;

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

            // Fetch the machine
            Machine machine = machineRepo.findById(id)
                    .orElseThrow(() -> {
                        log.error("Machine {} not found for AI result", id);
                        return new RuntimeException("Machine not found");
                    });

            // Create and save the log entry
            MachineLog logEntry = MachineLog.builder()
                    .machine(machine)
                    .timestamp(LocalDateTime.now())
                    .aiResult(aiStatus)
                    .confidenceScore(confidence)
                    .build();

            MachineLog savedLog = machineLogRepo.save(logEntry);
            log.info("AI result received for Machine {}: {} (confidence: {})", id, aiStatus, confidence);

            // Broadcast to all connected SSE clients
            sseService.sendAlert(id, savedLog);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "AI result processed and delivered to clients",
                "logId", savedLog.getId()
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