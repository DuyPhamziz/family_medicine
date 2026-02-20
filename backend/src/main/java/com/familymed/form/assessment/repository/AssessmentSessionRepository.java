package com.familymed.form.assessment.repository;

import com.familymed.form.assessment.entity.AssessmentSession;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AssessmentSessionRepository extends JpaRepository<AssessmentSession, UUID> {
    List<AssessmentSession> findByPatientPatientIdAndFormFormId(UUID patientId, UUID formId);
    Optional<AssessmentSession> findFirstByPatientPatientIdAndFormFormIdAndStatusOrderByUpdatedAtDesc(UUID patientId, UUID formId, AssessmentSession.SessionStatus status);
    List<AssessmentSession> findByFormFormIdOrderByStartedAtAsc(UUID formId);

    Optional<AssessmentSession> findFirstByPatientPatientIdAndStatusOrderByCompletedAtDesc(UUID patientId, AssessmentSession.SessionStatus status);

    Optional<AssessmentSession> findFirstByPatientPatientIdOrderByUpdatedAtDesc(UUID patientId);

        long countByDoctorUserIdAndStatus(UUID doctorId, AssessmentSession.SessionStatus status);

        @Query("select s from AssessmentSession s " +
            "join fetch s.patient p " +
            "join fetch s.form f " +
            "where s.doctor.userId = :doctorId and s.status = :status " +
            "order by s.startedAt desc")
        List<AssessmentSession> findByDoctorAndStatus(@Param("doctorId") UUID doctorId,
                             @Param("status") AssessmentSession.SessionStatus status,
                             Pageable pageable);

        @Query("select s from AssessmentSession s " +
            "join fetch s.patient p " +
            "join fetch s.form f " +
            "where s.doctor.userId = :doctorId and s.status = :status " +
            "order by s.completedAt desc")
        List<AssessmentSession> findCompletedByDoctor(@Param("doctorId") UUID doctorId,
                              @Param("status") AssessmentSession.SessionStatus status,
                              Pageable pageable);

        @Query("select s.status, count(s) from AssessmentSession s " +
            "where s.doctor.userId = :doctorId group by s.status")
        List<Object[]> countByStatusForDoctor(@Param("doctorId") UUID doctorId);

            @Query("select s from AssessmentSession s " +
                "join fetch s.form f " +
                "where s.patient.patientId = :patientId " +
                "order by s.startedAt asc")
            List<AssessmentSession> findByPatientOrderByStartedAtAsc(@Param("patientId") UUID patientId);
}
