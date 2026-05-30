package com.farmsecurity.backend.controller;

import com.farmsecurity.backend.model.Alert;
import com.farmsecurity.backend.repository.AlertRepository;
import com.farmsecurity.backend.service.SmsNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = "*") // Allows your React dashboard to fetch the data
public class AlertController {

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private SmsNotificationService smsService;

    // This handles the Python script sending a new threat
    @PostMapping
    public Alert createAlert(@RequestBody Alert newAlert) {
        // Save to Database
        Alert savedAlert = alertRepository.save(newAlert);
        
        // Fire the SMS
        smsService.sendIntrusionAlert(savedAlert.getIntruderType(), savedAlert.getConfidence());
        
        return savedAlert;
    }

    // This handles the React Dashboard asking for the logs
    @GetMapping
    public List<Alert> getAllAlerts() {
        return alertRepository.findAll();
    }
}