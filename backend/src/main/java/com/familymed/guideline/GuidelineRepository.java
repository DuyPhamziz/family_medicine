package com.familymed.guideline;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface GuidelineRepository extends JpaRepository<Guideline, UUID> {
    @Query("SELECT g FROM Guideline g WHERE g.form.formId = :formId")
    Optional<Guideline> findByFormFormId(@Param("formId") UUID formId);
}
