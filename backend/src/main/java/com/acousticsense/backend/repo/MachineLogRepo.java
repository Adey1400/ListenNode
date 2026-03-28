package com.acousticsense.backend.repo;

import com.acousticsense.backend.model.MachineLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MachineLogRepo extends JpaRepository<MachineLog, Long> {
 List<MachineLog> findTop20ByMachineIdOrderByTimestampDesc(Long machineId);
}