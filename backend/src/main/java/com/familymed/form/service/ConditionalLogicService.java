package com.familymed.form.service;

import com.familymed.form.entity.QuestionCondition;
import com.familymed.form.repository.QuestionConditionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Evaluates conditional logic rules to determine visibility, requirement, and disable states of form questions
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ConditionalLogicService {
    
    private final QuestionConditionRepository conditionRepository;
    private final ObjectMapper objectMapper;
    
    /**
     * Evaluate all conditions for a given set of form answers
     * Returns map of question ID -> conditional state (visible, required, disabled, etc.)
     */
    public Map<String, Map<String, Object>> evaluateConditions(UUID formId, Map<String, Object> answersMap) {
        Map<String, Map<String, Object>> results = new HashMap<>();
        Map<String, Object> safeAnswers = answersMap != null ? answersMap : Collections.emptyMap();
        
        List<QuestionCondition> conditions = conditionRepository.findByQuestion_Section_Form_FormIdOrderByPriority(formId);
        
        for (QuestionCondition condition : conditions) {
            String questionId = condition.getQuestion().getQuestionId().toString();
            
            // Initialize state for this question
            if (!results.containsKey(questionId)) {
                results.put(questionId, new HashMap<>());
                results.get(questionId).put("visible", true);
                results.get(questionId).put("required", condition.getQuestion().getRequired() != null ? condition.getQuestion().getRequired() : true);
                results.get(questionId).put("disabled", false);
            }
            
            // Evaluate this condition
            boolean conditionMet = evaluateSingleCondition(condition, safeAnswers);
            Map<String, Object> state = results.get(questionId);
            
            switch (condition.getConditionType().toUpperCase()) {
                case "SHOW" -> state.put("visible", conditionMet);
                case "HIDE" -> state.put("visible", !conditionMet);
                case "REQUIRE" -> state.put("required", conditionMet);
                case "DISABLE" -> state.put("disabled", conditionMet);
            }
        }
        
        return results;
    }
    
    /**
     * Evaluate a single condition rule
     * Returns true if condition is met, false otherwise
     */
    private boolean evaluateSingleCondition(QuestionCondition condition, Map<String, Object> answersMap) {
        try {
            Map<String, Object> rules = objectMapper.readValue(condition.getConditionRulesJson(), Map.class);
            return evaluateRules(rules, answersMap);
        } catch (Exception e) {
            log.error("Error evaluating condition: {}", condition.getConditionId(), e);
            return false;
        }
    }
    
    /**
     * Recursively evaluate rules with AND/OR/NOT operators
     */
    private boolean evaluateRules(Map<String, Object> rules, Map<String, Object> answersMap) {
        if (rules == null || rules.isEmpty()) {
            return true;
        }

        // Handle nested AND/OR/NOT
        if (rules.containsKey("AND")) {
            List<Map<String, Object>> andRules = (List<Map<String, Object>>) rules.get("AND");
            return andRules.stream().allMatch(r -> evaluateRules(r, answersMap));
        }
        
        if (rules.containsKey("OR")) {
            List<Map<String, Object>> orRules = (List<Map<String, Object>>) rules.get("OR");
            return orRules.stream().anyMatch(r -> evaluateRules(r, answersMap));
        }
        
        if (rules.containsKey("NOT")) {
            Map<String, Object> notRule = (Map<String, Object>) rules.get("NOT");
            return !evaluateRules(notRule, answersMap);
        }
        
        // Simple comparison rule: {questionCode: "q1", operator: "equals", value: "yes"}
        String questionCode = (String) rules.get("questionCode");
        String operator = (String) rules.get("operator");
        Object expectedValue = rules.get("value");
        
        Object actualValue = answersMap.get(questionCode);
        
        return compareValues(actualValue, operator, expectedValue);
    }
    
    /**
     * Compare actual vs expected value using operator
     */
    private boolean compareValues(Object actual, String operator, Object expected) {
        if (operator == null || operator.isBlank()) {
            return false;
        }

        if (actual == null) {
            return "empty".equalsIgnoreCase(operator)
                    || "notEquals".equalsIgnoreCase(operator)
                    || "not_equals".equalsIgnoreCase(operator);
        }

        String actualStr = actual.toString();
        String expectedStr = expected == null ? null : expected.toString();
        
        return switch (operator.toLowerCase()) {
            case "equals" -> Objects.equals(actualStr, expectedStr);
            case "notequals", "not_equals" -> !Objects.equals(actualStr, expectedStr);
            case "contains" -> expectedStr != null && actualStr.contains(expectedStr);
            case "greater_than" -> {
                try {
                    double a = Double.parseDouble(actualStr);
                    double e = Double.parseDouble(expectedStr);
                    yield a > e;
                } catch (Exception ex) {
                    yield false;
                }
            }
            case "less_than" -> {
                try {
                    double a = Double.parseDouble(actualStr);
                    double e = Double.parseDouble(expectedStr);
                    yield a < e;
                } catch (Exception ex) {
                    yield false;
                }
            }
            case "in" -> {
                if (!(expected instanceof List<?> values)) {
                    yield false;
                }
                yield values.stream().anyMatch(v -> Objects.equals(actualStr, v == null ? null : v.toString()));
            }
            default -> false;
        };
    }
    
    /**
     * Get all conditions for a specific question
     */
    public List<QuestionCondition> getConditionsForQuestion(UUID questionId) {
        return conditionRepository.findByQuestionQuestionIdAndEnabledTrue(questionId);
    }
}
