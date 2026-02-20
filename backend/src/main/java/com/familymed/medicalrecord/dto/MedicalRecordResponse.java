package com.familymed.medicalrecord.dto;

import com.familymed.appointment.dto.AppointmentResponse;
import com.familymed.careplan.dto.CarePlanResponse;
import com.familymed.diagnosis.dto.PatientDiagnosisResponse;
import com.familymed.patient.dto.PatientDTO;
import com.familymed.prescription.dto.PrescriptionResponse;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class MedicalRecordResponse {
    private PatientDTO demographics;
    private List<AssessmentHistoryItem> assessmentHistory;
    private List<RiskHistoryItem> riskHistory;
    private List<PatientDiagnosisResponse> diagnosisHistory;
    private List<CarePlanResponse> carePlans;
    private List<PrescriptionResponse> prescriptionHistory;
    private List<AppointmentResponse> appointmentHistory;
    private List<MedicalRecordTimelineEvent> timeline;
    private LocalDateTime generatedAt;
}
