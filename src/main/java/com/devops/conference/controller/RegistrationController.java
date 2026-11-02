package com.devops.conference.controller;

import com.devops.conference.model.Participant;
import com.devops.conference.service.RegistrationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class RegistrationController {

    private final RegistrationService registrationService;

    @Autowired
    public RegistrationController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody Participant participant) {
        try {
            Participant saved = registrationService.registerParticipant(participant);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Registration submitted successfully!");
            response.put("registrationId", saved.getRegistrationId());
            response.put("participant", saved);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/participants")
    public ResponseEntity<List<Participant>> getParticipants(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String track) {
        List<Participant> list = registrationService.getAllParticipants();

        if (status != null && !status.isEmpty()) {
            list = list.stream().filter(p -> p.getStatus().equalsIgnoreCase(status)).toList();
        }
        if (track != null && !track.isEmpty()) {
            list = list.stream().filter(p -> p.getTrack().equalsIgnoreCase(track)).toList();
        }

        return ResponseEntity.ok(list);
    }

    @GetMapping("/participants/{registrationId}")
    public ResponseEntity<?> getParticipant(@PathVariable String registrationId) {
        return registrationService.getParticipantByRegistrationId(registrationId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/track/{query}")
    public ResponseEntity<?> trackStatus(@PathVariable String query) {
        Optional<Participant> participant = registrationService.getParticipantByRegistrationId(query);
        if (participant.isEmpty()) {
            participant = registrationService.getParticipantByEmail(query);
        }

        if (participant.isPresent()) {
            return ResponseEntity.ok(participant.get());
        } else {
            Map<String, String> err = new HashMap<>();
            err.put("error", "No registration record found for query: " + query);
            return new ResponseEntity<>(err, HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/participants/{registrationId}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String registrationId,
                                          @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        if (newStatus == null || newStatus.trim().isEmpty()) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Status field is required");
            return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
        }

        try {
            Participant updated = registrationService.updateStatus(registrationId, newStatus);
            Map<String, Object> resp = new HashMap<>();
            resp.put("message", "Status updated successfully");
            resp.put("participant", updated);
            return ResponseEntity.ok(resp);
        } catch (NoSuchElementException e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return new ResponseEntity<>(err, HttpStatus.NOT_FOUND);
        } catch (IllegalArgumentException e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        return ResponseEntity.ok(registrationService.getRegistrationStatistics());
    }
}
