package com.familymed.patient.service;

import com.familymed.patient.entity.Patient;
import com.familymed.patient.repository.PatientRepository;
import com.familymed.patient.dto.CreatePatientRequest;
import com.familymed.patient.dto.PatientDTO;
import com.familymed.audit.entity.AuditActionType;
import com.familymed.audit.AuditLogService;
import com.familymed.common.CurrentUserProvider;
import com.familymed.user.entity.User;
import com.familymed.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;
    private final CurrentUserProvider currentUserProvider;

    @Transactional
    public PatientDTO createPatient(CreatePatientRequest request, UUID doctorId) {
        String patientCode = request.getPatientCode();
        if (patientCode == null || patientCode.trim().isEmpty()) {
            patientCode = generatePatientCode();
        }

        if (patientRepository.findByPatientCode(patientCode).isPresent()) {
            throw new RuntimeException("Mã bệnh nhân đã tồn tại: " + patientCode);
        }

        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Bác sĩ không tồn tại"));

        Patient patient = new Patient();
        patient.setPatientId(UUID.randomUUID());
        patient.setPatientCode(patientCode);
        patient.setFullName(request.getFullName());
        patient.setDateOfBirth(request.getDateOfBirth());
        
        try {
            patient.setGender(Patient.Gender.valueOf(request.getGender()));
        } catch (IllegalArgumentException e) {
            patient.setGender(Patient.Gender.OTHER);
        }

        patient.setPhoneNumber(request.getPhoneNumber());
        patient.setEmail(request.getEmail());
        patient.setAddress(request.getAddress());
        patient.setMedicalHistory(request.getMedicalHistory());
        patient.setCurrentMedications(request.getCurrentMedications());
        patient.setAllergies(request.getAllergies());
        patient.setDoctor(doctor);
        patient.setNotes(request.getNotes());
        patient.setStatus(Patient.PatientStatus.ACTIVE);

        Patient savedPatient = patientRepository.save(patient);
        auditLogService.logAction(
            AuditActionType.RECORD_CREATED,
            "PATIENT",
            savedPatient.getPatientId().toString(),
            doctorId);
        return PatientDTO.fromPatient(savedPatient);
    }

    private String generatePatientCode() {
        String datePrefix = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        String prefix = datePrefix;

        int nextNumber = 1;
        var latest = patientRepository.findTopByPatientCodeStartingWithOrderByPatientCodeDesc(prefix);
        if (latest.isPresent()) {
            String latestCode = latest.get().getPatientCode();
            if (latestCode != null && latestCode.length() >= 12) {
                String suffix = latestCode.substring(latestCode.length() - 4);
                try {
                    nextNumber = Integer.parseInt(suffix) + 1;
                } catch (NumberFormatException ignored) {
                    nextNumber = 1;
                }
            }
        }

        if (nextNumber > 9999) {
            throw new RuntimeException("Vượt quá giới hạn mã bệnh nhân trong ngày");
        }

        return String.format("%s%04d", prefix, nextNumber);
    }

    public PatientDTO getPatient(UUID patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Bệnh nhân không tìm thấy"));
        return PatientDTO.fromPatient(patient);
    }

    public List<PatientDTO> getPatientsByDoctor(UUID doctorId) {
        return patientRepository.findByDoctorUserId(doctorId).stream()
                .map(PatientDTO::fromPatient)
                .collect(Collectors.toList());
    }

    @Transactional
    public PatientDTO updatePatient(UUID patientId, CreatePatientRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Bệnh nhân không tìm thấy"));

        patient.setFullName(request.getFullName());
        patient.setDateOfBirth(request.getDateOfBirth());
        
        try {
            patient.setGender(Patient.Gender.valueOf(request.getGender()));
        } catch (IllegalArgumentException e) {
            // Keep old value or set to OTHER? Let's update if valid
        }

        patient.setPhoneNumber(request.getPhoneNumber());
        patient.setEmail(request.getEmail());
        patient.setAddress(request.getAddress());
        patient.setMedicalHistory(request.getMedicalHistory());
        patient.setCurrentMedications(request.getCurrentMedications());
        patient.setAllergies(request.getAllergies());
        patient.setNotes(request.getNotes());

        Patient updatedPatient = patientRepository.save(patient);
        auditLogService.logAction(
            AuditActionType.RECORD_UPDATED,
            "PATIENT",
            updatedPatient.getPatientId().toString(),
            currentUserProvider.getCurrentUser().getUserId());
        return PatientDTO.fromPatient(updatedPatient);
    }

    @Transactional
    public void deletePatient(UUID patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Bệnh nhân không tìm thấy"));
        // Soft delete
        patient.setStatus(Patient.PatientStatus.INACTIVE);
        patientRepository.save(patient);
        auditLogService.logAction(
            AuditActionType.RECORD_UPDATED,
            "PATIENT",
            patient.getPatientId().toString(),
            currentUserProvider.getCurrentUser().getUserId());
    }
}
