package com.familymed.form.entity;

import com.familymed.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "submission_answers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionAnswer extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "answer_id", columnDefinition = "UUID")
    private UUID answerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    private PatientFormSubmission submission;

    @Column(name = "question_id", columnDefinition = "UUID")
    private UUID questionId;

    @Column(name = "question_code")
    private String questionCode;

    @Column(name = "value", columnDefinition = "TEXT")
    private String value;
}
