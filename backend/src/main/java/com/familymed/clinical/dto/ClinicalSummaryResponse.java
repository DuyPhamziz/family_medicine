package com.familymed.clinical.dto;

import com.familymed.appointment.dto.AppointmentResponse;
import com.familymed.careplan.dto.CarePlanResponse;
import com.familymed.diagnosis.dto.PatientDiagnosisResponse;
import com.familymed.form.dto.AssessmentSessionDTO;
import com.familymed.prescription.dto.PrescriptionResponse;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
public class ClinicalSummaryResponse {
    private UUID patientId;
    private AssessmentSessionDTO latestAssessment;
    private Map<String, Object> riskResult;
    private List<PatientDiagnosisResponse> activeDiagnoses;
    private CarePlanResponse activeCarePlan;
    private List<PrescriptionResponse> activePrescriptions;
    private List<AppointmentResponse> upcomingAppointments;
}
