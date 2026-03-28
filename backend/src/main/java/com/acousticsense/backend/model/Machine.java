package com.acousticsense.backend.model;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Table(name = "machines")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Machine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // e.g., "Exhaust Fan 01"

    private String type; // e.g., "Centrifugal Fan"
    
    private String location; // e.g., "Floor 2, Section A"

    private String status; // "HEALTHY", "WARNING", "CRITICAL"

    @OneToMany(mappedBy = "machine", cascade = CascadeType.ALL)
    private List<MachineLog> logs;
}