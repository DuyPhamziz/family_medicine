package com.familymed.form.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.familymed.form.dto.doctor.DoctorSubmissionResultDTO;
import com.familymed.form.entity.*;
import com.familymed.form.repository.DiagnosticFormRepository;
import com.familymed.form.repository.PatientFormSubmissionRepository;
import com.familymed.form.repository.SubmissionAnswerRepository;
import com.familymed.user.entity.User;
import com.familymed.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service xử lý kết quả phân tích form cho bác sĩ
 * - Tính toán tất cả các giá trị
 * - Phân loại mức độ rủi ro
 * - Sinh ra các khuyến nghị
 */
@Service
@RequiredArgsConstructor
public class FormSubmissionResultService {
    
    private final PatientFormSubmissionRepository submissionRepository;
    private final SubmissionAnswerRepository answerRepository;
    private final DiagnosticFormRepository formRepository;
    private final UserRepository userRepository;
    private final FormCalculationEngine calculationEngine;
    private final ConditionalLogicEngine conditionalLogicEngine;
    private final ObjectMapper objectMapper;
    
    /**
     * Lấy kết quả phân tích hoàn chỉnh cho một submission
     */
    public DoctorSubmissionResultDTO getSubmissionResult(UUID submissionId) {
        PatientFormSubmission submission = submissionRepository.findById(submissionId)
            .orElseThrow(() -> new RuntimeException("Submission not found"));
        
        return buildSubmissionResult(submission);
    }
    
    /**
     * Xây dựng kết quả phân tích hoàn chỉnh
     */
    private DoctorSubmissionResultDTO buildSubmissionResult(PatientFormSubmission submission) {
        // Load answers
        List<SubmissionAnswer> answers = answerRepository.findBySubmissionSubmissionId(submission.getSubmissionId());
        Map<String, String> answerMap = answers.stream()
            .collect(Collectors.toMap(SubmissionAnswer::getQuestionCode, SubmissionAnswer::getValue));
        
        // Load form configuration
        DiagnosticForm form = submission.getForm();
        
        // Tính toán tất cả kết quả
        DoctorSubmissionResultDTO result = new DoctorSubmissionResultDTO();
        result.setSubmissionId(submission.getSubmissionId());
        result.setFormName(form.getFormName());
        result.setPatientName(submission.getPatientName());
        result.setPatientEmail(submission.getEmail());
        result.setPatientPhone(submission.getPhone());
        result.setSubmittedAt(submission.getCreatedAt());
        
        // Tính tuổi nếu có patient và DOB
        if (submission.getPatient() != null && submission.getPatient().getDateOfBirth() != null) {
            Integer age = calculationEngine.calculateAge(submission.getPatient().getDateOfBirth());
            result.setPatientAge(age);
        }
        
        // Tính điểm và risk level
        Map<String, Object> scoring = calculateFormScoring(form, answerMap);
        result.setTotalScore((Integer) scoring.get("totalScore"));
        result.setRiskLevel((String) scoring.get("riskLevel"));
        
        // Tính kết quả theo section
        Map<String, DoctorSubmissionResultDTO.SectionResult> sectionResults = 
            calculateSectionResults(form, answerMap);
        result.setSectionResults(sectionResults);
        
        // Tính các field được tính toán tự động
        List<DoctorSubmissionResultDTO.CalculatedFieldResult> calculatedFields = 
            calculateDerivedFields(form, answerMap);
        result.setCalculatedFields(calculatedFields);
        
        return result;
    }
    
    /**
     * Tính điểm số toàn form
     */
    private Map<String, Object> calculateFormScoring(DiagnosticForm form, Map<String, String> answers) {
        int totalScore = 0;
        
        for (FormSection section : form.getSections()) {
            for (FormQuestion question : section.getQuestions()) {
                String answer = answers.get(question.getQuestionCode());
                if (answer != null && question.getPoints() != null) {
                    // Nếu là câu hỏi Yes/No
                    if ("BOOLEAN".equals(question.getQuestionType().name())) {
                        if ("yes".equalsIgnoreCase(answer) || "true".equalsIgnoreCase(answer)) {
                            totalScore += question.getPoints();
                        }
                    }
                }
            }
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("totalScore", totalScore);
        
        // Phân loại risk level
        if (form.getScoringRules() != null) {
            try {
                JsonNode config = objectMapper.readTree(form.getScoringRules());
                String riskLevel = calculationEngine.classifyRiskLevel(totalScore, config);
                result.put("riskLevel", riskLevel);
            } catch (Exception e) {
                result.put("riskLevel", "Unknown");
            }
        } else {
            result.put("riskLevel", "Normal");
        }
        
        return result;
    }
    
    /**
     * Tính kết quả cho mỗi section
     */
    private Map<String, DoctorSubmissionResultDTO.SectionResult> calculateSectionResults(
        DiagnosticForm form,
        Map<String, String> answers
    ) {
        Map<String, DoctorSubmissionResultDTO.SectionResult> results = new LinkedHashMap<>();
        
        for (FormSection section : form.getSections()) {
            List<DoctorSubmissionResultDTO.QuestionResult> questionResults = new ArrayList<>();
            int sectionScore = 0;
            
            for (FormQuestion question : section.getQuestions()) {
                String answer = answers.get(question.getQuestionCode());
                Integer points = 0;
                
                if (answer != null && question.getPoints() != null) {
                    if ("yes".equalsIgnoreCase(answer) || "true".equalsIgnoreCase(answer)) {
                        points = question.getPoints();
                        sectionScore += points;
                    }
                }
                
                DoctorSubmissionResultDTO.QuestionResult qResult = new DoctorSubmissionResultDTO.QuestionResult();
                qResult.setQuestionCode(question.getQuestionCode());
                qResult.setQuestionText(question.getQuestionText());
                qResult.setAnswer(answer);
                qResult.setPoints(points);
                qResult.setUnit(question.getUnit());
                qResult.setCalculatedValues(new HashMap<>());
                
                questionResults.add(qResult);
            }
            
            DoctorSubmissionResultDTO.SectionResult sectionResult = new DoctorSubmissionResultDTO.SectionResult();
            sectionResult.setSectionName(section.getSectionName());
            sectionResult.setSectionScore(sectionScore);
            sectionResult.setQuestions(questionResults);
            
            results.put(section.getSectionId().toString(), sectionResult);
        }
        
        return results;
    }
    
    /**
     * Tính các field được tính toán tự động (age, bmi, vv)
     */
    private List<DoctorSubmissionResultDTO.CalculatedFieldResult> calculateDerivedFields(
        DiagnosticForm form,
        Map<String, String> answers
    ) {
        List<DoctorSubmissionResultDTO.CalculatedFieldResult> results = new ArrayList<>();
        
        // Tìm các question có loại NUMBER, DATE
        for (FormSection section : form.getSections()) {
            for (FormQuestion question : section.getQuestions()) {
                String answer = answers.get(question.getQuestionCode());
                
                if (answer == null) continue;
                
                // Xử lý Age từ Date of Birth
                if ("DOB".equalsIgnoreCase(question.getQuestionCode()) || 
                    question.getQuestionText().toLowerCase().contains("date of birth")) {
                    Integer age = calculationEngine.calculateAge(answer);
                    if (age != null) {
                        results.add(DoctorSubmissionResultDTO.CalculatedFieldResult.builder()
                            .fieldCode("age")
                            .fieldLabel("Tuổi")
                            .value(age.toString())
                            .unit("năm")
                            .interpretation(interpretAge(age))
                            .build());
                    }
                }
                
                // Xử lý BMI từ weight + height
                if ("WEIGHT".equalsIgnoreCase(question.getQuestionCode())) {
                    String heightStr = findHeightAnswer(answers);
                    if (heightStr != null) {
                        try {
                            Double weight = Double.parseDouble(answer);
                            Double bmi = calculationEngine.calculateBMI(weight, heightStr);
                            if (bmi != null) {
                                String classification = calculationEngine.classifyBMI(bmi);
                                results.add(DoctorSubmissionResultDTO.CalculatedFieldResult.builder()
                                    .fieldCode("bmi")
                                    .fieldLabel("Chỉ số BMI")
                                    .value(String.format("%.1f", bmi))
                                    .unit("kg/m²")
                                    .interpretation(classification)
                                    .build());
                            }
                        } catch (NumberFormatException e) {
                            // Ignore
                        }
                    }
                }
            }
        }
        
        return results;
    }
    
    /**
     * Tìm chiều cao từ answers
     */
    private String findHeightAnswer(Map<String, String> answers) {
        // Thử tìm HEIGHT, H, CHIEU_CAO
        for (String key : answers.keySet()) {
            if (key.toUpperCase().contains("HEIGHT") || 
                key.toUpperCase().contains("CHIEU") ||
                key.equals("H")) {
                return answers.get(key);
            }
        }
        return null;
    }
    
    /**
     * Phân loại tuổi
     */
    private String interpretAge(Integer age) {
        if (age < 18) return "Dưới 18 tuổi";
        if (age < 40) return "18-40 tuổi";
        if (age < 60) return "40-60 tuổi";
        return "Trên 60 tuổi";
    }
}
