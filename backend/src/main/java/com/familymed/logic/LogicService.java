package com.familymed.logic;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.expression.Expression;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class LogicService {

    private final LogicFormulaRepository formulaRepository;
    private final LogicConditionRepository conditionRepository;
    private final ExpressionParser parser = new SpelExpressionParser();

    /**
     * Evaluates a formula with given input variables and returns the result and classification.
     */
    public CalculationResult evaluate(String formulaCode, Map<String, Object> inputs) {
        LogicFormula formula = formulaRepository.findByFormulaCode(formulaCode)
                .orElseThrow(() -> new RuntimeException("Formula not found: " + formulaCode));

        try {
            // 1. Evaluate individual expression
            StandardEvaluationContext context = new StandardEvaluationContext();
            inputs.forEach(context::setVariable);
            
            Expression exp = parser.parseExpression(formula.getExpression());
            Double numericResult = exp.getValue(context, Double.class);

            // 2. Evaluate conditions (Risk Stratification)
            List<LogicCondition> conditions = conditionRepository.findByFormulaFormulaIdOrderByEvaluationOrderAsc(formula.getFormulaId());
            
            String label = "UNKNOWN";
            String value = "UNKNOWN";
            String recommendation = "";

            if (numericResult != null) {
                // Add the result itself to context for conditions like "result > 25"
                context.setVariable("result", numericResult);
                
                for (LogicCondition condition : conditions) {
                    Expression condExp = parser.parseExpression(condition.getConditionExpression());
                    Boolean match = condExp.getValue(context, Boolean.class);
                    
                    if (Boolean.TRUE.equals(match)) {
                        label = condition.getResultLabel();
                        value = condition.getResultValue();
                        recommendation = condition.getRecommendation();
                        break;
                    }
                }
            }

            return new CalculationResult(numericResult, label, value, recommendation);

        } catch (Exception e) {
            log.error("Error evaluating formula {}: {}", formulaCode, e.getMessage());
            throw new RuntimeException("Evaluation failed: " + e.getMessage());
        }
    }

    public record CalculationResult(
            Double result,
            String label,
            String value,
            String recommendation
    ) {}
}
