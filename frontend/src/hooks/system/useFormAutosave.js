// hooks/useFormAutosave.js
import { useEffect, useRef } from 'react';

/**
 * Hook to automatically save form progress to localStorage
 * Saves after debounce delay (default 2 seconds)
 */
export const useFormAutosave = (formId, answers, debounceMs = 2000) => {
  const timeoutRef = useRef(null);
  const lastSavedRef = useRef(null);
  
  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      const storageKey = `form_draft_${formId}`;
      const draftData = {
        answers,
        savedAt: new Date().toISOString(),
      };
      
      localStorage.setItem(storageKey, JSON.stringify(draftData));
      lastSavedRef.current = answers;
      
      console.log(`✓ Form draft saved for ${formId}`);
    }, debounceMs);
    
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [formId, answers, debounceMs]);
  
  /**
   * Load draft from localStorage
   */
  const loadDraft = () => {
    const storageKey = `form_draft_${formId}`;
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : null;
  };
  
  /**
   * Clear draft from localStorage
   */
  const clearDraft = () => {
    const storageKey = `form_draft_${formId}`;
    localStorage.removeItem(storageKey);
    console.log(`✓ Form draft cleared for ${formId}`);
  };
  
  return { loadDraft, clearDraft };
};
