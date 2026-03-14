package com.familymed.form.entity;

import com.familymed.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "family_disease_matrix_config")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FamilyDiseaseMatrixConfig extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "UUID")
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false, unique = true)
    private FormQuestion question;

    @Column(name = "rows_json", columnDefinition = "TEXT")
    private String rowsJson;

    @Column(name = "columns_json", columnDefinition = "TEXT")
    private String columnsJson;

    @Column(name = "allow_additional_column", nullable = false)
    private Boolean allowAdditionalColumn = false;

    @Column(name = "allow_additional_row", nullable = false)
    private Boolean allowAdditionalRow = false;
}
