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
}
