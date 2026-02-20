package com.familymed.dashboard;

import com.familymed.appointment.repository.AppointmentRepository;
import com.familymed.careplan.entity.CarePlan;
import com.familymed.careplan.repository.CarePlanRepository;
import com.familymed.common.CurrentUserProvider;
import com.familymed.dashboard.dto.AppointmentSummary;
import com.familymed.dashboard.dto.AssessmentSummary;
import com.familymed.dashboard.dto.CarePlanSummary;
import com.familymed.dashboard.dto.DoctorDashboardResponse;
import com.familymed.dashboard.dto.HighRiskPatientSummary;
import com.familymed.dashboard.dto.PrescriptionSummary;
import com.familymed.form.assessment.entity.AssessmentAnswer;
import com.familymed.form.assessment.repository.AssessmentAnswerRepository;
import com.familymed.form.assessment.entity.AssessmentSession;
import com.familymed.form.assessment.repository.AssessmentSessionRepository;
import com.familymed.form.service.RiskCalculationService;
import com.familymed.prescription.entity.Prescription;
import com.familymed.prescription.repository.PrescriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
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
public class DoctorDashboardServiceImpl implements DoctorDashboardService {

    private static final int LIST_LIMIT = 10;
    private static final int HIGH_RISK_SCAN_LIMIT = 100;
    private static final double HIGH_RISK_THRESHOLD = 70.0;

    private final CurrentUserProvider currentUserProvider;
    private final AppointmentRepository appointmentRepository;
    private final AssessmentSessionRepository sessionRepository;
    private final AssessmentAnswerRepository answerRepository;
    private final RiskCalculationService riskCalculationService;
    private final CarePlanRepository carePlanRepository;
    private final PrescriptionRepository prescriptionRepository;

    @Override
    @Transactional(readOnly = true)
    public DoctorDashboardResponse getDashboard() {
        UUID doctorId = currentUserProvider.getCurrentUser().getUserId();

        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.plusDays(1).atStartOfDay().minusNanos(1);

        List<AppointmentSummary> todayAppointments = appointmentRepository
                .findTodayByDoctor(doctorId, startOfDay, endOfDay)
                .stream()
                .map(AppointmentSummary::fromEntity)
                .toList();

        List<AssessmentSummary> pendingAssessments = sessionRepository
                .findByDoctorAndStatus(doctorId, AssessmentSession.SessionStatus.IN_PROGRESS, PageRequest.of(0, LIST_LIMIT))
                .stream()
                .map(AssessmentSummary::fromEntity)
                .toList();

        List<HighRiskPatientSummary> highRiskPatients = loadHighRiskPatients(doctorId);

        List<CarePlanSummary> activeCarePlans = carePlanRepository
                .findByDoctorAndStatus(doctorId, CarePlan.Status.ACTIVE, PageRequest.of(0, LIST_LIMIT))
                .stream()
                .map(CarePlanSummary::fromEntity)
                .toList();

        List<PrescriptionSummary> recentPrescriptions = prescriptionRepository
                .findRecentByDoctorAndStatus(doctorId, Prescription.Status.ISSUED, PageRequest.of(0, LIST_LIMIT))
                .stream()
                .map(PrescriptionSummary::fromEntity)
                .toList();

        Map<String, Long> appointmentStatusCounts = mapStatusCounts(
                appointmentRepository.countTodayByStatus(doctorId, startOfDay, endOfDay));

        Map<String, Long> assessmentStatusCounts = mapStatusCounts(
                sessionRepository.countByStatusForDoctor(doctorId));

        Map<String, Long> carePlanStatusCounts = mapStatusCounts(
                carePlanRepository.countByStatusForDoctor(doctorId));

        Map<String, Long> prescriptionStatusCounts = mapStatusCounts(
                prescriptionRepository.countByStatusForDoctor(doctorId));

        long pendingAssessmentsCount = sessionRepository.countByDoctorUserIdAndStatus(
                doctorId,
                AssessmentSession.SessionStatus.IN_PROGRESS);

        long activeCarePlansCount = carePlanRepository.countByPatientDoctorUserIdAndStatus(
                doctorId,
                CarePlan.Status.ACTIVE);

        long recentPrescriptionsCount = prescriptionRepository.countByCreatedByAndStatus(
                doctorId,
                Prescription.Status.ISSUED);

        return DoctorDashboardResponse.builder()
                .todayAppointmentsCount(todayAppointments.size())
                .pendingAssessmentsCount(pendingAssessmentsCount)
                .highRiskPatientsCount(highRiskPatients.size())
                .activeCarePlansCount(activeCarePlansCount)
                .recentPrescriptionsCount(recentPrescriptionsCount)
                .todayAppointments(todayAppointments)
                .pendingAssessments(pendingAssessments)
                .highRiskPatients(highRiskPatients)
                .activeCarePlans(activeCarePlans)
                .recentPrescriptions(recentPrescriptions)
                .appointmentStatusCounts(appointmentStatusCounts)
                .assessmentStatusCounts(assessmentStatusCounts)
                .carePlanStatusCounts(carePlanStatusCounts)
                .prescriptionStatusCounts(prescriptionStatusCounts)
                .build();
    }

    private List<HighRiskPatientSummary> loadHighRiskPatients(UUID doctorId) {
        List<AssessmentSession> sessions = sessionRepository
                .findCompletedByDoctor(doctorId, AssessmentSession.SessionStatus.COMPLETED, PageRequest.of(0, HIGH_RISK_SCAN_LIMIT));

        if (sessions.isEmpty()) {
            return List.of();
        }

        List<UUID> sessionIds = sessions.stream()
                .map(AssessmentSession::getSessionId)
                .toList();

        List<AssessmentAnswer> answers = answerRepository.findBySessionSessionIdIn(sessionIds);
        Map<UUID, List<AssessmentAnswer>> answersBySession = answers.stream()
                .collect(Collectors.groupingBy(answer -> answer.getSession().getSessionId()));

        List<HighRiskPatientSummary> results = new ArrayList<>();

        for (AssessmentSession session : sessions) {
            Map<String, Object> answerMap = buildAnswerMap(answersBySession.get(session.getSessionId()));
            if (answerMap.isEmpty()) {
                continue;
            }

            Map<String, Object> risk = riskCalculationService.calculateRisk(session.getForm().getFormName(), answerMap);
            Double riskPercentage = parseRiskPercentage(risk.get("riskPercentage"));
            if (riskPercentage == null || riskPercentage < HIGH_RISK_THRESHOLD) {
                continue;
            }

            String riskLevel = risk.get("riskLevel") != null ? risk.get("riskLevel").toString() : null;

            results.add(HighRiskPatientSummary.builder()
                    .patientId(session.getPatient().getPatientId())
                    .patientName(session.getPatient().getFullName())
                    .sessionId(session.getSessionId())
                    .formName(session.getForm().getFormName())
                    .riskPercentage(riskPercentage)
                    .riskLevel(riskLevel)
                    .completedAt(session.getCompletedAt())
                    .build());
        }

        return results.stream()
                .sorted(Comparator.comparing(HighRiskPatientSummary::getRiskPercentage).reversed())
                .limit(LIST_LIMIT)
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

    private Map<String, Long> mapStatusCounts(List<Object[]> rows) {
        Map<String, Long> counts = new HashMap<>();
        for (Object[] row : rows) {
            if (row.length < 2 || row[0] == null) {
                continue;
            }
            counts.put(row[0].toString(), (Long) row[1]);
        }
        return counts;
    }
}
