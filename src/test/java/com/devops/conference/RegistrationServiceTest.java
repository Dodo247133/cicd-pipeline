package com.devops.conference;

import com.devops.conference.model.Participant;
import com.devops.conference.repository.ParticipantRepository;
import com.devops.conference.service.RegistrationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RegistrationServiceTest {

    @Mock
    private ParticipantRepository participantRepository;

    @InjectMocks
    private RegistrationService registrationService;

    private Participant testParticipant;

    @BeforeEach
    void setUp() {
        testParticipant = new Participant();
        testParticipant.setId(1L);
        testParticipant.setRegistrationId("CONF-ABC12345");
        testParticipant.setFullName("Ada Lovelace");
        testParticipant.setEmail("ada.lovelace@devopsconf.org");
        testParticipant.setAffiliation("Computing Pioneers Institute");
        testParticipant.setTicketType("Speaker");
        testParticipant.setTrack("AI & Data");
        testParticipant.setStatus("PENDING");
        testParticipant.setCreatedAt(LocalDateTime.now());
    }

    @Test
    @DisplayName("Should successfully register participant and assign registration ID")
    void testSuccessfulRegistration() {
        when(participantRepository.existsByEmail("ada.lovelace@devopsconf.org")).thenReturn(false);
        when(participantRepository.save(any(Participant.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Participant saved = registrationService.registerParticipant(testParticipant);

        assertNotNull(saved);
        assertNotNull(saved.getRegistrationId());
        assertTrue(saved.getRegistrationId().startsWith("CONF-"));
        assertEquals("PENDING", saved.getStatus());
        verify(participantRepository, times(1)).save(any(Participant.class));
    }

    @Test
    @DisplayName("Should reject registration when email already exists")
    void testDuplicateEmailRegistration() {
        when(participantRepository.existsByEmail("ada.lovelace@devopsconf.org")).thenReturn(true);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            registrationService.registerParticipant(testParticipant);
        });

        assertTrue(ex.getMessage().contains("Email already registered"));
        verify(participantRepository, never()).save(any(Participant.class));
    }

    @Test
    @DisplayName("Should update participant status to APPROVED")
    void testUpdateStatusToApproved() {
        when(participantRepository.findByRegistrationId("CONF-ABC12345")).thenReturn(Optional.of(testParticipant));
        when(participantRepository.save(any(Participant.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Participant updated = registrationService.updateStatus("CONF-ABC12345", "APPROVED");

        assertEquals("APPROVED", updated.getStatus());
        verify(participantRepository, times(1)).save(testParticipant);
    }

    @Test
    @DisplayName("Should throw exception when updating status with invalid value")
    void testInvalidStatusUpdate() {
        assertThrows(IllegalArgumentException.class, () -> {
            registrationService.updateStatus("CONF-ABC12345", "UNKNOWN_STATUS");
        });
    }

    @Test
    @DisplayName("Should return registration statistics correctly")
    void testRegistrationStatistics() {
        when(participantRepository.count()).thenReturn(10L);
        when(participantRepository.countByStatus("PENDING")).thenReturn(4L);
        when(participantRepository.countByStatus("APPROVED")).thenReturn(5L);
        when(participantRepository.countByStatus("REJECTED")).thenReturn(1L);
        when(participantRepository.countByStatus("CHECKED_IN")).thenReturn(0L);

        Map<String, Object> stats = registrationService.getRegistrationStatistics();

        assertEquals(10L, stats.get("total"));
        assertEquals(4L, stats.get("pending"));
        assertEquals(5L, stats.get("approved"));
        assertEquals(1L, stats.get("rejected"));
        assertEquals(50.0, (Double) stats.get("activePercentage"));
    }
}
