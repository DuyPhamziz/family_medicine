// hooks/useConditionalLogic.js
import { useCallback } from 'react';

/**
 * Hook to evaluate conditional logic client-side
 * Determines which questions should be visible, required, disabled based on answers
 */
export const useConditionalLogic = () => {
  
  /**
   * Evaluate conditions for a form
   * @param {Object} formSchema - The form structure (sections, questions)
   * @param {Object} answers - Current form answers {questionCode: value}
   * @returns {Object} Conditional state for each question {questionId: {visible, required, disabled}}
   */
  const evaluateConditions = useCallback((formSchema, answers) => {
    const conditionalState = {};
    
    if (!formSchema.sections) return conditionalState;
    
    // Initialize all questions as visible and required
    formSchema.sections.forEach(section => {
      section.questions?.forEach(question => {
        conditionalState[question.questionId] = {
          visible: true,
          required: question.required !== false,
          disabled: false
        };
      });
    });
    
    // Evaluate each question's conditions
    formSchema.sections.forEach(section => {
      section.questions?.forEach(question => {
        if (!question.conditions) return;
        
        question.conditions.forEach(condition => {
          const conditionMet = evaluateRule(condition.rules, answers);
          const state = conditionalState[question.questionId];
          
          switch (condition.type.toUpperCase()) {
            case 'SHOW':
              state.visible = conditionMet;
              break;
            case 'HIDE':
              state.visible = !conditionMet;
              break;
            case 'REQUIRE':
              state.required = conditionMet;
              break;
            case 'DISABLE':
              state.disabled = conditionMet;
              break;
            default:
              break;
          }
        });
      });
    });
    
    return conditionalState;
  }, []);
  
  /**
   * Evaluate a single rule recursively
   */
  const evaluateRule = useCallback((rules, answers) => {
    if (!rules) return true;
    
    // Handle AND
    if (rules.AND) {
      return rules.AND.every(rule => evaluateRule(rule, answers));
    }
    
    // Handle OR
    if (rules.OR) {
      return rules.OR.some(rule => evaluateRule(rule, answers));
    }
    
    // Handle NOT
    if (rules.NOT) {
      return !evaluateRule(rules.NOT, answers);
    }
    
    // Simple comparison: {questionCode, operator, value}
    const { questionCode, operator, value } = rules;
    const actualValue = answers?.[questionCode];
    
    return compareValues(actualValue, operator, value);
  }, []);
  
  /**
   * Compare values using operator
   */
  const compareValues = useCallback((actual, operator, expected) => {
    if (actual === null || actual === undefined) {
      return operator === 'empty' || operator === 'notEquals';
    }
    
    switch (operator?.toLowerCase()) {
      case 'equals':
        return String(actual) === String(expected);
      case 'not_equals':
        return String(actual) !== String(expected);
      case 'contains':
        return String(actual).includes(String(expected));
      case 'greater_than':
        return Number(actual) > Number(expected);
      case 'less_than':
        return Number(actual) < Number(expected);
      case 'in':
        return Array.isArray(expected) && expected.some(v => String(v) === String(actual));
      default:
        return false;
    }
  }, []);
  
  return { evaluateConditions, evaluateRule };
};
