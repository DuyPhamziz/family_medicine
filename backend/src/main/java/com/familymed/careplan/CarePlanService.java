package com.familymed.careplan;

import com.familymed.careplan.entity.CarePlan;
import com.familymed.careplan.entity.CarePlanAction;
import com.familymed.careplan.entity.CarePlanGoal;
import com.familymed.careplan.repository.CarePlanRepository;
import com.familymed.careplan.repository.CarePlanActionRepository;
import com.familymed.careplan.repository.CarePlanGoalRepository;
import com.familymed.careplan.dto.CarePlanActionCreateRequest;
import com.familymed.careplan.dto.CarePlanActionResponse;
import com.familymed.careplan.dto.CarePlanCreateRequest;
import com.familymed.careplan.dto.CarePlanGoalCreateRequest;
import com.familymed.careplan.dto.CarePlanGoalResponse;
import com.familymed.careplan.dto.CarePlanResponse;
import com.familymed.common.CurrentUserProvider;
import com.familymed.audit.entity.AuditActionType;
import com.familymed.audit.AuditLogService;
import com.familymed.form.assessment.entity.AssessmentSession;
import com.familymed.form.assessment.repository.AssessmentSessionRepository;
import com.familymed.patient.entity.Patient;
import com.familymed.patient.repository.PatientRepository;
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
public class CarePlanService {

    private static final Logger logger = LoggerFactory.getLogger(CarePlanService.class);

    private final CarePlanRepository carePlanRepository;
    private final CarePlanGoalRepository goalRepository;
    private final CarePlanActionRepository actionRepository;
    private final PatientRepository patientRepository;
    private final AssessmentSessionRepository assessmentSessionRepository;
    private final CurrentUserProvider currentUserProvider;
        private final AuditLogService auditLogService;

    @Transactional
    public CarePlanResponse createCarePlan(CarePlanCreateRequest request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        AssessmentSession assessmentSession = null;
        if (request.getAssessmentSessionId() != null) {
            assessmentSession = assessmentSessionRepository.findById(request.getAssessmentSessionId())
                    .orElseThrow(() -> new RuntimeException("Assessment session not found"));

                        if (!assessmentSession.getPatient().getPatientId().equals(patient.getPatientId())) {
                                throw new RuntimeException("Assessment session does not belong to the patient");
                        }
        }

        UUID userId = currentUserProvider.getCurrentUser().getUserId();

        CarePlan plan = new CarePlan();
        plan.setId(UUID.randomUUID());
        plan.setPatient(patient);
        plan.setAssessmentSession(assessmentSession);
        plan.setStatus(CarePlan.Status.DRAFT);
        plan.setStartDate(request.getStartDate());
        plan.setEndDate(request.getEndDate());
        plan.setNotes(request.getNotes());
        plan.setCreatedBy(userId);
        plan.setCreatedAt(LocalDateTime.now());

        CarePlan saved = carePlanRepository.save(plan);

        auditLogService.logAction(
                AuditActionType.RECORD_CREATED,
                "CARE_PLAN",
                saved.getId().toString(),
                userId);

        logger.info("CARE_PLAN_CREATED carePlanId={} patientId={} createdBy={}",
                saved.getId(), patient.getPatientId(), userId);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public CarePlanResponse getCarePlan(UUID id) {
        CarePlan plan = carePlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Care plan not found"));
        return toResponse(plan);
    }

    @Transactional(readOnly = true)
    public List<CarePlanResponse> getCarePlansByPatient(UUID patientId) {
        return carePlanRepository.findByPatientPatientId(patientId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public CarePlanResponse updateStatus(UUID id, CarePlan.Status status) {
        CarePlan plan = carePlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Care plan not found"));

                if (status == CarePlan.Status.ACTIVE && plan.getAssessmentSession() == null) {
                        throw new RuntimeException("Care plan cannot be activated without an assessment session");
                }

        UUID userId = currentUserProvider.getCurrentUser().getUserId();

        plan.setStatus(status);
        plan.setUpdatedAt(LocalDateTime.now());
        plan.setUpdatedBy(userId);

        CarePlan saved = carePlanRepository.save(plan);

        auditLogService.logAction(
                AuditActionType.RECORD_UPDATED,
                "CARE_PLAN",
                saved.getId().toString(),
                userId);

        if (status == CarePlan.Status.ACTIVE) {
            auditLogService.logAction(
                    AuditActionType.CARE_PLAN_ACTIVATED,
                    "CARE_PLAN",
                    saved.getId().toString(),
                    userId);
        }

        logger.info("CARE_PLAN_STATUS_UPDATED carePlanId={} status={} updatedBy={}",
                saved.getId(), status, userId);

        return toResponse(saved);
    }

    @Transactional
    public CarePlanGoalResponse addGoal(UUID carePlanId, CarePlanGoalCreateRequest request) {
        CarePlan plan = carePlanRepository.findById(carePlanId)
                .orElseThrow(() -> new RuntimeException("Care plan not found"));

        UUID userId = currentUserProvider.getCurrentUser().getUserId();

        CarePlanGoal goal = new CarePlanGoal();
        goal.setId(UUID.randomUUID());
        goal.setCarePlan(plan);
        goal.setGoalDescription(request.getGoalDescription());
        goal.setTargetValue(request.getTargetValue());
        goal.setTargetDate(request.getTargetDate());
        goal.setStatus(request.getStatus() != null ? request.getStatus() : CarePlanGoal.Status.PENDING);
        goal.setCreatedAt(LocalDateTime.now());
        goal.setCreatedBy(userId);

        CarePlanGoal saved = goalRepository.save(goal);

        auditLogService.logAction(
                AuditActionType.RECORD_CREATED,
                "CARE_PLAN_GOAL",
                saved.getId().toString(),
                userId);

        logger.info("CARE_PLAN_GOAL_ADDED carePlanId={} goalId={} createdBy={}",
                carePlanId, saved.getId(), userId);

        return CarePlanGoalResponse.fromEntity(saved);
    }

    @Transactional
    public CarePlanActionResponse addAction(UUID carePlanId, CarePlanActionCreateRequest request) {
        CarePlan plan = carePlanRepository.findById(carePlanId)
                .orElseThrow(() -> new RuntimeException("Care plan not found"));

        UUID userId = currentUserProvider.getCurrentUser().getUserId();

        CarePlanAction action = new CarePlanAction();
        action.setId(UUID.randomUUID());
        action.setCarePlan(plan);
        action.setActionType(request.getActionType());
        action.setDescription(request.getDescription());
        action.setFrequency(request.getFrequency());
        action.setDuration(request.getDuration());
        action.setStatus(request.getStatus() != null ? request.getStatus() : CarePlanAction.Status.PENDING);
        action.setCreatedAt(LocalDateTime.now());
        action.setCreatedBy(userId);

        CarePlanAction saved = actionRepository.save(action);

        auditLogService.logAction(
                AuditActionType.RECORD_CREATED,
                "CARE_PLAN_ACTION",
                saved.getId().toString(),
                userId);

        logger.info("CARE_PLAN_ACTION_ADDED carePlanId={} actionId={} createdBy={}",
                carePlanId, saved.getId(), userId);

        return CarePlanActionResponse.fromEntity(saved);
    }

    private CarePlanResponse toResponse(CarePlan plan) {
        List<CarePlanGoalResponse> goals = goalRepository.findByCarePlanId(plan.getId()).stream()
                .map(CarePlanGoalResponse::fromEntity)
                .toList();
        List<CarePlanActionResponse> actions = actionRepository.findByCarePlanId(plan.getId()).stream()
                .map(CarePlanActionResponse::fromEntity)
                .toList();
        return CarePlanResponse.fromEntity(plan, goals, actions);
    }
}
