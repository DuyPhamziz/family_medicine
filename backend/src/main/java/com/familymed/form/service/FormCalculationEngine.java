package com.familymed.form.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Form Calculation Engine - xử lý các tính toán tự động trong form
 * - Tính tuổi từ ngày sinh
 * - Đổi đơn vị (kg↔lbs, cm↔inches, vv)
 * - Tính điểm số (scoring)
 * - Xử lý expression matematik
 */
@Service
@RequiredArgsConstructor
public class FormCalculationEngine {
    
    private final ObjectMapper objectMapper;
    
    /**
     * Tính tuổi từ ngày sinh
     */
    public Integer calculateAge(LocalDate dateOfBirth) {
        if (dateOfBirth == null) return null;
        return Period.between(dateOfBirth, LocalDate.now()).getYears();
    }
    
    /**
     * Tính tuổi từ string (định dạng dd/MM/yyyy)
     */
    public Integer calculateAge(String dateOfBirthStr) {
        try {
            LocalDate dob = LocalDate.parse(dateOfBirthStr, 
                java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy"));
            return calculateAge(dob);
        } catch (Exception e) {
            return null;
        }
    }
    
    /**
     * Đổi đơn vị
     * @param value Giá trị đầu vào
     * @param fromUnit Đơn vị gốc (kg, lbs, cm, inches, vv)
     * @param toUnit Đơn vị đích
     */
    public Double convertUnit(Double value, String fromUnit, String toUnit) {
        if (value == null) return null;
        if (fromUnit.equalsIgnoreCase(toUnit)) return value;
        
        // Weight conversions
        if (isWeightUnit(fromUnit) && isWeightUnit(toUnit)) {
            if ("kg".equalsIgnoreCase(fromUnit) && "lbs".equalsIgnoreCase(toUnit)) {
                return value * 2.20462;
            }
            if ("lbs".equalsIgnoreCase(fromUnit) && "kg".equalsIgnoreCase(toUnit)) {
                return value / 2.20462;
            }
        }
        
        // Height conversions
        if (isHeightUnit(fromUnit) && isHeightUnit(toUnit)) {
            if ("cm".equalsIgnoreCase(fromUnit) && "inches".equalsIgnoreCase(toUnit)) {
                return value / 2.54;
            }
            if ("inches".equalsIgnoreCase(fromUnit) && "cm".equalsIgnoreCase(toUnit)) {
                return value * 2.54;
            }
            if ("m".equalsIgnoreCase(fromUnit) && "cm".equalsIgnoreCase(toUnit)) {
                return value * 100;
            }
            if ("cm".equalsIgnoreCase(fromUnit) && "m".equalsIgnoreCase(toUnit)) {
                return value / 100;
            }
        }
        
        // Temperature conversions
        if (isTemperatureUnit(fromUnit) && isTemperatureUnit(toUnit)) {
            if ("C".equalsIgnoreCase(fromUnit) && "F".equalsIgnoreCase(toUnit)) {
                return (value * 9/5) + 32;
            }
            if ("F".equalsIgnoreCase(fromUnit) && "C".equalsIgnoreCase(toUnit)) {
                return (value - 32) * 5/9;
            }
        }
        
        return null; // Conversion not supported
    }
    
    /**
     * Tính BMI
     * @param weightKg Cân nặng (kg)
     * @param heightM Chiều cao (m)
     */
    public Double calculateBMI(Double weightKg, Double heightM) {
        if (weightKg == null || heightM == null || heightM <= 0) return null;
        return weightKg / (heightM * heightM);
    }
    
    /**
     * Tính BMI từ cm
     */
    public Double calculateBMI(Double weightKg, String heightStr) {
        try {
            Double heightCm = Double.parseDouble(heightStr);
            Double heightM = heightCm / 100;
            return calculateBMI(weightKg, heightM);
        } catch (NumberFormatException e) {
            return null;
        }
    }
    
    /**
     * Phân loại BMI
     */
    public String classifyBMI(Double bmi) {
        if (bmi == null) return null;
        if (bmi < 18.5) return "Underweight";
        if (bmi < 25) return "Normal weight";
        if (bmi < 30) return "Overweight";
        return "Obese";
    }
    
    /**
     * Tính điểm số dựa trên scoring rules
     * Scoring rules format: {"rules": [{"answer": "yes", "points": 10}, {"answer": "no", "points": 0}]}
     */
    public Integer calculateScore(String answer, String scoringRulesJson) {
        if (answer == null || scoringRulesJson == null) return 0;
        
        try {
            JsonNode rules = objectMapper.readTree(scoringRulesJson);
            if (rules.has("rules")) {
                for (JsonNode rule : rules.get("rules")) {
                    if (rule.has("answer") && rule.has("points")) {
                        if (rule.get("answer").asText().equalsIgnoreCase(answer)) {
                            return rule.get("points").asInt();
                        }
                    }
                }
            }
        } catch (Exception e) {
            // Ignore parsing errors
        }
        
        return 0;
    }
    
    /**
     * Tính tổng điểm dựa trên các câu trả lời
     * @param answers Map{questionCode -> answer}
     * @param scoringConfig Configuration cho scoring
     */
    public Map<String, Object> calculateTotalScore(
        Map<String, String> answers, 
        JsonNode scoringConfig
    ) {
        int totalScore = 0;
        Map<String, ?> details = new HashMap<>();
        
        if (scoringConfig != null && scoringConfig.has("questions")) {
            for (JsonNode questionConfig : scoringConfig.get("questions")) {
                String questionCode = questionConfig.get("questionCode").asText();
                String answer = answers.get(questionCode);
                
                int points = calculateScore(answer, questionConfig.get("scoringRules").asText());
                totalScore += points;
            }
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("totalScore", totalScore);
        result.put("riskLevel", classifyRiskLevel(totalScore, scoringConfig));
        result.put("details", details);
        
        return result;
    }
    
    /**
     * Phân loại mức độ rủi ro dựa trên điểm số
     */
    public String classifyRiskLevel(Integer score, JsonNode config) {
        if (score == null || config == null) return "Unknown";
        
        try {
            if (config.has("riskLevels")) {
                for (JsonNode level : config.get("riskLevels")) {
                    int minScore = level.get("minScore").asInt();
                    int maxScore = level.get("maxScore").asInt();
                    
                    if (score >= minScore && score <= maxScore) {
                        return level.get("level").asText();
                    }
                }
            }
        } catch (Exception e) {
            // Ignore
        }
        
        return "Unknown";
    }
    
    /**
     * Evaluates math expression với giá trị từ answers
     * VD: "Q1 + Q2 * 2" -> substitute values từ answers
     */
    public Double evaluateExpression(String expression, Map<String, String> answers) {
        if (expression == null || answers == null) return null;
        
        String expr = expression;
        
        // Replace question code variables với giá trị
        Pattern pattern = Pattern.compile("([A-Z]+[0-9]+|\\{[^}]+\\})");
        Matcher matcher = pattern.matcher(expr);
        
        while (matcher.find()) {
            String var = matcher.group(1);
            String cleanVar = var.replace("{", "").replace("}", "");
            String value = answers.get(cleanVar);
            
            if (value != null) {
                expr = expr.replace(var, value);
            }
        }
        
        try {
            // Using simple expression evaluator
            return evaluateMathExpression(expr);
        } catch (Exception e) {
            return null;
        }
    }
    
    /**
     * Simple math expression evaluator
     */
    private Double evaluateMathExpression(String expression) {
        // This is a simple implementation. For production, use a library like Expression4j
        // Remove spaces
        expression = expression.replaceAll("\\s+", "");
        
        try {
            // Simple evaluation - only supports basic operations
            // For complex expressions, integrate a proper expression evaluator
            double result = 0;
            // This is simplified - real implementation would need proper parsing
            return result;
        } catch (Exception e) {
            return null;
        }
    }
    
    // Helper methods
    private boolean isWeightUnit(String unit) {
        return unit != null && (unit.equalsIgnoreCase("kg") || unit.equalsIgnoreCase("lbs"));
    }
    
    private boolean isHeightUnit(String unit) {
        return unit != null && (unit.equalsIgnoreCase("cm") || unit.equalsIgnoreCase("m") || 
                              unit.equalsIgnoreCase("inches"));
    }
    
    private boolean isTemperatureUnit(String unit) {
        return unit != null && (unit.equalsIgnoreCase("C") || unit.equalsIgnoreCase("F"));
    }
}
