package com.familymed.medicalrecord;

import com.familymed.appointment.repository.AppointmentRepository;
import com.familymed.appointment.dto.AppointmentResponse;
import com.familymed.careplan.entity.CarePlan;
import com.familymed.careplan.repository.CarePlanActionRepository;
import com.familymed.careplan.repository.CarePlanGoalRepository;
import com.familymed.careplan.repository.CarePlanRepository;
import com.familymed.careplan.dto.CarePlanActionResponse;
import com.familymed.careplan.dto.CarePlanGoalResponse;
import com.familymed.careplan.dto.CarePlanResponse;
import com.familymed.diagnosis.repository.PatientDiagnosisRepository;
import com.familymed.diagnosis.dto.PatientDiagnosisResponse;
import com.familymed.form.assessment.entity.AssessmentAnswer;
import com.familymed.form.assessment.repository.AssessmentAnswerRepository;
import com.familymed.form.assessment.entity.AssessmentSession;
import com.familymed.form.assessment.repository.AssessmentSessionRepository;
import com.familymed.form.service.RiskCalculationService;
import com.familymed.medicalrecord.dto.AssessmentHistoryItem;
import com.familymed.medicalrecord.dto.MedicalRecordResponse;
import com.familymed.medicalrecord.dto.MedicalRecordTimelineEvent;
import com.familymed.medicalrecord.dto.RiskHistoryItem;
import com.familymed.patient.entity.Patient;
import com.familymed.patient.repository.PatientRepository;
import com.familymed.patient.dto.PatientDTO;
import com.familymed.prescription.entity.Prescription;
import com.familymed.prescription.repository.PrescriptionItemRepository;
import com.familymed.prescription.repository.PrescriptionRepository;
import com.familymed.prescription.dto.PrescriptionItemResponse;
import com.familymed.prescription.dto.PrescriptionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicalRecordServiceImpl implements MedicalRecordService {

    private final PatientRepository patientRepository;
    private final AssessmentSessionRepository sessionRepository;
    private final AssessmentAnswerRepository answerRepository;
    private final RiskCalculationService riskCalculationService;
    private final PatientDiagnosisRepository diagnosisRepository;
    private final CarePlanRepository carePlanRepository;
    private final CarePlanGoalRepository carePlanGoalRepository;
    private final CarePlanActionRepository carePlanActionRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionItemRepository prescriptionItemRepository;
    private final AppointmentRepository appointmentRepository;

    @Override
    @Transactional(readOnly = true)
    public MedicalRecordResponse getMedicalRecord(UUID patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        PatientDTO demographics = PatientDTO.fromPatient(patient);

        List<AssessmentSession> sessions = sessionRepository.findByPatientOrderByStartedAtAsc(patientId);
        List<AssessmentHistoryItem> assessmentHistory = sessions.stream()
                .map(AssessmentHistoryItem::fromEntity)
                .toList();

        List<RiskHistoryItem> riskHistory = buildRiskHistory(sessions);

        List<PatientDiagnosisResponse> diagnosisHistory = diagnosisRepository.findByPatientWithCode(patientId)
                .stream()
                .map(PatientDiagnosisResponse::fromEntity)
                .toList();

        List<CarePlanResponse> carePlans = buildCarePlans(patientId);

        List<PrescriptionResponse> prescriptionHistory = buildPrescriptions(patientId);

        List<AppointmentResponse> appointmentHistory = appointmentRepository.findByPatientWithPractitioner(patientId)
                .stream()
                .map(AppointmentResponse::fromEntity)
                .toList();

        List<MedicalRecordTimelineEvent> timeline = buildTimeline(
                assessmentHistory,
                riskHistory,
                diagnosisHistory,
                carePlans,
                prescriptionHistory,
                appointmentHistory);

        return MedicalRecordResponse.builder()
                .demographics(demographics)
                .assessmentHistory(assessmentHistory)
                .riskHistory(riskHistory)
                .diagnosisHistory(diagnosisHistory)
                .carePlans(carePlans)
                .prescriptionHistory(prescriptionHistory)
                .appointmentHistory(appointmentHistory)
                .timeline(timeline)
                .generatedAt(LocalDateTime.now())
                .build();
    }

    private List<RiskHistoryItem> buildRiskHistory(List<AssessmentSession> sessions) {
        List<AssessmentSession> completedSessions = sessions.stream()
                .filter(session -> session.getStatus() == AssessmentSession.SessionStatus.COMPLETED)
                .toList();

        if (completedSessions.isEmpty()) {
            return List.of();
        }

        List<UUID> sessionIds = completedSessions.stream()
                .map(AssessmentSession::getSessionId)
                .toList();

        List<AssessmentAnswer> answers = answerRepository.findBySessionIdsWithSession(sessionIds);
        Map<UUID, List<AssessmentAnswer>> answersBySession = answers.stream()
                .collect(Collectors.groupingBy(answer -> answer.getSession().getSessionId()));

        List<RiskHistoryItem> riskHistory = new ArrayList<>();

        for (AssessmentSession session : completedSessions) {
            Map<String, Object> answerMap = buildAnswerMap(answersBySession.get(session.getSessionId()));
            if (answerMap.isEmpty()) {
                continue;
            }

            Map<String, Object> risk = riskCalculationService.calculateRisk(session.getForm().getFormName(), answerMap);
            Double riskPercentage = parseRiskPercentage(risk.get("riskPercentage"));
            String riskLevel = risk.get("riskLevel") != null ? risk.get("riskLevel").toString() : null;

            riskHistory.add(RiskHistoryItem.builder()
                    .sessionId(session.getSessionId())
                    .formName(session.getForm().getFormName())
                    .riskPercentage(riskPercentage)
                    .riskLevel(riskLevel)
                    .calculatedAt(session.getCompletedAt())
                    .build());
        }

        return riskHistory.stream()
                .sorted(Comparator.comparing(RiskHistoryItem::getCalculatedAt, Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();
    }

    private Map<String, Object> buildAnswerMap(List<AssessmentAnswer> answers) {
        if (answers == null || answers.isEmpty()) {
            return Map.of();
        }

        Map<String, Object> answerMap = new LinkedHashMap<>();
        answers.stream()
                .sorted(Comparator.comparing(AssessmentAnswer::getAnsweredAt).reversed())
                .forEach(answer -> {
                    if (answer.getQuestionCode() == null) {
                        return;
                    }
                    answerMap.putIfAbsent(answer.getQuestionCode(), answer.getAnswerValue());
                });

        return answerMap;
    }

    private Double parseRiskPercentage(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        try {
            return Double.parseDouble(value.toString());
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private List<CarePlanResponse> buildCarePlans(UUID patientId) {
        List<CarePlan> carePlans = carePlanRepository.findByPatientWithPatient(patientId);
        if (carePlans.isEmpty()) {
            return List.of();
        }

        List<UUID> carePlanIds = carePlans.stream()
                .map(CarePlan::getId)
                .toList();

        Map<UUID, List<CarePlanGoalResponse>> goalsByPlan = carePlanGoalRepository
                .findByCarePlanIdIn(carePlanIds)
                .stream()
                .collect(Collectors.groupingBy(
                        goal -> goal.getCarePlan().getId(),
                        Collectors.mapping(CarePlanGoalResponse::fromEntity, Collectors.toList())));

        Map<UUID, List<CarePlanActionResponse>> actionsByPlan = carePlanActionRepository
                .findByCarePlanIdIn(carePlanIds)
                .stream()
                .collect(Collectors.groupingBy(
                        action -> action.getCarePlan().getId(),
                        Collectors.mapping(CarePlanActionResponse::fromEntity, Collectors.toList())));

        return carePlans.stream()
                .map(plan -> CarePlanResponse.fromEntity(
                        plan,
                        goalsByPlan.getOrDefault(plan.getId(), List.of()),
                        actionsByPlan.getOrDefault(plan.getId(), List.of())))
                .toList();
    }

    private List<PrescriptionResponse> buildPrescriptions(UUID patientId) {
        List<Prescription> prescriptions = prescriptionRepository.findByPatientWithJoins(patientId);
        if (prescriptions.isEmpty()) {
            return List.of();
        }

        List<UUID> prescriptionIds = prescriptions.stream()
                .map(Prescription::getId)
                .toList();

        Map<UUID, List<PrescriptionItemResponse>> itemsByPrescription = prescriptionItemRepository
                .findByPrescriptionIdIn(prescriptionIds)
                .stream()
                .collect(Collectors.groupingBy(
                        item -> item.getPrescription().getId(),
                        Collectors.mapping(PrescriptionItemResponse::fromEntity, Collectors.toList())));

        return prescriptions.stream()
                .map(prescription -> PrescriptionResponse.fromEntity(
                        prescription,
                        itemsByPrescription.getOrDefault(prescription.getId(), List.of())))
                .toList();
    }

    private List<MedicalRecordTimelineEvent> buildTimeline(
            List<AssessmentHistoryItem> assessments,
            List<RiskHistoryItem> risks,
            List<PatientDiagnosisResponse> diagnoses,
            List<CarePlanResponse> carePlans,
            List<PrescriptionResponse> prescriptions,
            List<AppointmentResponse> appointments) {
        List<MedicalRecordTimelineEvent> events = new ArrayList<>();

        for (AssessmentHistoryItem assessment : assessments) {
            Map<String, Object> data = new HashMap<>();
            data.put("status", assessment.getStatus());
            data.put("completedAt", assessment.getCompletedAt());
            events.add(MedicalRecordTimelineEvent.builder()
                    .eventType("ASSESSMENT")
                    .eventTime(assessment.getStartedAt())
                    .title(assessment.getFormName())
                    .referenceId(assessment.getSessionId())
                    .data(data)
                    .build());
        }

        for (RiskHistoryItem risk : risks) {
            Map<String, Object> data = new HashMap<>();
            data.put("riskPercentage", risk.getRiskPercentage());
            data.put("riskLevel", risk.getRiskLevel());
            events.add(MedicalRecordTimelineEvent.builder()
                    .eventType("RISK")
                    .eventTime(risk.getCalculatedAt())
                    .title(risk.getFormName())
                    .referenceId(risk.getSessionId())
                    .data(data)
                    .build());
        }

        for (PatientDiagnosisResponse diagnosis : diagnoses) {
            Map<String, Object> data = new HashMap<>();
            data.put("icd10", diagnosis.getIcd10Code());
            data.put("type", diagnosis.getDiagnosisType());
            events.add(MedicalRecordTimelineEvent.builder()
                    .eventType("DIAGNOSIS")
                    .eventTime(diagnosis.getDiagnosedAt())
                    .title(diagnosis.getIcd10Description())
                    .referenceId(diagnosis.getId())
                    .data(data)
                    .build());
        }

        for (CarePlanResponse carePlan : carePlans) {
            Map<String, Object> data = new HashMap<>();
            data.put("status", carePlan.getStatus());
            data.put("startDate", carePlan.getStartDate());
            data.put("endDate", carePlan.getEndDate());
            events.add(MedicalRecordTimelineEvent.builder()
                    .eventType("CARE_PLAN")
                    .eventTime(carePlan.getCreatedAt())
                    .title(carePlan.getStatus().name())
                    .referenceId(carePlan.getId())
                    .data(data)
                    .build());
        }

        for (PrescriptionResponse prescription : prescriptions) {
            LocalDateTime eventTime = prescription.getIssuedAt() != null
                    ? prescription.getIssuedAt()
                    : prescription.getCreatedAt();

            Map<String, Object> data = new HashMap<>();
            data.put("status", prescription.getStatus());
            data.put("issuedAt", prescription.getIssuedAt());

            events.add(MedicalRecordTimelineEvent.builder()
                    .eventType("PRESCRIPTION")
                    .eventTime(eventTime)
                    .title(prescription.getStatus().name())
                    .referenceId(prescription.getId())
                    .data(data)
                    .build());
        }

        for (AppointmentResponse appointment : appointments) {
            Map<String, Object> data = new HashMap<>();
            data.put("status", appointment.getStatus());
            data.put("scheduledEnd", appointment.getScheduledEnd());
            events.add(MedicalRecordTimelineEvent.builder()
                    .eventType("APPOINTMENT")
                    .eventTime(appointment.getScheduledStart())
                    .title(appointment.getStatus().name())
                    .referenceId(appointment.getId())
                    .data(data)
                    .build());
        }

        return events.stream()
                .sorted(Comparator.comparing(MedicalRecordTimelineEvent::getEventTime,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();
    }
}
