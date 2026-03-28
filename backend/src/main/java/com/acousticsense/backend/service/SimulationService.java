package com.acousticsense.backend.service;

import com.acousticsense.backend.model.Machine;
import com.acousticsense.backend.model.MachineLog;
import com.acousticsense.backend.repo.MachineLogRepo;
import com.acousticsense.backend.repo.MachineRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class SimulationService {

    private final MachineRepo machineRepo;
    private final MachineLogRepo machineLogRepo;
    private final Random random = new Random();

@Scheduled(fixedRate = 20000)
public void generateFakeData() {
    List<Machine> machines = machineRepo.findAll();
    
    if (machines.isEmpty()) {
        return;
    }

    for (Machine machine : machines) {
        // Generate a random score
        double score = 60 + (random.nextDouble() * 40); 
        String result = determineResult(score);

        // 1. Create and Save the Log
        MachineLog logEntry = MachineLog.builder()
                .machine(machine)
                .aiResult(result)
                .confidenceScore(0.85 + (random.nextDouble() * 0.1))
                .timestamp(LocalDateTime.now())
                .audioFilePath("http://localhost:8080/uploads/recordings/sample_simulated.wav")
                .build();
        machineLogRepo.save(logEntry);
        
        // 2. Update the Machine Status
        // Logic: if score < 75, it's a WARNING. 
        String newStatus = (score < 75) ? "WARNING" : "HEALTHY";
        machine.setStatus(newStatus);
        
        // 3. FORCE the update to the machines table
        machineRepo.saveAndFlush(machine); 
        
        System.out.println("🔄 Updated " + machine.getName() + " to " + newStatus + " (Score: " + String.format("%.2f", score) + ")");
    }
}

    private String determineResult(double score) {
        if (score > 90) return "Normal Operating Condition";
        if (score > 80) return "Slight Bearing Wear";
        if (score > 70) return "High Vibration Detected";
        return "Critical Mechanical Friction";
    }
}