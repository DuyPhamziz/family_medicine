package com.familymed.form.assessment.repository;

import com.familymed.form.assessment.entity.AssessmentAnswer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AssessmentAnswerRepository extends JpaRepository<AssessmentAnswer, UUID> {
    List<AssessmentAnswer> findBySessionSessionIdOrderByAnsweredAtDesc(UUID sessionId);
    List<AssessmentAnswer> findBySessionSessionIdIn(List<UUID> sessionIds);

    @Query("select a from AssessmentAnswer a join fetch a.session s where s.sessionId in :sessionIds")
    List<AssessmentAnswer> findBySessionIdsWithSession(@Param("sessionIds") List<UUID> sessionIds);
    @Query(value = "SELECT DISTINCT ON (aa.question_code) aa.* " +
                   "FROM assessment_answers aa " +
                   "JOIN assessment_sessions s ON aa.session_id = s.session_id " +
                   "WHERE s.patient_id = :patientId " +
                   "AND aa.question_code IS NOT NULL " +
                   "ORDER BY aa.question_code, aa.answered_at DESC", nativeQuery = true)
    List<AssessmentAnswer> findLatestAnswersByPatientId(@Param("patientId") UUID patientId);
}

