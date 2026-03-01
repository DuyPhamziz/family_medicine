package com.familymed.form.repository;

import com.familymed.form.entity.DiagnosticForm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DiagnosticFormRepository extends JpaRepository<DiagnosticForm, UUID> {
    Optional<DiagnosticForm> findByFormName(String formName);
    List<DiagnosticForm> findByStatus(DiagnosticForm.FormStatus status);
    List<DiagnosticForm> findByCategory(String category);
    List<DiagnosticForm> findByStatusAndIsPublicTrue(DiagnosticForm.FormStatus status);
    Optional<DiagnosticForm> findByPublicToken(UUID publicToken);
}

