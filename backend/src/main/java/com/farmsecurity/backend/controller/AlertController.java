package com.farmsecurity.backend.controller;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import com.farmsecurity.backend.model.Alert;
import com.farmsecurity.backend.repository.AlertRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = "*") 
public class AlertController {

    @Autowired
    private AlertRepository alertRepository;

    // 1. The React Dashboard uses this to GET the data
    @GetMapping
    public List<Alert> getAllAlerts() {
        List<Alert> allAlerts = alertRepository.findAll();
        Collections.reverse(allAlerts);
        return allAlerts.stream().limit(20).collect(Collectors.toList());
    }

    // 2. The Python Edge Node uses this to POST new alerts
    @PostMapping
    public Alert createAlert(@RequestBody Alert alert) {
        return alertRepository.save(alert);
    }
}