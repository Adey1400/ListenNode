package com.acousticsense.backend.controller;

import com.acousticsense.backend.model.Machine;
import com.acousticsense.backend.model.MachineLog;
import com.acousticsense.backend.repo.MachineLogRepo;
import com.acousticsense.backend.repo.MachineRepo;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/machines")
@RequiredArgsConstructor
public class MachineController {

    private final MachineRepo machineRepo;
    private final MachineLogRepo machineLogRepo;
    
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
}