package com.devops.conference.service;

import com.devops.conference.model.Participant;
import com.devops.conference.repository.ParticipantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class RegistrationService {

    private final ParticipantRepository participantRepository;

    @Autowired
    public RegistrationService(ParticipantRepository participantRepository) {
        this.participantRepository = participantRepository;
    }

    @Transactional
    public Participant registerParticipant(Participant participant) {
        if (participantRepository.existsByEmail(participant.getEmail())) {
            throw new IllegalArgumentException("Email already registered: " + participant.getEmail());
        }

        // Generate unique formatted registration ID: CONF-2026-<random 6 digit alphanumeric>
        String regId = "CONF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        participant.setRegistrationId(regId);
        participant.setStatus("PENDING");
        participant.setCreatedAt(LocalDateTime.now());
        participant.setUpdatedAt(LocalDateTime.now());

        return participantRepository.save(participant);
    }

    public List<Participant> getAllParticipants() {
        return participantRepository.findAll();
    }

    public Optional<Participant> getParticipantByRegistrationId(String registrationId) {
        return participantRepository.findByRegistrationId(registrationId);
    }

    public Optional<Participant> getParticipantByEmail(String email) {
        return participantRepository.findByEmail(email);
    }

    @Transactional
    public Participant updateStatus(String registrationId, String newStatus) {
        Set<String> validStatuses = new HashSet<>(Arrays.asList("PENDING", "APPROVED", "REJECTED", "CHECKED_IN"));
        String normalizedStatus = newStatus.toUpperCase().trim();
        if (!validStatuses.contains(normalizedStatus)) {
            throw new IllegalArgumentException("Invalid status value: " + newStatus);
        }

        Participant participant = participantRepository.findByRegistrationId(registrationId)
                .orElseThrow(() -> new NoSuchElementException("Participant not found with Registration ID: " + registrationId));

        participant.setStatus(normalizedStatus);
        participant.setUpdatedAt(LocalDateTime.now());
        return participantRepository.save(participant);
    }

    public Map<String, Object> getRegistrationStatistics() {
        Map<String, Object> stats = new HashMap<>();
        long total = participantRepository.count();
        long pending = participantRepository.countByStatus("PENDING");
        long approved = participantRepository.countByStatus("APPROVED");
        long rejected = participantRepository.countByStatus("REJECTED");
        long checkedIn = participantRepository.countByStatus("CHECKED_IN");

        stats.put("total", total);
        stats.put("pending", pending);
        stats.put("approved", approved);
        stats.put("rejected", rejected);
        stats.put("checkedIn", checkedIn);
        stats.put("activePercentage", total > 0 ? ((double) (approved + checkedIn) / total) * 100.0 : 0.0);
        return stats;
    }
}
