package com.devops.conference.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "participants")
public class Participant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 32)
    private String registrationId;

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    @Column(nullable = false, length = 100)
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Valid email address is required")
    @Column(nullable = false, unique = true, length = 120)
    private String email;

    @NotBlank(message = "Affiliation/Organization is required")
    @Column(nullable = false, length = 150)
    private String affiliation;

    @NotBlank(message = "Ticket type is required")
    @Column(nullable = false, length = 50)
    private String ticketType; // Standard, VIP, Student, Speaker

    @NotBlank(message = "Conference track is required")
    @Column(nullable = false, length = 50)
    private String track; // DevOps & Cloud, AI & Data, Security & Governance

    @Column(length = 100)
    private String dietaryRequirement;

    @Column(nullable = false, length = 30)
    private String status; // PENDING, APPROVED, REJECTED, CHECKED_IN

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    public Participant() {
        this.status = "PENDING";
        this.createdAt = LocalDateTime.now();
    }

    public Participant(String registrationId, String fullName, String email, String affiliation, 
                       String ticketType, String track, String dietaryRequirement) {
        this.registrationId = registrationId;
        this.fullName = fullName;
        this.email = email;
        this.affiliation = affiliation;
        this.ticketType = ticketType;
        this.track = track;
        this.dietaryRequirement = dietaryRequirement;
        this.status = "PENDING";
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = "PENDING";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRegistrationId() { return registrationId; }
    public void setRegistrationId(String registrationId) { this.registrationId = registrationId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAffiliation() { return affiliation; }
    public void setAffiliation(String affiliation) { this.affiliation = affiliation; }

    public String getTicketType() { return ticketType; }
    public void setTicketType(String ticketType) { this.ticketType = ticketType; }

    public String getTrack() { return track; }
    public void setTrack(String track) { this.track = track; }

    public String getDietaryRequirement() { return dietaryRequirement; }
    public void setDietaryRequirement(String dietaryRequirement) { this.dietaryRequirement = dietaryRequirement; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

