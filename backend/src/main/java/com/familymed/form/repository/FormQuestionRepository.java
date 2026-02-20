package com.familymed.form.repository;

import com.familymed.form.entity.FormQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FormQuestionRepository extends JpaRepository<FormQuestion, UUID> {
    List<FormQuestion> findBySection_SectionIdOrderByQuestionOrder(UUID sectionId);
    List<FormQuestion> findBySection_Form_FormId(UUID formId);
}

