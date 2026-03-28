package com.acousticsense.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "machine_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MachineLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "machine_id", nullable = false)
    private Machine machine;

    private String audioFilePath; // Path to the saved .wav file
    
    private String aiResult; // "Normal", "Rattle", "Grinding", etc.
    
    private Double confidenceScore; // 0.0 to 1.0 from the AI model

    private LocalDateTime timestamp;
}