// hooks/useConditionalLogic.js
import { useCallback } from 'react';

/**
 * Hook to evaluate conditional logic client-side
 * Determines which questions should be visible, required, disabled based on answers
 */
export const useConditionalLogic = () => {
  
  /**
   * Compare values using operator
   */
  const compareValues = useCallback((actual, operator, expected) => {
    if (actual === null || actual === undefined) {
      return operator === 'empty' || operator === 'notEquals' || operator === 'not_equals';
    }
    
    switch (operator?.toLowerCase()) {
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
      case 'in':
        return Array.isArray(expected) && expected.some(v => String(v) === String(actual));
      default:
        console.warn(`Unknown operator: ${operator}`);
        return false;
    }
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
  }, [compareValues]);

  // helper to normalize displayCondition JSON (used by public forms)
  const getConditionsForQuestion = (question) => {
    // new style already has "conditions" array that we can use directly
    if (question.conditions) return question.conditions;

    // legacy / common field coming from backend
    const rawCondition = question.conditionJson || question.displayCondition;
    if (rawCondition) {
      try {
        const parsed = JSON.parse(rawCondition);
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

  /**
   * Evaluate conditions for a form
   * @param {Object} formSchema - The form structure (sections, questions)
   * @param {Object} answers - Current form answers {questionCode: value}
   * @returns {Object} Conditional state for each question {questionId: {visible, required, disabled}}
   */
  const evaluateConditions = useCallback((formSchema, answers) => {
    const conditionalState = {};

    if (!formSchema?.sections) return conditionalState;

    // Initialize all questions as visible and required
    formSchema.sections.forEach(section => {
      section.questions?.forEach(question => {
        const questionKey = question.questionId || question.questionCode;
        conditionalState[questionKey] = {
          visible: true,
          required: question.required !== false,
          disabled: false
        };
      });
    });

    // Evaluate each question's conditions and aggregate results
    formSchema.sections.forEach(section => {
      section.questions?.forEach(question => {
        const conditions = getConditionsForQuestion(question);
        if (!conditions || !Array.isArray(conditions)) return;

        const questionKey = question.questionId || question.questionCode;
        const state = conditionalState[questionKey];
        if (!state) return;

        conditions.forEach(condition => {
          const conditionMet = evaluateRule(condition.rules, answers);

          switch ((condition.type || 'SHOW').toUpperCase()) {
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
  }, [evaluateRule]);
  
  return { evaluateConditions, evaluateRule };
};
