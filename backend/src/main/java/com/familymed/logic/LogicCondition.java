package com.familymed.logic;

import com.familymed.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "logic_conditions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LogicCondition extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "condition_id", columnDefinition = "UUID")
    private UUID conditionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "formula_id", nullable = false)
    private LogicFormula formula;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String conditionExpression; // e.g., "result > 25 && result <= 30"

    private String resultLabel; // e.g., "Overweight"

    private String resultValue; // e.g., "OVERWEIGHT"

    private Integer evaluationOrder; // Sequence of evaluation
    
    @Column(columnDefinition = "TEXT")
    private String recommendation; // Clinical recommendation for this condition
}
