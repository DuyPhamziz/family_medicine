package com.familymed.form.assessment.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "assessment_answers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentAnswer {

    @Id
    @Column(name = "answer_id", columnDefinition = "UUID")
    private UUID answerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private AssessmentSession session;

    @Column(name = "question_id", nullable = false, columnDefinition = "UUID")
    private UUID questionId;

    private String questionCode;

    @Column(columnDefinition = "TEXT")
    private String questionText;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AnswerType answerType;

    @Column(columnDefinition = "TEXT")
    private String answerValue;

    @Column(nullable = false)
    private LocalDateTime answeredAt;

    public enum AnswerType {
        TEXT,
        NUMBER,
        BOOLEAN,
        SINGLE_CHOICE,
        MULTIPLE_CHOICE,
        DATE
    }
}
