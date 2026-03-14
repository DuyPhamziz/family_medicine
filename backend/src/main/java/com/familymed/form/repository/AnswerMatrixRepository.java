package com.familymed.form.repository;

import com.familymed.form.entity.AnswerMatrix;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AnswerMatrixRepository extends JpaRepository<AnswerMatrix, UUID> {
    void deleteByResponseSubmissionIdAndQuestionId(UUID submissionId, UUID questionId);
}
