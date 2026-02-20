package com.familymed.clinical;

import com.familymed.appointment.AppointmentService;
import com.familymed.appointment.dto.AppointmentResponse;
import com.familymed.careplan.entity.CarePlan;
import com.familymed.careplan.repository.CarePlanRepository;
import com.familymed.careplan.CarePlanService;
import com.familymed.careplan.dto.CarePlanResponse;
import com.familymed.clinical.dto.ClinicalSummaryResponse;
import com.familymed.diagnosis.PatientDiagnosisService;
import com.familymed.diagnosis.dto.PatientDiagnosisResponse;
import com.familymed.form.assessment.entity.AssessmentAnswer;
import com.familymed.form.assessment.repository.AssessmentAnswerRepository;
import com.familymed.form.assessment.entity.AssessmentSession;
import com.familymed.form.assessment.repository.AssessmentSessionRepository;
import com.familymed.form.dto.AssessmentSessionDTO;
import com.familymed.form.service.RiskCalculationService;
import com.familymed.prescription.PrescriptionService;
import com.familymed.prescription.dto.PrescriptionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClinicalSummaryServiceImpl implements ClinicalSummaryService {

    private final AssessmentSessionRepository sessionRepository;
    private final AssessmentAnswerRepository answerRepository;
    private final RiskCalculationService riskCalculationService;
    private final PatientDiagnosisService diagnosisService;
    private final CarePlanRepository carePlanRepository;
    private final CarePlanService carePlanService;
    private final PrescriptionService prescriptionService;
    private final AppointmentService appointmentService;

    @Override
    @Transactional(readOnly = true)
    public ClinicalSummaryResponse getSummary(UUID patientId) {
        AssessmentSession latestSession = findLatestSession(patientId).orElse(null);
        AssessmentSessionDTO latestAssessment = latestSession != null
                ? AssessmentSessionDTO.fromSession(latestSession)
                : null;

        Map<String, Object> riskResult = latestSession != null
                ? calculateRisk(latestSession)
                : null;

        List<PatientDiagnosisResponse> diagnoses = diagnosisService.getDiagnosesByPatient(patientId);

        CarePlanResponse activeCarePlan = carePlanRepository
                .findFirstByPatientPatientIdAndStatusOrderByCreatedAtDesc(patientId, CarePlan.Status.ACTIVE)
                .map(plan -> carePlanService.getCarePlan(plan.getId()))
                .orElse(null);

        List<PrescriptionResponse> activePrescriptions = prescriptionService.getActivePrescriptionsByPatient(patientId);
        List<AppointmentResponse> upcomingAppointments = appointmentService.getUpcomingAppointmentsByPatient(patientId);

        return ClinicalSummaryResponse.builder()
                .patientId(patientId)
                .latestAssessment(latestAssessment)
                .riskResult(riskResult)
                .activeDiagnoses(diagnoses)
                .activeCarePlan(activeCarePlan)
                .activePrescriptions(activePrescriptions)
                .upcomingAppointments(upcomingAppointments)
                .build();
    }

    private Optional<AssessmentSession> findLatestSession(UUID patientId) {
        Optional<AssessmentSession> completed = sessionRepository
                .findFirstByPatientPatientIdAndStatusOrderByCompletedAtDesc(
                        patientId,
                        AssessmentSession.SessionStatus.COMPLETED);

        if (completed.isPresent()) {
            return completed;
        }

        return sessionRepository.findFirstByPatientPatientIdOrderByUpdatedAtDesc(patientId);
    }

    private Map<String, Object> calculateRisk(AssessmentSession session) {
        List<AssessmentAnswer> answers = answerRepository.findBySessionSessionIdOrderByAnsweredAtDesc(
                session.getSessionId());

        Map<String, Object> answerMap = new LinkedHashMap<>();
        for (AssessmentAnswer answer : answers) {
            if (answer.getQuestionCode() == null) {
                continue;
            }
            answerMap.putIfAbsent(answer.getQuestionCode(), answer.getAnswerValue());
        }

        return riskCalculationService.calculateRisk(session.getForm().getFormName(), answerMap);
    }
}
