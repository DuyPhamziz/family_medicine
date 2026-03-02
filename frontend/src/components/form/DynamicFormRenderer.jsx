// components/form/DynamicFormRenderer.jsx
import { useState, useEffect } from 'react';
import { useConditionalLogic } from '../../hooks/system/useConditionalLogic';
import { useFormAutosave } from '../../hooks/system/useFormAutosave';
import { Send, AlertCircle } from 'lucide-react';

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

  useEffect(() => {
    if (!formSchema?.sections) return;

    const formulaQuestions = formSchema.sections
      .flatMap(section => section.questions || [])
      .filter(question => question.formulaExpression && question.questionCode);

    if (formulaQuestions.length === 0) return;

    const updates = {};

    formulaQuestions.forEach((question) => {
      const computedValue = evaluateFormulaExpression(question.formulaExpression, answers);
      if (computedValue !== null && computedValue !== undefined && computedValue !== '') {
        const normalized = Number.isFinite(computedValue)
          ? Number(computedValue.toFixed(4)).toString()
          : String(computedValue);
        if ((answers[question.questionCode] ?? '') !== normalized) {
          updates[question.questionCode] = normalized;
        }
      }
    });

    if (Object.keys(updates).length > 0) {
      setAnswers(prev => ({ ...prev, ...updates }));
    }
  }, [answers, formSchema]);
  
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
        if (question.formulaExpression) {
          return;
        }
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
    return (
      <div className="bg-red-50 border-l-4 border-red-500 px-6 py-4 rounded-lg">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
          <p className="text-red-800 font-medium">Form schema not available</p>
        </div>
      </div>
    );
  }
  
  return (
    <form className="space-y-6 sm:space-y-8" onSubmit={handleSubmit}>
      {formSchema.sections.map((section, sectionIdx) => (
        <section 
          key={section.sectionId || section.sectionCode || `section-${sectionIdx}`} 
          className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 pb-3 border-b-2 border-blue-200 flex items-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
              {sectionIdx + 1}
            </span>
            {section.sectionName}
          </h2>
          
          <div className="space-y-4 sm:space-y-5">
            {section.questions?.map((question, questionIdx) => {
              const state = conditionalState[question.questionId];
              const isVisible = state ? state.visible : true;
              const isRequired = state ? state.required : question.required;
              const isDisabled = state ? state.disabled : false;
              
              if (!isVisible) return null;
              
              return (
                <div
                  key={question.questionId || question.questionCode || `question-${sectionIdx}-${questionIdx}`}
                  className="bg-white rounded-lg p-4 sm:p-5 shadow-sm border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <label htmlFor={question.questionCode} className="block text-base sm:text-lg font-semibold text-gray-800 mb-2">
                    {question.questionText}
                    {isRequired && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  
                  {question.helpText && (
                    <p className="text-sm text-gray-600 mb-3 italic bg-blue-50 px-3 py-2 rounded-lg border-l-4 border-blue-400">
                      {question.helpText}
                    </p>
                  )}
                  
                  {renderQuestionInput(
                    question,
                    answers[question.questionCode],
                    (value) => handleAnswerChange(question.questionCode, value),
                    isDisabled || Boolean(question.formulaExpression),
                    readOnly
                  )}
                  
                  {errors[question.questionCode] && (
                    <div className="flex items-center gap-2 mt-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg border-l-4 border-red-500">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <p className="font-medium">{errors[question.questionCode]}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
      
      {!readOnly && (
        <div className="pt-4 sm:pt-6 flex justify-center">
          <button 
            type="submit" 
            className="w-full sm:w-auto min-w-[200px] px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Send className="w-5 h-5" />
            Gửi biểu mẫu
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
  const inputClasses = "w-full px-4 py-3 sm:py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none text-base disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500";
  
  switch (questionType) {
    case 'TEXT':
      return (
        <textarea
          id={question.questionCode}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || readOnly}
          className={`${inputClasses} resize-y min-h-[100px]`}
          rows="4"
          placeholder="Nhập câu trả lời chi tiết..."
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
          className={inputClasses}
          placeholder="Nhập số..."
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
          className={inputClasses}
        />
      );
      
    case 'BOOLEAN':
      return (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors">
          <input
            type="checkbox"
            id={question.questionCode}
            checked={value === true || value === 'true' || value === '1'}
            onChange={(e) => onChange(e.target.checked ? 'true' : 'false')}
            disabled={disabled || readOnly}
            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
          />
          <label htmlFor={question.questionCode} className="text-base font-medium text-gray-700 cursor-pointer select-none">
            {question.questionText}
          </label>
        </div>
      );
      
    case 'SINGLE_CHOICE':
      return (
        <div className="space-y-2">
          {question.options?.map((option, idx) => {
            const optionId = `${question.questionCode}-${idx}`;
            const optionValue = option.optionValue || option.value || option.optionText || option.text;
            const isSelected = value === optionValue;
            
            return (
              <label 
                key={`${question.questionCode}-${idx}`} 
                htmlFor={optionId} 
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                  isSelected 
                    ? 'bg-blue-50 border-blue-500 shadow-md' 
                    : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input
                  id={optionId}
                  type="radio"
                  name={question.questionCode}
                  value={optionValue}
                  checked={isSelected}
                  onChange={(e) => onChange(e.target.value)}
                  disabled={disabled || readOnly}
                  className="w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                />
                <span className={`text-base font-medium ${isSelected ? 'text-blue-800' : 'text-gray-700'}`}>
                  {option.optionText || option.text}
                </span>
              </label>
            );
          })}
        </div>
      );
      
    case 'MULTIPLE_CHOICE':
      const selectedValues = Array.isArray(value) ? value : (value ? [value] : []);
      return (
        <div className="space-y-2">
          {question.options?.map((option, idx) => {
            const optionId = `${question.questionCode}-${idx}`;
            const optionValue = option.optionValue || option.value || option.optionText || option.text;
            const isSelected = selectedValues.includes(optionValue);
            
            return (
              <label 
                key={`${question.questionCode}-${idx}`} 
                htmlFor={optionId} 
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                  isSelected 
                    ? 'bg-blue-50 border-blue-500 shadow-md' 
                    : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input
                  id={optionId}
                  type="checkbox"
                  name={question.questionCode}
                  value={optionValue}
                  checked={isSelected}
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
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                />
                <span className={`text-base font-medium ${isSelected ? 'text-blue-800' : 'text-gray-700'}`}>
                  {option.optionText || option.text}
                </span>
              </label>
            );
          })}
        </div>
      );
      
    case 'IMAGE_UPLOAD':
      return (
        <div className="relative">
          <input
            type="file"
            id={question.questionCode}
            accept="image/*"
            onChange={(e) => onChange(e.target.files?.[0]?.name)}
            disabled={disabled || readOnly}
            className="block w-full text-base text-gray-700 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-blue-500 file:to-cyan-500 file:text-white hover:file:bg-gradient-to-r hover:file:from-blue-600 hover:file:to-cyan-600 file:cursor-pointer file:transition-all file:duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      );
      
    default:
      return (
        <input
          type="text"
          id={question.questionCode}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || readOnly}
          className={inputClasses}
          placeholder="Nhập câu trả lời..."
        />
      );
  }
}

function evaluateFormulaExpression(expression, answers) {
  if (!expression || typeof expression !== 'string') return null;
  try {
    const jsExpression = expression
      .replace(/#([a-zA-Z0-9_]+)/g, (_, key) => {
        const raw = answers[key];
        if (raw === undefined || raw === null || raw === '') return '0';
        const parsed = Number(raw);
        return Number.isNaN(parsed) ? '0' : String(parsed);
      })
      .replace(/\^/g, '**');

    const result = new Function(`return (${jsExpression});`)();
    if (result === null || result === undefined || Number.isNaN(result)) return null;
    return result;
  } catch {
    return null;
  }
}
