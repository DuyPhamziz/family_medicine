// components/form/DynamicFormRenderer.jsx
import { useState, useEffect } from 'react';
import { useConditionalLogic } from '../../hooks/system/useConditionalLogic';
import { useFormAutosave } from '../../hooks/system/useFormAutosave';
import './DynamicFormRenderer.css';

const EMPTY_ANSWERS = {};

/**
 * Dynamic form renderer that displays form based on JSON schema
 * Supports:
 * - All question types (text, number, choice, date, etc.)
 * - Conditional display/require logic
 * - Autosave to localStorage
 * - Real-time validation
 */
export const DynamicFormRenderer = ({ 
  formSchema, 
  formId, 
  onSubmit, 
  readOnly = false,
  initialAnswers = EMPTY_ANSWERS 
}) => {
  
  const [answers, setAnswers] = useState(initialAnswers);
  const [errors, setErrors] = useState({});
  const { evaluateConditions } = useConditionalLogic();
  const { loadDraft, clearDraft } = useFormAutosave(formId, answers);
  
  const [conditionalState, setConditionalState] = useState({});
  
  useEffect(() => {
    // Load draft on mount
    const draft = loadDraft();
    if (draft?.answers) {
      setAnswers(draft.answers);
    }
  }, []);

  useEffect(() => {
    if (initialAnswers && Object.keys(initialAnswers).length > 0) {
      setAnswers(initialAnswers);
    }
  }, [initialAnswers]);
  
  useEffect(() => {
    // Recalculate conditional state whenever answers change
    const state = evaluateConditions(formSchema, answers);
    setConditionalState(state);
  }, [answers, formSchema, evaluateConditions]);
  
  const handleAnswerChange = (questionCode, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionCode]: value
    }));
    
    // Clear error for this question
    if (errors[questionCode]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[questionCode];
        return updated;
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formSchema?.sections) return true;
    
    formSchema.sections.forEach(section => {
      section.questions?.forEach(question => {
        const state = conditionalState[question.questionId];
        
        // Skip validation if question is hidden
        if (state && !state.visible) {
          return;
        }
        
        // Check required
        const isRequired = state ? state.required : question.required;
        if (isRequired && (!answers[question.questionCode] || answers[question.questionCode] === '')) {
          newErrors[question.questionCode] = `${question.questionText} is required`;
        }
      });
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    clearDraft();
    
    if (onSubmit) {
      await onSubmit(answers);
    }
  };
  
  if (!formSchema?.sections) {
    return <div className="form-error">Form schema not available</div>;
  }
  
  return (
    <form className="dynamic-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h1>{formSchema.formName || formSchema.title}</h1>
        {formSchema.description && <p className="form-description">{formSchema.description}</p>}
      </div>
      
      {formSchema.sections.map(section => (
        <section key={section.sectionId} className="form-section">
          <h2 className="section-title">{section.sectionName}</h2>
          
          {section.questions?.map(question => {
            const state = conditionalState[question.questionId];
            const isVisible = state ? state.visible : true;
            const isRequired = state ? state.required : question.required;
            const isDisabled = state ? state.disabled : false;
            
            if (!isVisible) return null;
            
            return (
              <div key={question.questionId} className="form-question">
                <label htmlFor={question.questionCode} className="question-label">
                  {question.questionText}
                  {isRequired && <span className="required-indicator">*</span>}
                </label>
                
                {question.helpText && <p className="help-text">{question.helpText}</p>}
                
                {renderQuestionInput(
                  question,
                  answers[question.questionCode],
                  (value) => handleAnswerChange(question.questionCode, value),
                  isDisabled,
                  readOnly
                )}
                
                {errors[question.questionCode] && (
                  <p className="error-message">{errors[question.questionCode]}</p>
                )}
              </div>
            );
          })}
        </section>
      ))}
      
      {!readOnly && (
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </div>
      )}
    </form>
  );
};

/**
 * Render appropriate input based on question type
 */
function renderQuestionInput(question, value, onChange, disabled, readOnly) {
  const questionType = question.questionType?.toUpperCase();
  
  switch (questionType) {
    case 'TEXT':
      return (
        <textarea
          id={question.questionCode}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || readOnly}
          className="form-input textarea-input"
          rows="4"
        />
      );
      
    case 'NUMBER':
      return (
        <input
          type="number"
          id={question.questionCode}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || readOnly}
          min={question.minValue}
          max={question.maxValue}
          className="form-input"
        />
      );
      
    case 'DATE':
      return (
        <input
          type="date"
          id={question.questionCode}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || readOnly}
          className="form-input"
        />
      );
      
    case 'BOOLEAN':
      return (
        <div className="checkbox-input">
          <input
            type="checkbox"
            id={question.questionCode}
            checked={value === true || value === 'true' || value === '1'}
            onChange={(e) => onChange(e.target.checked ? 'true' : 'false')}
            disabled={disabled || readOnly}
          />
          <label htmlFor={question.questionCode}>{question.questionText}</label>
        </div>
      );
      
    case 'SINGLE_CHOICE':
      return (
        <div className="radio-group">
          {question.options?.map((option, idx) => {
            const optionId = `${question.questionCode}-${idx}`;
            return (
              <label key={`${question.questionCode}-${idx}`} htmlFor={optionId} className="radio-label">
                <input
                  id={optionId}
                  type="radio"
                  name={question.questionCode}
                  value={option.optionValue || option.value || option.optionText || option.text}
                  checked={value === (option.optionValue || option.value || option.optionText || option.text)}
                  onChange={(e) => onChange(e.target.value)}
                  disabled={disabled || readOnly}
                />
                {option.optionText || option.text}
              </label>
            );
          })}
        </div>
      );
      
    case 'MULTIPLE_CHOICE':
      const selectedValues = Array.isArray(value) ? value : (value ? [value] : []);
      return (
        <div className="checkbox-group">
          {question.options?.map((option, idx) => {
            const optionId = `${question.questionCode}-${idx}`;
            return (
              <label key={`${question.questionCode}-${idx}`} htmlFor={optionId} className="checkbox-label">
                <input
                  id={optionId}
                  type="checkbox"
                  name={question.questionCode}
                  value={option.optionValue || option.value || option.optionText || option.text}
                  checked={selectedValues.includes(option.optionValue || option.value || option.optionText || option.text)}
                  onChange={(e) => {
                    const newValues = [...selectedValues];
                    if (e.target.checked) {
                      newValues.push(e.target.value);
                    } else {
                      newValues.splice(newValues.indexOf(e.target.value), 1);
                    }
                    onChange(newValues);
                  }}
                  disabled={disabled || readOnly}
                />
                {option.optionText || option.text}
              </label>
            );
          })}
        </div>
      );
      
    case 'IMAGE_UPLOAD':
      return (
        <input
          type="file"
          id={question.questionCode}
          accept="image/*"
          onChange={(e) => onChange(e.target.files?.[0]?.name)}
          disabled={disabled || readOnly}
          className="form-input"
        />
      );
      
    default:
      return (
        <input
          type="text"
          id={question.questionCode}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || readOnly}
          className="form-input"
        />
      );
  }
}
