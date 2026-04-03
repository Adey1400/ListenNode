package com.acousticsense.backend.service;

import com.acousticsense.backend.model.MachineLog;
import com.acousticsense.backend.repo.MachineLogRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.nio.file.Path;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiInferenceService {

    private final MachineLogRepo machineLogRepo;
    private final SimpMessagingTemplate messagingTemplate;

    // This grabs the toggle switch from my properties file
    @Value("${rotoguard.ai.enabled:false}")
    private boolean isAiEnabled;

    @Value("${rotoguard.ai.url:http://localhost:5000/analyze}")
    private String aiServerUrl;

    /**
     * @Async ensures that the audio upload doesn't freeze waiting for the AI.
     * It runs the AI analysis in a separate background thread.
     */
    @Async
    public void processAudioWithRealAI(MachineLog logEntry, Path audioFilePath, Long machineId) {
        
        // THE GATEKEEPER: If the flag is false, do absolutely nothing.
        if (!isAiEnabled) {
            log.info("AI Inference is disabled. Real analysis skipped for Machine {}", machineId);
            return; 
        }

        log.info("AI Inference is ENABLED. Sending audio to Python AI for Machine {}", machineId);

        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new FileSystemResource(audioFilePath.toFile()));

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            // Server-to-Server call (Never exposed to the public frontend)
            ResponseEntity<Map> response = restTemplate.postForEntity(aiServerUrl, requestEntity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                // Update the database with the real Python results
                String aiResult = (String) response.getBody().get("status");
                Double confidence = Double.valueOf(response.getBody().get("confidence").toString());

                logEntry.setAiResult(aiResult);
                logEntry.setConfidenceScore(confidence);
                machineLogRepo.save(logEntry);

                // Pushing  the real data to the React Dashboard via WebSocket
                messagingTemplate.convertAndSend("/topic/machine-alerts/" + machineId, logEntry);
                log.info("Real AI Analysis complete. Alert sent to dashboard.");
            }
        } catch (Exception e) {
            log.error("Failed to communicate with Python AI Server: " + e.getMessage());
            logEntry.setAiResult("AI_OFFLINE_ERROR");
            machineLogRepo.save(logEntry);
            messagingTemplate.convertAndSend("/topic/machine-alerts/" + machineId, logEntry);
        }
    }
}