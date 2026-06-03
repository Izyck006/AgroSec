package com.farmsecurity.backend.controller;


import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import com.farmsecurity.backend.model.Alert;
import com.farmsecurity.backend.repository.AlertRepository;
import com.farmsecurity.backend.service.TelegramNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = "*") 
public class AlertController {

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private TelegramNotificationService telegramService; 

    @PostMapping
    public Alert createAlert(@RequestBody Alert newAlert) {
       
        Alert savedAlert = alertRepository.save(newAlert);
        

        telegramService.sendIntrusionAlert(savedAlert.getIntruderType(), savedAlert.getConfidence());
        
        return savedAlert;
    }
    @GetMapping
    public List<Alert> getAllAlerts(){
        List<Alert> allAlerts = alertRepository.findAll();
        Collections.reverse(allAlerts);
        return allAlerts.stream().limit(20).collect(Collectors.toList());
    }
}