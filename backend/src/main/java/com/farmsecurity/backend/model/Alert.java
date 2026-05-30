package com.farmsecurity.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "intrusion_logs")
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String intruderType;
    private double confidence;
    private LocalDateTime timestamp = LocalDateTime.now();
    private String status = "DETERRED";

    // Getters and Setters
    public Long getId() { return id; }
    public String getIntruderType() { return intruderType; }
    public void setIntruderType(String intruderType) { this.intruderType = intruderType; }
    public double getConfidence() { return confidence; }
    public void setConfidence(double confidence) { this.confidence = confidence; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public String getStatus() { return status; }
}