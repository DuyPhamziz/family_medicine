package com.familymed.form.service;

import org.springframework.expression.Expression;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Service to evaluate dynamic formulas using Spring Expression Language (SpEL).
 * Formulas can use variables from the answers map, prefixed with #.
 * Example: "#systolic_bp > 140 || #diastolic_bp > 90"
 */
@Service
public class FormulaEvaluationService {

    private final ExpressionParser parser = new SpelExpressionParser();

    /**
     * Evaluates a formula against a map of variables.
     * @param formula The SpEL formula string.
     * @param variables A map where keys are variable names used in the formula.
     * @return The result of the evaluation.
     */
    public Object evaluate(String formula, Map<String, Object> variables) {
        if (formula == null || formula.isBlank()) {
            return null;
        }
        
        try {
            StandardEvaluationContext context = new StandardEvaluationContext();
            if (variables != null) {
                // Populate context with variables from the map
                for (Map.Entry<String, Object> entry : variables.entrySet()) {
                    context.setVariable(entry.getKey(), entry.getValue());
                }
            }
            
            Expression expression = parser.parseExpression(formula);
            return expression.getValue(context);
        } catch (Exception e) {
            // Log error or handle appropriately
            System.err.println("Error evaluating formula '" + formula + "': " + e.getMessage());
            return null;
        }
    }

    /**
     * Evaluates a formula and converts the result to Double.
     * @param formula The SpEL formula string.
     * @param variables Variables map.
     * @return Result as Double, or 0.0 if evaluation fails or result is not a number.
     */
    public Double evaluateToDouble(String formula, Map<String, Object> variables) {
        Object result = evaluate(formula, variables);
        if (result == null) {
            return 0.0;
        }
        
        if (result instanceof Number) {
            return ((Number) result).doubleValue();
        }
        
        try {
            return Double.parseDouble(result.toString());
        } catch (Exception e) {
            return 0.0;
        }
    }

    /**
     * Evaluates a formula and converts the result to Boolean.
     * @param formula The SpEL formula string.
     * @param variables Variables map.
     * @return Result as Boolean, or false if evaluation fails.
     */
    public boolean evaluateToBoolean(String formula, Map<String, Object> variables) {
        Object result = evaluate(formula, variables);
        if (result instanceof Boolean) {
            return (Boolean) result;
        }
        return Boolean.parseBoolean(String.valueOf(result));
    }
}
