package com.familymed.form.repository;

import com.familymed.form.entity.PatientFormSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PatientFormSubmissionRepository extends JpaRepository<PatientFormSubmission, UUID> {
    List<PatientFormSubmission> findByPatientPatientId(UUID patientId);
    List<PatientFormSubmission> findByPatientPatientIdAndFormFormId(UUID patientId, UUID formId);
    List<PatientFormSubmission> findByDoctorUserId(UUID doctorId);
}

