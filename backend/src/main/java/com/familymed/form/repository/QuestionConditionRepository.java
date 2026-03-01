package com.familymed.form.repository;

import com.familymed.form.entity.QuestionCondition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuestionConditionRepository extends JpaRepository<QuestionCondition, UUID> {
    
    List<QuestionCondition> findByQuestionQuestionIdAndEnabledTrue(UUID questionId);
    
    List<QuestionCondition> findByQuestion_Section_Form_FormIdOrderByPriority(UUID formId);
}
