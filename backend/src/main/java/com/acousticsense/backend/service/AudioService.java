package com.acousticsense.backend.service;

import com.acousticsense.backend.model.Machine;
import com.acousticsense.backend.model.MachineLog;
import com.acousticsense.backend.repo.MachineLogRepo;
import com.acousticsense.backend.repo.MachineRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AudioService {

    private final MachineRepo machineRepo;
    private final MachineLogRepo machineLogRepo;

    public MachineLog saveAudioAndLog(Long machineId, MultipartFile file) throws IOException {
        Machine machine = machineRepo.findById(machineId)
                .orElseThrow(() -> new RuntimeException("Machine not found"));

        // 1. Create the directory if it doesn't exist
        String uploadDir = "uploads/recordings/";
        File directory = new File(uploadDir);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        // 2. Save the file with a unique name
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(uploadDir + fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // 3. Create the Database Entry
        MachineLog log = MachineLog.builder()
                .machine(machine)
                .audioFilePath("http://localhost:8080/" + uploadDir + fileName)
                .timestamp(LocalDateTime.now())
                .aiResult("PENDING") // This will be updated once the Senior's AI replies
                .build();

        return machineLogRepo.save(log);
    }
}