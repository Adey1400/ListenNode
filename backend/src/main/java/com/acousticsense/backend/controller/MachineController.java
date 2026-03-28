package com.acousticsense.backend.controller;

import com.acousticsense.backend.model.Machine;
import com.acousticsense.backend.repo.MachineRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/machines")
@RequiredArgsConstructor
public class MachineController {

    private final MachineRepo machineRepo;

    @PostMapping
    public Machine createMachine(@RequestBody Machine machine) {
        return machineRepo.save(machine);
    }

    @GetMapping
    public List<Machine> getAllMachines() {
        return machineRepo.findAll();
    }
}