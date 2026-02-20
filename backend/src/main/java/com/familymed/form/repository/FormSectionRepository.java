package com.familymed.form.repository;

import com.familymed.form.entity.FormSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FormSectionRepository extends JpaRepository<FormSection, UUID> {
    List<FormSection> findByForm_FormIdOrderBySectionOrder(UUID formId);
}
