package com.acousticsense.backend.service;

import com.acousticsense.backend.model.MachineLog;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@Slf4j
public class SseService {

    // machineId -> List<SseEmitter>
    // Using CopyOnWriteArrayList for thread-safe iteration during concurrent modifications
    private final ConcurrentHashMap<Long, CopyOnWriteArrayList<SseEmitter>> emitters =
        new ConcurrentHashMap<>();

    /**
     * Subscribe a browser connection to real-time updates for a machine.
     * Returns an SseEmitter that stays open until the client closes the connection.
     */
    public SseEmitter subscribe(Long machineId) {
        SseEmitter emitter = new SseEmitter(300_000L); // 5-minute timeout (300 seconds)

        emitters.computeIfAbsent(machineId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        log.info("New SSE subscriber connected for Machine {}. Total subscribers: {}",
            machineId, emitters.get(machineId).size());

        // Configure cleanup callbacks
        emitter.onCompletion(() -> {
            log.debug("SSE subscription completed for Machine {}", machineId);
            removeEmitter(machineId, emitter);
        });

        emitter.onTimeout(() -> {
            log.debug("SSE subscription timed out for Machine {}", machineId);
            removeEmitter(machineId, emitter);
        });

        emitter.onError(throwable -> {
            log.debug("SSE subscription error for Machine {}: {}", machineId, throwable.getMessage());
            removeEmitter(machineId, emitter);
        });

        return emitter;
    }

    /**
     * Broadcast a machine alert to all connected clients for that machine.
     */
    public void sendAlert(Long machineId, MachineLog logEntry) {
        CopyOnWriteArrayList<SseEmitter> machineEmitters = emitters.get(machineId);

        if (machineEmitters == null || machineEmitters.isEmpty()) {
            log.debug("No active subscribers for Machine {}", machineId);
            return;
        }

        machineEmitters.forEach(emitter -> {
            try {
                SseEmitter.SseEventBuilder event = SseEmitter.event()
                    .data(logEntry)
                    .id(String.valueOf(logEntry.getId()))
                    .name("machine-alert");

                emitter.send(event);
                log.debug("Alert sent to subscriber for Machine {}", machineId);
            } catch (IOException e) {
                log.debug("Failed to send alert to subscriber (connection likely closed): {}", e.getMessage());
                removeEmitter(machineId, emitter);
            }
        });
    }

    /**
     * Remove an emitter from the subscribers list and clean up empty entries.
     */
    private void removeEmitter(Long machineId, SseEmitter emitter) {
        CopyOnWriteArrayList<SseEmitter> machineEmitters = emitters.get(machineId);
        if (machineEmitters != null) {
            machineEmitters.remove(emitter);

            if (machineEmitters.isEmpty()) {
                emitters.remove(machineId);
                log.info("All subscribers disconnected for Machine {}. Cleaned up.", machineId);
            } else {
                log.info("SSE subscriber disconnected for Machine {}. Remaining subscribers: {}",
                    machineId, machineEmitters.size());
            }
        }
    }

    /**
     * Get the number of active subscribers for a machine (useful for monitoring).
     */
    public int getSubscriberCount(Long machineId) {
        CopyOnWriteArrayList<SseEmitter> machineEmitters = emitters.get(machineId);
        return machineEmitters == null ? 0 : machineEmitters.size();
    }
}
