package com.devops.conference.repository;

import com.devops.conference.model.Participant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParticipantRepository extends JpaRepository<Participant, Long> {
    Optional<Participant> findByRegistrationId(String registrationId);
    Optional<Participant> findByEmail(String email);
    boolean existsByEmail(String email);
    List<Participant> findByStatus(String status);
    List<Participant> findByTrack(String track);
    long countByStatus(String status);
}
