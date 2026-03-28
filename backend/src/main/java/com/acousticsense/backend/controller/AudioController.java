package com.acousticsense.backend.controller;

import com.acousticsense.backend.model.MachineLog;
import com.acousticsense.backend.repo.MachineLogRepo; // New import
import com.acousticsense.backend.service.AudioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/audio")
@RequiredArgsConstructor
public class AudioController {

    private final AudioService audioService;
    private final MachineLogRepo machineLogRepo; // Injected to fetch logs directly

    @PostMapping("/upload/{machineId}")
    public ResponseEntity<MachineLog> uploadAudio(
            @PathVariable Long machineId,
            @RequestParam("audioFile") MultipartFile file) throws IOException {
        
        MachineLog savedLog = audioService.saveAudioAndLog(machineId, file);
        return ResponseEntity.ok(savedLog);
    }

    // NEW: Get only the 20 most recent logs to prevent Postman/Browser crashes
    @GetMapping("/logs/{machineId}")
    public ResponseEntity<List<MachineLog>> getRecentLogs(@PathVariable Long machineId) {
        List<MachineLog> latestLogs = machineLogRepo.findTop20ByMachineIdOrderByTimestampDesc(machineId);
        return ResponseEntity.ok(latestLogs);
    }
    //to trigger the deletion and cleanup
    @DeleteMapping("/logs/{logId}")
    public ResponseEntity<?> deleteAudioLog(@PathVariable Long logId) {
        try {
            audioService.deleteMachineLog(logId);
            return ResponseEntity.ok().body("Machine log and associated audio file successfully deleted.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting log: " + e.getMessage());
        }
    }
}