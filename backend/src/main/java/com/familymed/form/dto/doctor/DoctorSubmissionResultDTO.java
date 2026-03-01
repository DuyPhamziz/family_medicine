package com.familymed.form.dto.doctor;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * DTO cho trang kết quả phân tích form dành cho bác sĩ
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorSubmissionResultDTO {
    
    private UUID submissionId;
    
    private String formName;
    
    private String formVersion;
    
    private String patientName;
    
    private String patientCode;
    
    private String patientEmail;
    
    private String patientPhone;
    
    private Integer patientAge;
    
    private String patientGender;
    
    // Tính điểm và kết quả
    private Integer totalScore;
    
    private String riskLevel;
    
    private Map<String, SectionResult> sectionResults;
    
    // Thời gian submit
    private LocalDateTime submittedAt;
    
    // Thông tin xử lý
    private List<CalculatedFieldResult> calculatedFields;
    
    /**
     * Kết quả của một phần (Section)
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SectionResult {
        private String sectionName;
        private Integer sectionScore;
        private List<QuestionResult> questions;
    }
    
    /**
     * Kết quả của một câu hỏi
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionResult {
        private String questionCode;
        private String questionText;
        private String answer;
        private Integer points; // Điểm cho câu này
        private String unit;
        private Map<String, String> calculatedValues; // Các giá trị được tính toán
    }
    
    /**
     * Kết quả của một field được tính toán tự động
     * VD: Age, BMI, Risk Level, vv
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CalculatedFieldResult {
        private String fieldCode; // age, bmi, risk_level, vv
        private String fieldLabel;
        private String value;
        private String unit;
        private String interpretation; // Giải thích kết quả
    }
    
    /**
     * Recommendation dựa trên kết quả phân tích
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Recommendation {
        private String type; // WARNING, INFO, SUCCESS
        private String title;
        private String message;
        private List<String> actions; // Các hành động được đề xuất
    }
}
