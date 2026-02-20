package com.familymed.form.repository;

import com.familymed.form.entity.FormQuestionOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FormQuestionOptionRepository extends JpaRepository<FormQuestionOption, UUID> {
    List<FormQuestionOption> findByQuestion_QuestionIdOrderByOptionOrder(UUID questionId);
}
