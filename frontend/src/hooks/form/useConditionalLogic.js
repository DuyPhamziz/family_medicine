import { useState, useCallback, useEffect } from 'react';
import api from '../../service/api';

/**
 * Hook to evaluate conditional logic for form questions
 * Calls backend API to check visibility, requirement, etc. of questions
 */
export const useConditionalLogic = (questionConditions = []) => {
  const [conditions, setConditions] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  /**
   * Evaluate all conditions based on current answers
   */
  const evaluateConditions = useCallback(async (answers) => {
    if (!questionConditions || questionConditions.length === 0) {
      setConditions({});
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/api/forms/conditions/evaluate', {
        answers,
        questionConditions
      });
      
      if (response.data.status === 'success') {
        setConditions(response.data.conditions || {});
      }
    } catch (err) {
      console.error('Error evaluating conditions:', err);
      setError(err.message);
      // Fall back to showing all questions if evaluation fails
      setConditions({});
    } finally {
      setLoading(false);
    }
  }, [questionConditions]);
  
  /**
   * Check single condition without API call (faster)
   */
  const checkCondition = useCallback(async (condition, answers) => {
    try {
      const response = await api.post('/api/forms/conditions/check', {
        condition,
        answers
      });
      
      return response.data.result;
    } catch (err) {
      console.error('Error checking condition:', err);
      return true; // Default to showing if error
    }
  }, []);
  
  /**
   * Get metadata for a question
   */
  const getQuestionState = useCallback((questionCode) => {
    return conditions[questionCode] || {
      visible: true,
      required: false,
      disabled: false
    };
  }, [conditions]);
  
  /**
   * Check if question should be visible
   */
  const isVisible = useCallback((questionCode) => {
    return getQuestionState(questionCode).visible !== false;
  }, [getQuestionState]);
  
  /**
   * Check if question is required
   */
  const isRequired = useCallback((questionCode) => {
    return getQuestionState(questionCode).required === true;
  }, [getQuestionState]);
  
  /**
   * Check if question is disabled
   */
  const isDisabled = useCallback((questionCode) => {
    return getQuestionState(questionCode).disabled === true;
  }, [getQuestionState]);
  
  return {
    conditions,
    loading,
    error,
    evaluateConditions,
    checkCondition,
    getQuestionState,
    isVisible,
    isRequired,
    isDisabled
  };
};

export default useConditionalLogic;
