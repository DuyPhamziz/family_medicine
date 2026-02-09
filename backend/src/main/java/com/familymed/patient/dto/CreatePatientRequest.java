package com.familymed.patient.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreatePatientRequest {
    private String patientCode;
    private String fullName;
    private LocalDate dateOfBirth;
    private String gender; // MALE, FEMALE, OTHER
    private String phoneNumber;
    private String email;
    private String address;
    private String medicalHistory;
    private String currentMedications;
    private String allergies;
    private String notes;
}
