package com.farmsecurity.backend.controller;

import com.farmsecurity.backend.model.Alert;
import com.farmsecurity.backend.repository.AlertRepository;
import com.farmsecurity.backend.service.TelegramNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = "*") 
public class AlertController {

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private TelegramNotificationService telegramService; // Swapped to Telegram

    @PostMapping
    public Alert createAlert(@RequestBody Alert newAlert) {
        // 1. Save to Database
        Alert savedAlert = alertRepository.save(newAlert);
        
        // 2. Fire the Telegram Message!
        telegramService.sendIntrusionAlert(savedAlert.getIntruderType(), savedAlert.getConfidence());
        
        return savedAlert;
    }

    @GetMapping
    public List<Alert> getAllAlerts() {
        return alertRepository.findAll();
    }
}