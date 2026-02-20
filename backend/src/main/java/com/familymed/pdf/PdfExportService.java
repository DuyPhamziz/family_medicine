package com.familymed.pdf;

import java.util.UUID;

public interface PdfExportService {
    byte[] exportAssessmentResult(UUID sessionId);

    byte[] exportCarePlan(UUID carePlanId);

    byte[] exportPrescription(UUID prescriptionId);
}
