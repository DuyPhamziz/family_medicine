package com.familymed.patient;

import com.familymed.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "patients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Patient {
    
    @Id
    @Column(name = "patient_id", columnDefinition = "UUID")
    private UUID patientId;
    
    @Column(unique = true, nullable = false)
    private String patientCode; // Mã bệnh nhân
    
    @Column(nullable = false)
    private String fullName;
    
    @Column(nullable = false)
    private LocalDate dateOfBirth;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Gender gender;
    
    private String phoneNumber;
    
    private String email;
    
    private String address;
    
    private String medicalHistory; // Tiền sử bệnh
    
    private String currentMedications; // Thuốc đang dùng
    
    private String allergies; // Dị ứng
    
    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private User doctor; // Bác sĩ phụ trách
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private PatientStatus status = PatientStatus.ACTIVE;
    
    private String notes;
    
    public enum Gender {
        MALE,
        FEMALE,
        OTHER
    }
    
    public enum PatientStatus {
        ACTIVE,
        INACTIVE,
        ARCHIVED
    }
}

