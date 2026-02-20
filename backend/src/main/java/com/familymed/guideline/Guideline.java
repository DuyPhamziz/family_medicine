package com.familymed.guideline;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "guidelines", indexes = {
        @Index(name = "idx_guideline_category", columnList = "category"),
        @Index(name = "idx_guideline_updated", columnList = "updated_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Guideline {

    @Id
    @Column(name = "id", columnDefinition = "UUID")
    private UUID id;

    @Column(nullable = false)
    private String title;

    private String category;

    private String status;

    private String owner;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
