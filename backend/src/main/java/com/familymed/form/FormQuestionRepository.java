package com.familymed.form;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FormQuestionRepository extends JpaRepository<FormQuestion, UUID> {
    List<FormQuestion> findByForm_FormIdOrderByQuestionOrder(UUID formId);
}

