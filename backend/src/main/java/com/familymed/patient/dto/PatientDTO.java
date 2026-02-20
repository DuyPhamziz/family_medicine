package com.familymed.patient.dto;

import com.familymed.patient.entity.Patient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientDTO {
    private UUID patientId;
    private String patientCode;
    private String fullName;
    private LocalDate dateOfBirth;
    private Integer age;
    private String gender;
    private String phoneNumber;
    private String email;
    private String address;
    private String medicalHistory;
    private String currentMedications;
    private String allergies;
    private String status;
    private String notes;
    private UUID doctorId;
    
    public static PatientDTO fromPatient(Patient patient) {
        int age = 0;
        if (patient.getDateOfBirth() != null) {
            age = java.time.LocalDate.now().getYear() - patient.getDateOfBirth().getYear();
        }
        
        return PatientDTO.builder()
                .patientId(patient.getPatientId())
                .patientCode(patient.getPatientCode())
                .fullName(patient.getFullName())
                .dateOfBirth(patient.getDateOfBirth())
                .age(age)
                .gender(patient.getGender().name())
                .phoneNumber(patient.getPhoneNumber())
                .email(patient.getEmail())
                .address(patient.getAddress())
                .medicalHistory(patient.getMedicalHistory())
                .currentMedications(patient.getCurrentMedications())
                .allergies(patient.getAllergies())
                .status(patient.getStatus().name())
                .notes(patient.getNotes())
                .doctorId(patient.getDoctor() != null ? patient.getDoctor().getUserId() : null)
                .build();
    }
}

