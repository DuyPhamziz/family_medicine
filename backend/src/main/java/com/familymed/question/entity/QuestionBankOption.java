package com.familymed.question.entity;

import com.familymed.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "question_bank_options")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class QuestionBankOption extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "option_id", columnDefinition = "UUID")
    private UUID optionId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false, foreignKey = @ForeignKey(name = "fk_question_bank_options_question_bank"))
    private QuestionBank questionBank;

    @Column(nullable = false)
    private String optionText;

    private String optionValue;

    private Integer optionOrder;

    private Integer points;
}
