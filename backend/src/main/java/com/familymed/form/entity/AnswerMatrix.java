package com.familymed.form.entity;

import com.familymed.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "answer_matrix")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AnswerMatrix extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "UUID")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "response_id", nullable = false)
    private PatientFormSubmission response;

    @Column(name = "question_id", columnDefinition = "UUID", nullable = false)
    private UUID questionId;

    @Column(name = "row_key", nullable = false)
    private String rowKey;

    @Column(name = "column_key", nullable = false)
    private String columnKey;

    @Column(name = "has_disease", nullable = false)
    private Boolean hasDisease = false;

    @Column(name = "diagnosis_year")
    private Integer diagnosisYear;
}
