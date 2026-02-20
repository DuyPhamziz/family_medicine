package com.familymed.clinical;

import com.familymed.clinical.dto.ClinicalSummaryResponse;

import java.util.UUID;

public interface ClinicalSummaryService {
    ClinicalSummaryResponse getSummary(UUID patientId);
}
