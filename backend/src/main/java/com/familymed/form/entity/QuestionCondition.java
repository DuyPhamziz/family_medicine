package com.familymed.form.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

/**
 * Conditional logic rule for form questions
 * Determines when a question should be shown, hidden, or required
 */
@Entity
@Table(name = "question_conditions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class QuestionCondition {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "condition_id", columnDefinition = "UUID")
    private UUID conditionId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private FormQuestion question; // Question that has this condition
    
    @Column(nullable = false)
    private String conditionType; // SHOW, HIDE, REQUIRE, DISABLE
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String conditionRulesJson; // JSON rules: [{targetQuestion: "q1", operator: "equals", value: "yes"}]
    
    @Column(nullable = false)
    private Integer priority = 0; // Execution order if multiple conditions
    
    private Boolean enabled = true;
}
