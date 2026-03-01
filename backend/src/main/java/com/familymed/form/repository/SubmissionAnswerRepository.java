package com.familymed.form.repository;

import com.familymed.form.entity.SubmissionAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SubmissionAnswerRepository extends JpaRepository<SubmissionAnswer, UUID> {
    List<SubmissionAnswer> findBySubmissionSubmissionId(UUID submissionId);
}
