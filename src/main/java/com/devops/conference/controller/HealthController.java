package com.devops.conference.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    private final long startupTime = System.currentTimeMillis();

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "conference-registration-portal");
        health.put("version", "1.0.0-mvp");
        health.put("timestamp", Instant.now().toString());
        health.put("uptimeMs", System.currentTimeMillis() - startupTime);
        return ResponseEntity.ok(health);
    }
}

