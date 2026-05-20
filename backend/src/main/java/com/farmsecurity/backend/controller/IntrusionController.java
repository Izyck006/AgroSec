package com.farmsecurity.backend.controller;

import com.farmsecurity.backend.model.IntrusionLog;
import com.farmsecurity.backend.repository.IntrusionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = "*")
public class IntrusionController {

    @Autowired
    private IntrusionRepository intrusionRepository;


    @PostMapping
    public ResponseEntity<IntrusionLog> receiveIntrusionAlert(@RequestBody IntrusionLog log) {
        
        log.setTimestamp(LocalDateTime.now());
        log.setStatus("DETERRED"); 
        IntrusionLog savedLog = intrusionRepository.save(log);
        System.out.println("[SERVER LOG] High alert saved: " + savedLog.getIntruderType() + " detected at " + savedLog.getTimestamp());
        
        return ResponseEntity.ok(savedLog);
    }

  
    @GetMapping("/recent")
    public ResponseEntity<List<IntrusionLog>> getRecentLogs() {
        return ResponseEntity.ok(intrusionRepository.findTop10ByOrderByTimestampDesc());
    }
}