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
@CrossOrigin(origins = "*") // Allows your React/JS frontend to fetch data seamlessly
public class IntrusionController {

    @Autowired
    private IntrusionRepository intrusionRepository;

    /**
     * Endpoint for the Phone-to-Edge script to submit real-time threat captures.
     */
    @PostMapping
    public ResponseEntity<IntrusionLog> receiveIntrusionAlert(@RequestBody IntrusionLog log) {
        // Automatically enforce server-side timestamp for accurate tracking
        log.setTimestamp(LocalDateTime.now());
        log.setStatus("DETERRED"); // Defaulting to deterred as edge code fires strobe lights instantly
        
        IntrusionLog savedLog = intrusionRepository.save(log);
        System.out.println("[SERVER LOG] High alert saved: " + savedLog.getIntruderType() + " detected at " + savedLog.getTimestamp());
        
        return ResponseEntity.ok(savedLog);
    }

    /**
     * Endpoint for the Frontend Dashboard to read the live system logs.
     */
    @GetMapping("/recent")
    public ResponseEntity<List<IntrusionLog>> getRecentLogs() {
        return ResponseEntity.ok(intrusionRepository.findTop10ByOrderByTimestampDesc());
    }
}