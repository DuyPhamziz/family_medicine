package com.familymed.icd10.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "icd10_code")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Icd10Code {

    @Id
    @Column(name = "code", length = 20)
    private String code;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    private String chapter;

    @Column(name = "is_billable")
    private Boolean billable = Boolean.TRUE;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "created_by", nullable = false, columnDefinition = "UUID")
    private UUID createdBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by", columnDefinition = "UUID")
    private UUID updatedBy;
}
