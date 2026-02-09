package com.familymed.patient.service;

import com.familymed.patient.Patient;
import com.familymed.patient.PatientRepository;
import com.familymed.patient.dto.CreatePatientRequest;
import com.familymed.patient.dto.PatientDTO;
import com.familymed.user.User;
import com.familymed.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class PatientService {
    
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    
    public PatientDTO createPatient(CreatePatientRequest request, UUID doctorId) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        
        Patient patient = new Patient();
        patient.setPatientCode(request.getPatientCode());
        patient.setFullName(request.getFullName());
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setGender(Patient.Gender.valueOf(request.getGender()));
        patient.setPhoneNumber(request.getPhoneNumber());
        patient.setEmail(request.getEmail());
        patient.setAddress(request.getAddress());
        patient.setMedicalHistory(request.getMedicalHistory());
        patient.setCurrentMedications(request.getCurrentMedications());
        patient.setAllergies(request.getAllergies());
        patient.setNotes(request.getNotes());
        patient.setDoctor(doctor);
        patient.setStatus(Patient.PatientStatus.ACTIVE);
        
        Patient savedPatient = patientRepository.save(patient);
        return PatientDTO.fromPatient(savedPatient);
    }
    
    public PatientDTO getPatient(UUID patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        return PatientDTO.fromPatient(patient);
    }
    
    public List<PatientDTO> getPatientsByDoctor(UUID doctorId) {
        List<Patient> patients = patientRepository.findByDoctorUserId(doctorId);
        return patients.stream().map(PatientDTO::fromPatient).toList();
    }
    
    public PatientDTO updatePatient(UUID patientId, CreatePatientRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        
        patient.setFullName(request.getFullName());
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setGender(Patient.Gender.valueOf(request.getGender()));
        patient.setPhoneNumber(request.getPhoneNumber());
        patient.setEmail(request.getEmail());
        patient.setAddress(request.getAddress());
        patient.setMedicalHistory(request.getMedicalHistory());
        patient.setCurrentMedications(request.getCurrentMedications());
        patient.setAllergies(request.getAllergies());
        patient.setNotes(request.getNotes());
        
        Patient updatedPatient = patientRepository.save(patient);
        return PatientDTO.fromPatient(updatedPatient);
    }
    
    public void deletePatient(UUID patientId) {
        patientRepository.deleteById(patientId);
    }
}
