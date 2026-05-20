package com.farmsecurity.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "intrusion_logs")
@Data
public class IntrusionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String intruderType;

    @Column(nullable = false)
    private Double confidence; 

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private String status; // 
}