package com.farmsecurity.backend.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

@Entity
@Table(name = "intrusion_logs")
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String intruderType;
    private double confidence;
    private LocalDateTime timestamp = LocalDateTime.now();
    private String status = "Intrusion Detected";

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String imageData;

    // Getters and Setters
    public Long getId() { return id; }
    public String getIntruderType() { return intruderType; }
    public void setIntruderType(String intruderType) { this.intruderType = intruderType; }
    public double getConfidence() { return confidence; }
    public void setConfidence(double confidence) { this.confidence = confidence; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public String getStatus() { return status; }

    public String getImageData() { return imageData; }
    public void setImageData(String imageData) { this.imageData = imageData; }
}