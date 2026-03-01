package com.familymed.guideline;

import com.familymed.form.entity.DiagnosticForm;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
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
@Table(name = "guidelines", indexes = {
        @Index(name = "idx_guideline_form_id", columnList = "form_id"),
        @Index(name = "idx_guideline_category", columnList = "category"),
        @Index(name = "idx_guideline_updated", columnList = "updated_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Guideline {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "UUID")
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String summary; // Brief summary of the guideline

    @Column(columnDefinition = "TEXT")
    private String content; // Full medical content/recommendations

    private String category; // e.g., "Tim mạch", "Hô hấp", "Thần kinh"

    private String status; // DRAFT, PUBLISHED, ACTIVE

    private String owner; // Doctor or author name

    // Relationship to DiagnosticForm (calculator)
    @ManyToOne
    @JoinColumn(name = "form_id", referencedColumnName = "form_id")
    private DiagnosticForm form;

    // JSON array of recommendations or bullet points
    @Column(columnDefinition = "TEXT")
    private String recommendations; // JSON format: ["rec1", "rec2", ...]

    // JSON array of references/citations
    @Column(name = "reference_list", columnDefinition = "TEXT")
    private String referenceList; // JSON format: [{title, authors, journal, year, url}, ...]

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
