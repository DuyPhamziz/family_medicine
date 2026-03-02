package com.familymed.form.repository;

import com.familymed.form.entity.PatientFormSubmission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientFormSubmissionRepository extends JpaRepository<PatientFormSubmission, UUID> {
    List<PatientFormSubmission> findByPatientPatientIdAndDeletedAtIsNull(UUID patientId);
    List<PatientFormSubmission> findByPatientPatientIdAndFormFormIdAndDeletedAtIsNull(UUID patientId, UUID formId);
    List<PatientFormSubmission> findByDoctorUserIdAndDeletedAtIsNull(UUID doctorId);
    List<PatientFormSubmission> findByStatusAndDeletedAtIsNull(PatientFormSubmission.SubmissionStatus status);
    List<PatientFormSubmission> findByDoctorUserIdAndStatusAndDeletedAtIsNull(UUID doctorId, PatientFormSubmission.SubmissionStatus status);
    long countByFormFormId(UUID formId);
    Optional<PatientFormSubmission> findBySubmissionIdAndDeletedAtIsNull(UUID submissionId);
    
    // Queries for public form submissions
    @Query("SELECT s FROM PatientFormSubmission s WHERE s.form.isPublic = true AND s.deletedAt IS NULL")
    Page<PatientFormSubmission> findByFormIsPublic(Pageable pageable);
    
    @Query("SELECT s FROM PatientFormSubmission s WHERE s.form.isPublic = true AND s.status = :status AND s.deletedAt IS NULL")
    Page<PatientFormSubmission> findByFormIsPublic(@Param("status") PatientFormSubmission.SubmissionStatus status, Pageable pageable);
    
    @Query("SELECT s FROM PatientFormSubmission s WHERE s.form.isPublic = true AND s.form.formId = :formId AND s.deletedAt IS NULL")
    List<PatientFormSubmission> findPublicFormSubmissions(@Param("formId") UUID formId);
    
    @Query("SELECT s FROM PatientFormSubmission s WHERE s.form.isPublic = true AND s.status = :status AND s.deletedAt IS NULL ORDER BY s.createdAt DESC")
    List<PatientFormSubmission> findPublicSubmissionsByStatus(@Param("status") PatientFormSubmission.SubmissionStatus status);
    
    // Eager load submission with all related data to avoid lazy loading issues
    // Excludes soft-deleted submissions (deletedAt IS NOT NULL)
    @Query("SELECT DISTINCT s FROM PatientFormSubmission s " +
           "LEFT JOIN FETCH s.patient " +
           "LEFT JOIN FETCH s.form " +
           "WHERE s.submissionId = :submissionId AND s.deletedAt IS NULL")
    Optional<PatientFormSubmission> findByIdWithEagerLoad(@Param("submissionId") UUID submissionId);
}

