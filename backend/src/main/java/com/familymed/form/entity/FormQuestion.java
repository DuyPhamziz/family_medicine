package com.familymed.form.entity;

import com.familymed.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.UUID;

@Entity
@Table(name = "form_questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FormQuestion extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "question_id", columnDefinition = "UUID")
    private UUID questionId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable = false)
    private FormSection section;

    @Column(nullable = false) // Mã biến (e.g., V1, V2)
    private String questionCode;
    
    @Column(nullable = false)
    private Integer questionOrder; // Thứ tự câu hỏi
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String questionText; // Nội dung câu hỏi
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestionType questionType; // SINGLE_CHOICE, MULTIPLE_CHOICE, TEXT, NUMBER, DATE
    
    @Column(columnDefinition = "TEXT")
    private String options; // JSON array cho multiple/single choice

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("optionOrder ASC")
    private java.util.List<FormQuestionOption> optionItems;
    
    private String unit; // Đơn vị (nếu là số)
    
    private Double minValue; // Giá trị tối thiểu
    
    private Double maxValue; // Giá trị tối đa
    
    private Integer points; // Điểm cho câu hỏi này
    
    private Boolean required = true;
    
    @Column(columnDefinition = "TEXT")
    private String helpText; // Hướng dẫn thêm

    @Column(columnDefinition = "TEXT")
    private String displayCondition; // JSON logic for conditional display
    
    public enum QuestionType {
        SINGLE_CHOICE,
        MULTIPLE_CHOICE,
        TEXT,
        NUMBER,
        DATE,
        BOOLEAN
    }
}

