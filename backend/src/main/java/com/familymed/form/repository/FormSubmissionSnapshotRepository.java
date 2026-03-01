package com.familymed.form.repository;

import com.familymed.form.entity.FormSubmissionSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface FormSubmissionSnapshotRepository extends JpaRepository<FormSubmissionSnapshot, UUID> {
    
    Optional<FormSubmissionSnapshot> findBySubmissionSubmissionId(UUID submissionId);
}
