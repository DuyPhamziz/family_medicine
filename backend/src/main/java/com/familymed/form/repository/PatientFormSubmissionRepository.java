package com.familymed.form.repository;

import com.familymed.form.entity.PatientFormSubmission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PatientFormSubmissionRepository extends JpaRepository<PatientFormSubmission, UUID> {
    List<PatientFormSubmission> findByPatientPatientId(UUID patientId);
    List<PatientFormSubmission> findByPatientPatientIdAndFormFormId(UUID patientId, UUID formId);
    List<PatientFormSubmission> findByDoctorUserId(UUID doctorId);
    List<PatientFormSubmission> findByStatus(PatientFormSubmission.SubmissionStatus status);
    List<PatientFormSubmission> findByDoctorUserIdAndStatus(UUID doctorId, PatientFormSubmission.SubmissionStatus status);
    long countByFormFormId(UUID formId);
    
    // Queries for public form submissions
    @Query("SELECT s FROM PatientFormSubmission s WHERE s.form.isPublic = true")
    Page<PatientFormSubmission> findByFormIsPublic(Pageable pageable);
    
    @Query("SELECT s FROM PatientFormSubmission s WHERE s.form.isPublic = true AND s.status = :status")
    Page<PatientFormSubmission> findByFormIsPublic(@Param("status") PatientFormSubmission.SubmissionStatus status, Pageable pageable);
    
    @Query("SELECT s FROM PatientFormSubmission s WHERE s.form.isPublic = true AND s.form.formId = :formId")
    List<PatientFormSubmission> findPublicFormSubmissions(@Param("formId") UUID formId);
    
    @Query("SELECT s FROM PatientFormSubmission s WHERE s.form.isPublic = true AND s.status = :status ORDER BY s.createdAt DESC")
    List<PatientFormSubmission> findPublicSubmissionsByStatus(@Param("status") PatientFormSubmission.SubmissionStatus status);
}

