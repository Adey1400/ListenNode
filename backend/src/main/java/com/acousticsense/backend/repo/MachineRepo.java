package com.acousticsense.backend.repo;

import com.acousticsense.backend.model.Machine;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MachineRepo extends JpaRepository<Machine, Long> {
}