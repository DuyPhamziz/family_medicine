package com.familymed.medicalrecord;

import com.familymed.medicalrecord.dto.MedicalRecordResponse;

import java.util.UUID;

public interface MedicalRecordService {
    MedicalRecordResponse getMedicalRecord(UUID patientId);
}
