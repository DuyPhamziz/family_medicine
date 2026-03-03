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
        // Use questionId if available, fallback to questionCode for public forms
        const questionKey = question.questionId || question.questionCode;
        conditionalState[questionKey] = {
          visible: true,
          required: question.required !== false,
          disabled: false
        };
      });
    });
    
    // Evaluate each question's conditions
    formSchema.sections.forEach(section => {
      section.questions?.forEach(question => {
        const questionKey = question.questionId || question.questionCode;
        const state = conditionalState[questionKey];
        
        // Handle legacy conditions format
        if (question.conditions) {
          question.conditions.forEach(condition => {
            const conditionMet = evaluateRule(condition.rules, answers);
            
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
        }
        
        // Handle new displayCondition format (array of rules)
        if (question.displayCondition) {
          try {
            let rules = question.displayCondition;
            
            // Parse if it's a JSON string
            if (typeof rules === 'string') {
              rules = JSON.parse(rules);
            }
            
            console.log('[useConditionalLogic] Processing displayCondition:', {
              questionCode: question.questionCode,
              questionText: question.questionText,
              rules,
              answers
            });
            
            // If rules exist, question is visible only when ALL rules are true (AND logic)
            if (Array.isArray(rules) && rules.length > 0) {
              const allRulesMet = rules.every(rule => {
                const result = evaluateRule(rule, answers);
                console.log('[useConditionalLogic] Rule evaluation:', {
                  rule,
                  result,
                  answers
                });
                return result;
              });
              state.visible = allRulesMet;
              console.log('[useConditionalLogic] All rules met?', allRulesMet);
            }
            // If no rules, question is always visible
            else {
              state.visible = true;
            }
          } catch (e) {
            console.warn("Could not parse displayCondition:", e);
            state.visible = true;
          }
        }
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
      return operator === 'empty' || operator === 'notEquals' || operator === 'not_equals';
    }
    
    // Normalize operator to handle both camelCase and snake_case
    const normalizedOp = operator?.toLowerCase().replace(/_/g, '');
    
    switch (normalizedOp) {
      case 'equals':
        return String(actual) === String(expected);
      case 'notequals':
        return String(actual) !== String(expected);
      case 'contains':
        return String(actual).includes(String(expected));
      case 'greaterthan':
        return Number(actual) > Number(expected);
      case 'lessthan':
        return Number(actual) < Number(expected);
      case 'greaterthanorequal':
        return Number(actual) >= Number(expected);
      case 'lessthanorequal':
        return Number(actual) <= Number(expected);
      case 'in':
        return Array.isArray(expected) && expected.some(v => String(v) === String(actual));
      default:
        console.warn(`Unknown operator: ${operator}`);
        return false;
    }
  }, []);
  
  return { evaluateConditions, evaluateRule };
};
