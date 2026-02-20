package com.familymed.prescription;

import com.familymed.prescription.entity.Prescription;
import com.familymed.prescription.entity.PrescriptionItem;
import com.familymed.prescription.repository.PrescriptionRepository;
import com.familymed.prescription.repository.PrescriptionItemRepository;
import com.familymed.careplan.entity.CarePlan;
import com.familymed.careplan.repository.CarePlanRepository;
import com.familymed.common.CurrentUserProvider;
import com.familymed.diagnosis.entity.PatientDiagnosis;
import com.familymed.diagnosis.repository.PatientDiagnosisRepository;
import com.familymed.patient.entity.Patient;
import com.familymed.patient.repository.PatientRepository;
import com.familymed.prescription.dto.PrescriptionCreateRequest;
import com.familymed.prescription.dto.PrescriptionItemCreateRequest;
import com.familymed.prescription.dto.PrescriptionItemResponse;
import com.familymed.prescription.dto.PrescriptionResponse;
import com.familymed.audit.entity.AuditActionType;
import com.familymed.audit.AuditLogService;
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
public class PrescriptionService {

    private static final Logger logger = LoggerFactory.getLogger(PrescriptionService.class);

    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionItemRepository itemRepository;
    private final PatientRepository patientRepository;
    private final PatientDiagnosisRepository diagnosisRepository;
    private final CarePlanRepository carePlanRepository;
    private final CurrentUserProvider currentUserProvider;
    private final AuditLogService auditLogService;

    @Transactional
    public PrescriptionResponse createPrescription(PrescriptionCreateRequest request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        if (request.getDiagnosisId() == null) {
            throw new RuntimeException("Diagnosis is required to create a prescription");
        }

        PatientDiagnosis diagnosis = diagnosisRepository.findById(request.getDiagnosisId())
                .orElseThrow(() -> new RuntimeException("Diagnosis not found"));

        if (!diagnosis.getPatient().getPatientId().equals(patient.getPatientId())) {
            throw new RuntimeException("Diagnosis does not belong to the patient");
        }

        CarePlan carePlan = null;
        if (request.getCarePlanId() != null) {
            carePlan = carePlanRepository.findById(request.getCarePlanId())
                    .orElseThrow(() -> new RuntimeException("Care plan not found"));

            if (!carePlan.getPatient().getPatientId().equals(patient.getPatientId())) {
                throw new RuntimeException("Care plan does not belong to the patient");
            }
        }

        UUID userId = currentUserProvider.getCurrentUser().getUserId();

        Prescription prescription = new Prescription();
        prescription.setId(UUID.randomUUID());
        prescription.setPatient(patient);
        prescription.setDiagnosis(diagnosis);
        prescription.setCarePlan(carePlan);
        prescription.setStatus(Prescription.Status.DRAFT);
        prescription.setCreatedAt(LocalDateTime.now());
        prescription.setCreatedBy(userId);

        Prescription saved = prescriptionRepository.save(prescription);

        auditLogService.logAction(
            AuditActionType.RECORD_CREATED,
            "PRESCRIPTION",
            saved.getId().toString(),
            userId);

        logger.info("PRESCRIPTION_CREATED prescriptionId={} patientId={} createdBy={}",
                saved.getId(), patient.getPatientId(), userId);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public PrescriptionResponse getPrescription(UUID id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));
        return toResponse(prescription);
    }

    @Transactional(readOnly = true)
    public List<PrescriptionResponse> getPrescriptionsByPatient(UUID patientId) {
        return prescriptionRepository.findByPatientPatientIdOrderByCreatedAtDesc(patientId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PrescriptionResponse> getActivePrescriptionsByPatient(UUID patientId) {
        return prescriptionRepository.findByPatientPatientIdAndStatusOrderByCreatedAtDesc(
                        patientId,
                        Prescription.Status.ISSUED)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public PrescriptionItemResponse addItem(UUID prescriptionId, PrescriptionItemCreateRequest request) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));

        if (prescription.getStatus() != Prescription.Status.DRAFT) {
            throw new RuntimeException("Only draft prescriptions can be updated");
        }

        UUID userId = currentUserProvider.getCurrentUser().getUserId();

        PrescriptionItem item = new PrescriptionItem();
        item.setId(UUID.randomUUID());
        item.setPrescription(prescription);
        item.setDrugName(request.getDrugName());
        item.setDosage(request.getDosage());
        item.setRoute(request.getRoute());
        item.setFrequency(request.getFrequency());
        item.setDuration(request.getDuration());
        item.setInstructions(request.getInstructions());
        item.setCreatedAt(LocalDateTime.now());
        item.setCreatedBy(userId);

        PrescriptionItem saved = itemRepository.save(item);

        auditLogService.logAction(
            AuditActionType.RECORD_CREATED,
            "PRESCRIPTION_ITEM",
            saved.getId().toString(),
            userId);

        logger.info("PRESCRIPTION_ITEM_ADDED prescriptionId={} itemId={} createdBy={}",
                prescriptionId, saved.getId(), userId);

        return PrescriptionItemResponse.fromEntity(saved);
    }

    @Transactional
    public PrescriptionResponse issuePrescription(UUID id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));

        if (prescription.getStatus() != Prescription.Status.DRAFT) {
            throw new RuntimeException("Only draft prescriptions can be issued");
        }

        long itemCount = itemRepository.countByPrescriptionId(id);
        if (itemCount == 0) {
            throw new RuntimeException("Prescription must include at least one item before issuing");
        }

        UUID userId = currentUserProvider.getCurrentUser().getUserId();

        prescription.setStatus(Prescription.Status.ISSUED);
        prescription.setIssuedAt(LocalDateTime.now());
        prescription.setUpdatedAt(LocalDateTime.now());
        prescription.setUpdatedBy(userId);

        Prescription saved = prescriptionRepository.save(prescription);

        auditLogService.logAction(
            AuditActionType.PRESCRIPTION_ISSUED,
            "PRESCRIPTION",
            saved.getId().toString(),
            userId);
        auditLogService.logAction(
            AuditActionType.RECORD_UPDATED,
            "PRESCRIPTION",
            saved.getId().toString(),
            userId);

        logger.info("PRESCRIPTION_ISSUED prescriptionId={} issuedBy={}", saved.getId(), userId);

        return toResponse(saved);
    }

    @Transactional
    public PrescriptionResponse cancelPrescription(UUID id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));

        if (prescription.getStatus() == Prescription.Status.CANCELLED) {
            throw new RuntimeException("Prescription already cancelled");
        }

        UUID userId = currentUserProvider.getCurrentUser().getUserId();

        prescription.setStatus(Prescription.Status.CANCELLED);
        prescription.setUpdatedAt(LocalDateTime.now());
        prescription.setUpdatedBy(userId);

        Prescription saved = prescriptionRepository.save(prescription);

        auditLogService.logAction(
            AuditActionType.RECORD_UPDATED,
            "PRESCRIPTION",
            saved.getId().toString(),
            userId);

        logger.info("PRESCRIPTION_CANCELLED prescriptionId={} cancelledBy={}", saved.getId(), userId);

        return toResponse(saved);
    }

    private PrescriptionResponse toResponse(Prescription prescription) {
        List<PrescriptionItemResponse> items = itemRepository.findByPrescriptionId(prescription.getId()).stream()
                .map(PrescriptionItemResponse::fromEntity)
                .toList();
        return PrescriptionResponse.fromEntity(prescription, items);
    }
}
