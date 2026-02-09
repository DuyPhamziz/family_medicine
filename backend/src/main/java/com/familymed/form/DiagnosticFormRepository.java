package com.familymed.form;

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
}

