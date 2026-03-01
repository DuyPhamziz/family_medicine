package com.familymed.form.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Conditional Logic Engine - xử lý logic hiển thị/ẩn câu hỏi
 * Hỗ trợ:
 * - Điều kiện dựa trên câu trả lời của câu hỏi khác
 * - Toán tử: equals, greaterThan, lessThan, contains, in, vv
 * - Các luật: SHOW, HIDE, REQUIRE, DISABLE
 */
@Service
@RequiredArgsConstructor
public class ConditionalLogicEngine {
    
    private final ObjectMapper objectMapper;
    
    /**
     * Mô tả một trạng thái có điều kiện
     */
    public static class ConditionalState {
        public boolean visible = true;
        public boolean required = false;
        public boolean disabled = false;
        
        public ConditionalState() {}
        
        public ConditionalState(boolean visible, boolean required, boolean disabled) {
            this.visible = visible;
            this.required = required;
            this.disabled = disabled;
        }
    }
    
    /**
     * Đánh giá một điều kiện dơn từ Map
     * @param condition Map chứa targetQuestion, operator, value
     * @param answers Map các câu trả lời hiện tại
     */
    public boolean evaluateSingleCondition(Map<String, Object> condition, Map<String, Object> answers) {
        try {
            // Convert Map to JsonNode for processing
            JsonNode conditionNode = objectMapper.valueToTree(condition);
            
            // Convert answers to Map<String, String>
            Map<String, String> stringAnswers = new HashMap<>();
            if (answers != null) {
                answers.forEach((k, v) -> stringAnswers.put(k, v != null ? v.toString() : ""));
            }
            
            return evaluateSingleConditionNode(conditionNode, stringAnswers);
        } catch (Exception e) {
            return true; // Default to true if evaluation fails
        }
    }
    
    /**
     * Đánh giá tất cả điều kiện cho một câu hỏi
     * @param conditionRulesJson JSON array của các điều kiện
     * @param answers Map các câu trả lời hiện tại
     */
    public ConditionalState evaluateConditions(String conditionRulesJson, Map<String, String> answers) {
        ConditionalState state = new ConditionalState();
        
        if (conditionRulesJson == null || conditionRulesJson.isEmpty()) {
            return state;
        }
        
        try {
            JsonNode rules = objectMapper.readTree(conditionRulesJson);
            
            if (rules.isArray()) {
                for (JsonNode rule : rules) {
                    String conditionType = rule.get("conditionType").asText("SHOW");
                    
                    if (evaluateRule(rule, answers)) {
                        applyCondition(state, conditionType);
                    }
                }
            }
        } catch (Exception e) {
            // If condition parsing fails, show the question by default
            return state;
        }
        
        return state;
    }
    
    /**
     * Đánh giá một điều kiện/rule
     */
    private boolean evaluateRule(JsonNode rule, Map<String, String> answers) {
        try {
            // rule format: {
            //   "conditionType": "SHOW",
            //   "operators": "AND|OR",
            //   "conditions": [
            //     {"targetQuestion": "Q1", "operator": "equals", "value": "yes"}
            //   ]
            // }
            
            String operators = rule.has("operators") ? 
                rule.get("operators").asText("AND") : "AND";
            
            JsonNode conditions = rule.get("conditions");
            if (conditions == null || !conditions.isArray()) {
                return true;
            }
            
            boolean result = "AND".equalsIgnoreCase(operators);
            boolean first = true;
            
            for (JsonNode condition : conditions) {
                boolean condResult = evaluateSingleConditionNode(condition, answers);
                
                if (first) {
                    result = condResult;
                    first = false;
                } else {
                    if ("AND".equalsIgnoreCase(operators)) {
                        result = result && condResult;
                    } else {
                        result = result || condResult;
                    }
                }
            }
            
            return result;
        } catch (Exception e) {
            return true; // Default to true if evaluation fails
        }
    }
    
    /**
     * Đánh giá một điều kiện đơn (JsonNode version - private)
     */
    private boolean evaluateSingleConditionNode(JsonNode condition, Map<String, String> answers) {
        try {
            String targetQuestion = condition.get("targetQuestion").asText();
            String operator = condition.get("operator").asText();
            JsonNode valueNode = condition.get("value");
            
            String actualValue = answers.getOrDefault(targetQuestion, "");
            String expectedValue = valueNode.isArray() ? 
                valueNode.toString() : valueNode.asText();
            
            return evaluateOperator(actualValue, operator, expectedValue);
        } catch (Exception e) {
            return true;
        }
    }
    
    /**
     * So sánh hai giá trị dựa trên operator
     */
    private boolean evaluateOperator(String actualValue, String operator, String expectedValue) {
        switch (operator.toLowerCase()) {
            case "equals":
            case "=":
            case "==":
                return actualValue.equalsIgnoreCase(expectedValue);
            
            case "not_equals":
            case "!=":
            case "<>":
                return !actualValue.equalsIgnoreCase(expectedValue);
            
            case "contains":
                return actualValue.toLowerCase().contains(expectedValue.toLowerCase());
            
            case "not_contains":
                return !actualValue.toLowerCase().contains(expectedValue.toLowerCase());
            
            case "starts_with":
                return actualValue.toLowerCase().startsWith(expectedValue.toLowerCase());
            
            case "ends_with":
                return actualValue.toLowerCase().endsWith(expectedValue.toLowerCase());
            
            case "in":
                // expectedValue là một array hoặc comma-separated values
                String[] values = expectedValue.replace("[", "").replace("]", "").split(",");
                for (String v : values) {
                    if (actualValue.equalsIgnoreCase(v.trim())) {
                        return true;
                    }
                }
                return false;
            
            case "greater_than":
            case ">":
                try {
                    return Double.parseDouble(actualValue) > Double.parseDouble(expectedValue);
                } catch (NumberFormatException e) {
                    return false;
                }
            
            case "less_than":
            case "<":
                try {
                    return Double.parseDouble(actualValue) < Double.parseDouble(expectedValue);
                } catch (NumberFormatException e) {
                    return false;
                }
            
            case "greater_than_or_equal":
            case ">=":
                try {
                    return Double.parseDouble(actualValue) >= Double.parseDouble(expectedValue);
                } catch (NumberFormatException e) {
                    return false;
                }
            
            case "less_than_or_equal":
            case "<=":
                try {
                    return Double.parseDouble(actualValue) <= Double.parseDouble(expectedValue);
                } catch (NumberFormatException e) {
                    return false;
                }
            
            case "is_empty":
                return actualValue.isEmpty();
            
            case "is_not_empty":
                return !actualValue.isEmpty();
            
            default:
                return true;
        }
    }
    
    /**
     * Áp dụng điều kiện vào trạng thái
     */
    private void applyCondition(ConditionalState state, String conditionType) {
        switch (conditionType.toUpperCase()) {
            case "SHOW":
                state.visible = true;
                break;
            case "HIDE":
                state.visible = false;
                break;
            case "REQUIRE":
                state.required = true;
                break;
            case "DISABLE":
                state.disabled = true;
                break;
            case "UNREQUIRE":
                state.required = false;
                break;
            case "ENABLE":
                state.disabled = false;
                break;
        }
    }
    
    /**
     * Tính toán conditional state cho tất cả câu hỏi trong form
     */
    public Map<String, ConditionalState> evaluateFormConditions(
        List<QuestionWithConditions> questions,
        Map<String, String> answers
    ) {
        Map<String, ConditionalState> states = new HashMap<>();
        
        for (QuestionWithConditions q : questions) {
            ConditionalState state = evaluateConditions(q.getConditionRulesJson(), answers);
            states.put(q.getQuestionCode(), state);
        }
        
        return states;
    }
    
    /**
     * DTO trung gian
     */
    public static class QuestionWithConditions {
        private String questionCode;
        private String conditionRulesJson;
        
        public QuestionWithConditions(String questionCode, String conditionRulesJson) {
            this.questionCode = questionCode;
            this.conditionRulesJson = conditionRulesJson;
        }
        
        public String getQuestionCode() {
            return questionCode;
        }
        
        public String getConditionRulesJson() {
            return conditionRulesJson;
        }
    }
}
