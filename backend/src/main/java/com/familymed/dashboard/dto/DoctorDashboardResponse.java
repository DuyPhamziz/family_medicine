package com.familymed.dashboard.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class DoctorDashboardResponse {
    private long todayAppointmentsCount;
    private long pendingAssessmentsCount;
    private long highRiskPatientsCount;
    private long activeCarePlansCount;
    private long recentPrescriptionsCount;

    private List<AppointmentSummary> todayAppointments;
    private List<AssessmentSummary> pendingAssessments;
    private List<HighRiskPatientSummary> highRiskPatients;
    private List<CarePlanSummary> activeCarePlans;
    private List<PrescriptionSummary> recentPrescriptions;

    private Map<String, Long> appointmentStatusCounts;
    private Map<String, Long> assessmentStatusCounts;
    private Map<String, Long> carePlanStatusCounts;
    private Map<String, Long> prescriptionStatusCounts;
}
