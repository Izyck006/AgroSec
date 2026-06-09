package com.farmsecurity.backend.controller;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import com.farmsecurity.backend.model.Alert;
import com.farmsecurity.backend.repository.AlertRepository;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = "*") 
public class AlertController {

    @Autowired
    private AlertRepository alertRepository;

     @PostMapping
    public Alert createAlert(@RequestBody Alert alert) {
        return alertRepository.save(alert);
    }

    @GetMapping
    public List<Alert> getAllAlerts(){
        List<Alert> allAlerts = alertRepository.findAll();
        Collections.reverse(allAlerts);
        return allAlerts.stream().limit(20).collect(Collectors.toList());
    }

   
}