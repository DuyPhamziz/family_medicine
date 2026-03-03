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
  // helper to normalize displayCondition JSON (used by public forms)
  const getConditionsForQuestion = (question) => {
    // new style already has "conditions" array that we can use directly
    if (question.conditions) return question.conditions;

    // legacy / common field coming from backend
    if (question.displayCondition) {
      try {
        const parsed = JSON.parse(question.displayCondition);
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        return arr.map(rule => ({
          type: (rule.conditionType || rule.type || 'SHOW').toString(),
          rules: convertDisplayRule(rule)
        }));
      } catch (e) {
        // invalid JSON; just ignore
        return null;
      }
    }

    return null;
  };

  // convert a single rule from displayCondition into the internal "rules" format
  const convertDisplayRule = (rule) => {
    // If rule already appears to be in "internal" format (has AND/OR/NOT), just return it
    if (rule && (rule.AND || rule.OR || rule.NOT)) {
      return rule;
    }

    // Simple condition case: has questionCode/operator/value but no nested conditions
    if (rule && rule.questionCode && rule.operator !== undefined) {
      return {
        questionCode: rule.questionCode,
        operator: rule.operator,
        value: rule.value
      };
    }

    // Otherwise rule may contain an array called `conditions` and optional `operators` for AND/OR
    const list = [];
    if (rule && rule.conditions) {
      const conds = Array.isArray(rule.conditions) ? rule.conditions : [rule.conditions];
      conds.forEach(c => {
        list.push({
          questionCode: c.questionCode || c.targetQuestion || c.questionId,
          operator: c.operator,
          value: c.value
        });
      });
    }

    if (list.length === 1) {
      return list[0];
    }

    const op = (rule.operators || '').toString().toUpperCase();
    if (op === 'OR') {
      return { OR: list };
    }
    // default to AND (empty list allowed)
    return { AND: list };
  };

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
    
    // Evaluate each question's conditions and aggregate results
    formSchema.sections.forEach(section => {
      section.questions?.forEach(question => {
        const conds = getConditionsForQuestion(question);
        if (!conds || conds.length === 0) return;

        // accumulator arrays for each rule type
        const showResults = [];
        const hideResults = [];
        const requireResults = [];
        const disableResults = [];

        conds.forEach(condition => {
          const met = evaluateRule(condition.rules, answers);
          switch (condition.type.toUpperCase()) {
            case 'SHOW':
              showResults.push(met);
              break;
            case 'HIDE':
              hideResults.push(met);
              break;
            case 'REQUIRE':
              requireResults.push(met);
              break;
            case 'DISABLE':
              disableResults.push(met);
              break;
            default:
              break;
          }
        });

        const state = conditionalState[question.questionId];
        // WHEN MULTIPLE SHOW RULES: question should be visible if ANY rule is true (OR semantics)
        if (showResults.length > 0) {
          state.visible = showResults.some(Boolean);
        }
        // HIDE rules should hide if ANY hide condition is met
        if (hideResults.length > 0) {
          if (hideResults.some(Boolean)) {
            state.visible = false;
          }
        }
        // REQUIRE rules OR together
        if (requireResults.length > 0) {
          state.required = requireResults.some(Boolean);
        }
        // DISABLE rules OR together
        if (disableResults.length > 0) {
          state.disabled = disableResults.some(Boolean);
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
      return operator === 'empty' || operator === 'notEquals';
    }

    // normalize operator string to snake_case for easier matching
    let op = operator ? operator.toString() : '';
    // convert camelCase to snake_case (e.g. lessThan -> less_than)
    op = op.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
    // handle alternate naming variations
    if (op === 'notequals') op = 'not_equals';
    if (op === 'greaterthanorequal') op = 'greater_than_or_equal';
    if (op === 'lessthanorequal') op = 'less_than_or_equal';

    switch (op) {
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
      case 'greater_than_or_equal':
        return Number(actual) >= Number(expected);
      case 'less_than_or_equal':
        return Number(actual) <= Number(expected);
      case 'in':
        return Array.isArray(expected) && expected.some(v => String(v) === String(actual));
      default:
        return false;
    }
  }, []);
  
  return { evaluateConditions, evaluateRule };
};
