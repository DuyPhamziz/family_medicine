package com.familymed.form;

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
public class FormQuestion {
    
    @Id
    @Column(name = "question_id", columnDefinition = "UUID")
    private UUID questionId;
    
    @ManyToOne
    @JoinColumn(name = "form_id", nullable = false)
    private DiagnosticForm form;
    
    @Column(nullable = false)
    private Integer questionOrder; // Thứ tự câu hỏi
    
    @Column(nullable = false)
    private String questionText; // Nội dung câu hỏi
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestionType questionType; // SINGLE_CHOICE, MULTIPLE_CHOICE, TEXT, NUMBER, DATE
    
    @Column(columnDefinition = "TEXT")
    private String options; // JSON array cho multiple/single choice
    
    private String unit; // Đơn vị (nếu là số)
    
    private Double minValue; // Giá trị tối thiểu
    
    private Double maxValue; // Giá trị tối đa
    
    private Integer points; // Điểm cho câu hỏi này
    
    private Boolean required = true;
    
    private String helpText; // Hướng dẫn thêm
    
    public enum QuestionType {
        SINGLE_CHOICE,
        MULTIPLE_CHOICE,
        TEXT,
        NUMBER,
        DATE
    }
}

