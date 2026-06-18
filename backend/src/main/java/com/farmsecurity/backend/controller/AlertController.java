package com.farmsecurity.backend.controller;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import com.farmsecurity.backend.model.Alert;
import com.farmsecurity.backend.repository.AlertRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private static final Set<String> ALLOWED_INTRUDER_TYPES = Set.of(
            "person", "cow", "sheep", "dog", "cat", "bird", "horse");

    private static final int MAX_IMAGE_DATA_LENGTH = 500_000; // ~375KB base64

    @Autowired
    private AlertRepository alertRepository;

    @GetMapping
    public List<Alert> getAllAlerts() {
        List<Alert> allAlerts = alertRepository.findAll();
        Collections.reverse(allAlerts);
        return allAlerts.stream().limit(20).collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<?> createAlert(@RequestBody Alert alert) {
        // Validate intruder type
        if (alert.getIntruderType() == null || alert.getIntruderType().isBlank()) {
            return ResponseEntity.badRequest()
                    .body("{\"error\": \"intruderType is required\"}");
        }

        String intruderType = alert.getIntruderType().toLowerCase().trim();
        if (!ALLOWED_INTRUDER_TYPES.contains(intruderType)) {
            return ResponseEntity.badRequest()
                    .body("{\"error\": \"Invalid intruderType value\"}");
        }
        alert.setIntruderType(intruderType);

        // Validate confidence range
        if (alert.getConfidence() < 0 || alert.getConfidence() > 100) {
            return ResponseEntity.badRequest()
                    .body("{\"error\": \"confidence must be between 0 and 100\"}");
        }

        // Validate image data size to prevent abuse
        if (alert.getImageData() != null && alert.getImageData().length() > MAX_IMAGE_DATA_LENGTH) {
            return ResponseEntity.badRequest()
                    .body("{\"error\": \"imageData exceeds maximum allowed size\"}");
        }

        Alert saved = alertRepository.save(alert);
        return ResponseEntity.ok(saved);
    }
}