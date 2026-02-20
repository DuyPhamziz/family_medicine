package com.familymed.question.entity;

import com.familymed.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "form_question_options")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class QuestionBankOption extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "option_id", columnDefinition = "UUID")
    private UUID optionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id")
    private QuestionBank questionBank;

    @Column(nullable = false)
    private String optionText;

    private String optionValue;

    private Integer optionOrder;

    private Integer points;
}
