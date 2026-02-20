package com.familymed.diagnosis;

import com.familymed.common.CurrentUserProvider;
import com.familymed.diagnosis.dto.CreatePatientDiagnosisRequest;
import com.familymed.diagnosis.dto.PatientDiagnosisResponse;
import com.familymed.audit.entity.AuditActionType;
import com.familymed.audit.AuditLogService;
import com.familymed.form.assessment.entity.AssessmentSession;
import com.familymed.form.assessment.repository.AssessmentSessionRepository;
import com.familymed.icd10.entity.Icd10Code;
import com.familymed.icd10.repository.Icd10CodeRepository;
import com.familymed.patient.entity.Patient;
import com.familymed.patient.repository.PatientRepository;
import com.familymed.diagnosis.entity.PatientDiagnosis;
import com.familymed.diagnosis.repository.PatientDiagnosisRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PatientDiagnosisService {

    private static final Logger logger = LoggerFactory.getLogger(PatientDiagnosisService.class);

    private final PatientRepository patientRepository;
    private final Icd10CodeRepository icd10CodeRepository;
    private final PatientDiagnosisRepository diagnosisRepository;
    private final AssessmentSessionRepository assessmentSessionRepository;
    private final CurrentUserProvider currentUserProvider;
        private final AuditLogService auditLogService;

    @Transactional
    public PatientDiagnosisResponse createDiagnosis(UUID patientId, CreatePatientDiagnosisRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        Icd10Code icd10Code = icd10CodeRepository.findById(request.getIcd10Code())
                .orElseThrow(() -> new RuntimeException("ICD-10 code not found"));

        AssessmentSession assessmentSession = null;
        if (request.getAssessmentSessionId() != null) {
            assessmentSession = assessmentSessionRepository.findById(request.getAssessmentSessionId())
                    .orElseThrow(() -> new RuntimeException("Assessment session not found"));

                        if (!assessmentSession.getPatient().getPatientId().equals(patient.getPatientId())) {
                                throw new RuntimeException("Assessment session does not belong to the patient");
                        }
        }

        UUID userId = currentUserProvider.getCurrentUser().getUserId();

        PatientDiagnosis diagnosis = new PatientDiagnosis();
        diagnosis.setId(UUID.randomUUID());
        diagnosis.setPatient(patient);
        diagnosis.setIcd10Code(icd10Code);
        diagnosis.setAssessmentSession(assessmentSession);
        diagnosis.setDiagnosisType(request.getDiagnosisType());
        diagnosis.setNotes(request.getNotes());
        diagnosis.setDiagnosedAt(request.getDiagnosedAt() != null ? request.getDiagnosedAt() : LocalDateTime.now());
        diagnosis.setCreatedAt(LocalDateTime.now());
        diagnosis.setCreatedBy(userId);

        PatientDiagnosis saved = diagnosisRepository.save(diagnosis);

        auditLogService.logAction(
                AuditActionType.RECORD_CREATED,
                "PATIENT_DIAGNOSIS",
                saved.getId().toString(),
                userId);

        logger.info("DIAGNOSIS_CREATED diagnosisId={} patientId={} icd10={} createdBy={}",
                saved.getId(), patientId, icd10Code.getCode(), userId);

        return PatientDiagnosisResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<PatientDiagnosisResponse> getDiagnosesByPatient(UUID patientId) {
        return diagnosisRepository.findByPatientPatientIdOrderByDiagnosedAtDesc(patientId).stream()
                .map(PatientDiagnosisResponse::fromEntity)
                .toList();
    }
}
