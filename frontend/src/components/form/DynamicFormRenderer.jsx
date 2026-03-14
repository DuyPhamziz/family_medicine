// components/form/DynamicFormRenderer.jsx
import { useState, useEffect, useMemo } from 'react';
import { useConditionalLogic } from '../../hooks/system/useConditionalLogic';
import { useFormAutosave } from '../../hooks/system/useFormAutosave';
import { Send, AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatToVietnamese, toDateInputValue, formatVietnameseLong, getAgeFromDate } from '../../utils/formatDate';
import { convertValue } from '../../utils/unitConverter';
import { validateMedicalValue, classifyBloodPressure, classifyBMI, getValidationStyles } from '../../utils/medicalValidation';
import MedicalHistoryComponent from './MedicalHistoryComponent';
import { MatrixDiseaseQuestion } from './MatrixDiseaseQuestion';

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
  const [repeatGroups, setRepeatGroups] = useState({});
  const [errors, setErrors] = useState({});
  const [validationWarnings, setValidationWarnings] = useState({});
  const { evaluateConditions } = useConditionalLogic();
  const { loadDraft, clearDraft } = useFormAutosave(formId, answers);
  
  const [conditionalState, setConditionalState] = useState({});

  const repeatGroupConfigs = useMemo(() => {
    const configs = {};
    if (!formSchema?.sections) {
      return configs;
    }

    formSchema.sections.forEach((section, sectionIdx) => {
      const sectionKey = section.sectionId || section.sectionCode || `section-${sectionIdx}`;
      (section.questions || []).forEach((question) => {
        if (!question.groupId || question.isRepeatableGroup !== true) {
          return;
        }

        if (!configs[question.groupId]) {
          configs[question.groupId] = {
            groupId: question.groupId,
            sectionKey,
            rootQuestion: null,
            childQuestions: [],
            maxRepeat: question.maxRepeat ?? null,
            labelAddButton: question.labelAddButton || 'Thêm mục khác',
          };
        }

        if (question.repeatGroupRoot) {
          configs[question.groupId].rootQuestion = question;
          if (question.maxRepeat !== null && question.maxRepeat !== undefined) {
            configs[question.groupId].maxRepeat = question.maxRepeat;
          }
          if (question.labelAddButton) {
            configs[question.groupId].labelAddButton = question.labelAddButton;
          }
        } else {
          configs[question.groupId].childQuestions.push(question);
        }
      });
    });

    Object.values(configs).forEach((config) => {
      config.childQuestions.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
    });

    return configs;
  }, [formSchema]);

  const visibleQuestions = (formSchema?.sections || [])
    .flatMap(section => section.questions || [])
    .filter(question => {
      const questionKey = question.questionId || question.questionCode;
      const state = conditionalState[questionKey];
      return state ? state.visible : true;
    });

  const visibleRequiredQuestions = visibleQuestions.filter(question => {
    const questionKey = question.questionId || question.questionCode;
    const state = conditionalState[questionKey];
    return state ? state.required : question.required;
  });

  const answeredRequiredCount = visibleRequiredQuestions.filter(question => {
    const value = answers[question.questionCode];
    return value !== undefined && value !== null && value !== '';
  }).length;

  const progressPercent = visibleRequiredQuestions.length === 0
    ? 100
    : Math.round((answeredRequiredCount / visibleRequiredQuestions.length) * 100);
  
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
    setRepeatGroups((prev) => {
      const next = { ...prev };
      Object.keys(repeatGroupConfigs).forEach((groupId) => {
        if (!Array.isArray(next[groupId])) {
          next[groupId] = [];
        }
      });
      return next;
    });
  }, [repeatGroupConfigs]);
  
  useEffect(() => {
    // Recalculate conditional state whenever answers change
    const state = evaluateConditions(formSchema, answers);
    console.log('[DynamicFormRenderer] Conditional state updated:', { state, answers, formSchema });
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

    // Validate medical values based on question metadata
    const question = formSchema?.sections
      ?.flatMap(s => s.questions || [])
      .find(q => q.questionCode === questionCode);

    if (question?.validationKey && value) {
      const validation = validateMedicalValue(value, question.validationKey);
      if (validation.message) {
        setValidationWarnings(prev => ({
          ...prev,
          [questionCode]: validation
        }));
      } else {
        setValidationWarnings(prev => {
          const updated = { ...prev };
          delete updated[questionCode];
          return updated;
        });
      }
    }
  };

  const handleRepeatAnswerChange = (groupId, repeatIndex, questionCode, value) => {
    setRepeatGroups((prev) => {
      const groupEntries = Array.isArray(prev[groupId]) ? [...prev[groupId]] : [];
      const entryIndex = groupEntries.findIndex((entry) => entry.repeatIndex === repeatIndex);
      if (entryIndex === -1) {
        groupEntries.push({ repeatIndex, answers: { [questionCode]: value } });
      } else {
        const currentEntry = groupEntries[entryIndex];
        groupEntries[entryIndex] = {
          ...currentEntry,
          answers: {
            ...(currentEntry.answers || {}),
            [questionCode]: value,
          },
        };
      }
      return {
        ...prev,
        [groupId]: groupEntries,
      };
    });

    const repeatKey = `${questionCode}__${groupId}__${repeatIndex}`;
    if (errors[repeatKey]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[repeatKey];
        return updated;
      });
    }
  };

  const addRepeatGroupEntry = (groupId) => {
    const config = repeatGroupConfigs[groupId];
    if (!config) return;

    setRepeatGroups((prev) => {
      const current = Array.isArray(prev[groupId]) ? [...prev[groupId]] : [];
      const nextRepeatIndex = current.length + 1;
      if (config.maxRepeat !== null && config.maxRepeat !== undefined && nextRepeatIndex > config.maxRepeat) {
        return prev;
      }
      current.push({ repeatIndex: nextRepeatIndex, answers: {} });
      return {
        ...prev,
        [groupId]: current,
      };
    });
  };

  const removeRepeatGroupEntry = (groupId, repeatIndex) => {
    setRepeatGroups((prev) => {
      const current = Array.isArray(prev[groupId]) ? prev[groupId] : [];
      const filtered = current.filter((entry) => entry.repeatIndex !== repeatIndex);
      return {
        ...prev,
        [groupId]: filtered,
      };
    });
  };

  const isEmptyValue = (value) => {
    if (value === undefined || value === null || value === '') {
      return true;
    }
    if (Array.isArray(value)) {
      return value.length === 0;
    }
    if (value && typeof value === 'object' && Array.isArray(value.selectedOptions)) {
      return value.selectedOptions.length === 0;
    }
    // For MATRIX_FAMILY_DISEASE: if value object exists with matrix structure,
    // it's valid even when empty (means "no diseases in family")
    if (value && typeof value === 'object' && Array.isArray(value.matrix)) {
      return false;
    }
    return false;
  };

  const buildSubmitAnswers = () => {
    const payload = { ...answers };

    Object.values(repeatGroupConfigs).forEach((config) => {
      if (!config.childQuestions || config.childQuestions.length === 0) {
        return;
      }

      config.childQuestions.forEach((question) => {
        const entries = [];
        const firstValue = answers[question.questionCode];
        if (!isEmptyValue(firstValue)) {
          entries.push({ repeatIndex: 0, value: firstValue });
        }

        const extras = Array.isArray(repeatGroups[config.groupId]) ? repeatGroups[config.groupId] : [];
        extras.forEach((entry) => {
          const nextValue = entry?.answers?.[question.questionCode];
          if (!isEmptyValue(nextValue)) {
            entries.push({ repeatIndex: entry.repeatIndex, value: nextValue });
          }
        });

        if (entries.length > 0) {
          payload[question.questionCode] = entries;
        }
      });
    });

    return payload;
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formSchema?.sections) return true;
    
    formSchema.sections.forEach(section => {
      section.questions?.forEach(question => {
        const questionKey = question.questionId || question.questionCode;
        const state = conditionalState[questionKey];
        
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

    Object.values(repeatGroupConfigs).forEach((config) => {
      const extraEntries = Array.isArray(repeatGroups[config.groupId]) ? repeatGroups[config.groupId] : [];
      if (extraEntries.length === 0) {
        return;
      }

      config.childQuestions.forEach((question) => {
        const questionKey = question.questionId || question.questionCode;
        const state = conditionalState[questionKey];
        if (state && !state.visible) {
          return;
        }

        const isRequired = state ? state.required : question.required;
        if (!isRequired || question.formulaExpression) {
          return;
        }

        extraEntries.forEach((entry) => {
          const value = entry?.answers?.[question.questionCode];
          if (isEmptyValue(value)) {
            const errorKey = `${question.questionCode}__${config.groupId}__${entry.repeatIndex}`;
            newErrors[errorKey] = `${question.questionText} is required`;
          }
        });
      });
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check 80% completion requirement
    if (progressPercent < 80) {
      setErrors({
        _form: `Vui lòng hoàn thành ít nhất 80% câu hỏi bắt buộc (hiện tại: ${progressPercent}%)`
      });
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    clearDraft();
    
    if (onSubmit) {
      await onSubmit(buildSubmitAnswers());
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
      {!readOnly && (
        <div className="sticky top-[72px] z-30 rounded-xl border border-blue-100 bg-white/95 backdrop-blur px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
            <span className="font-medium">Tiến độ hoàn thành</span>
            <span className={`font-semibold ${
              progressPercent >= 80 ? 'text-green-700' : 'text-blue-700'
            }`}>{answeredRequiredCount}/{visibleRequiredQuestions.length} • {progressPercent}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                progressPercent >= 80 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {progressPercent < 80 && (
            <div className="mt-2 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border-l-4 border-amber-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p>Cần hoàn thành ít nhất 80% để gửi biểu mẫu (còn thiếu {80 - progressPercent}%)</p>
            </div>
          )}
        </div>
      )}

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
              const questionKey = question.questionId || question.questionCode;
              const state = conditionalState[questionKey];
              const isVisible = state ? state.visible : true;
              const isRequired = state ? state.required : question.required;
              const isDisabled = state ? state.disabled : false;
              
              if (!isVisible) return null;
              
              return (
                <div
                  key={question.questionId || question.questionCode || `question-${sectionIdx}-${questionIdx}`}
                  className="bg-white rounded-lg p-4 sm:p-5 shadow-sm border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <label htmlFor={question.questionCode} className="block text-base sm:text-lg font-semibold text-gray-800">
                      {question.questionText}
                      {isRequired && <span className="text-red-500 ml-1">*</span>}
                      {!isRequired && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                          Không bắt buộc
                        </span>
                      )}
                    </label>
                    {!isRequired && !readOnly && answers[question.questionCode] && (
                      <button
                        type="button"
                        onClick={() => handleAnswerChange(question.questionCode, '')}
                        className="ml-2 px-3 py-1 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Bỏ qua
                      </button>
                    )}
                  </div>
                  
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
                  
                  {validationWarnings[question.questionCode] && (
                    <div className={`mt-2 flex items-center gap-2 text-sm px-3 py-2 rounded-lg border-l-4 ${
                      getValidationStyles(validationWarnings[question.questionCode].severity)
                    }`}>
                      {validationWarnings[question.questionCode].severity === 'error' && (
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      )}
                      {validationWarnings[question.questionCode].severity === 'warning' && (
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      )}
                      {validationWarnings[question.questionCode].severity === 'success' && (
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      )}
                      <p className="font-medium">{validationWarnings[question.questionCode].message}</p>
                    </div>
                  )}
                  
                  {/* Medical classification badges */}
                  {question.validationKey === 'BLOOD_PRESSURE_SYSTOLIC' && answers[question.questionCode] && (
                    (() => {
                      const diaQuestion = formSchema?.sections
                        ?.flatMap(s => s.questions || [])
                        .find(q => q.validationKey === 'BLOOD_PRESSURE_DIASTOLIC');
                      const classification = classifyBloodPressure(
                        answers[question.questionCode],
                        answers[diaQuestion?.questionCode] || 0
                      );
                      return classification ? (
                        <div className={`mt-2 px-3 py-2 rounded-lg text-sm font-semibold`}
                          style={{
                            backgroundColor: classification.color === 'green' ? '#dcfce7' : 
                                          classification.color === 'yellow' ? '#fef3c7' :
                                          classification.color === 'orange' ? '#fedba8' :
                                          classification.color === 'red' ? '#fecaca' : '#fee2e2',
                            borderLeft: `4px solid ${classification.color === 'green' ? '#16a34a' :
                                                     classification.color === 'yellow' ? '#ca8a04' :
                                                     classification.color === 'orange' ? '#ea580c' :
                                                     classification.color === 'red' ? '#dc2626' : '#991b1b'}`
                          }}>
                          🏥 {classification.classification}
                        </div>
                      ) : null;
                    })()
                  )}
                  
                  {/* BMI classification */}
                  {question.validationKey === 'BMI' && answers[question.questionCode] && (
                    (() => {
                      const classification = classifyBMI(answers[question.questionCode]);
                      return classification ? (
                        <div className={`mt-2 px-3 py-2 rounded-lg text-sm font-semibold`}
                          style={{
                            backgroundColor: classification.color === 'green' ? '#dcfce7' :
                                          classification.color === 'blue' ? '#dbeafe' :
                                          classification.color === 'orange' ? '#fedba8' : '#fecaca',
                            borderLeft: `4px solid ${classification.color === 'green' ? '#16a34a' :
                                                     classification.color === 'blue' ? '#0284c7' :
                                                     classification.color === 'orange' ? '#ea580c' : '#dc2626'}`
                          }}>
                          📊 {classification.classification}
                        </div>
                      ) : null;
                    })()
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

            {Object.values(repeatGroupConfigs)
              .filter((config) => config.sectionKey === (section.sectionId || section.sectionCode || `section-${sectionIdx}`))
              .map((config) => {
                const extraEntries = Array.isArray(repeatGroups[config.groupId]) ? repeatGroups[config.groupId] : [];
                const maxRepeat = config.maxRepeat;
                const canAdd = !readOnly && (maxRepeat === null || maxRepeat === undefined || extraEntries.length < maxRepeat);

                const hasVisibleChild = config.childQuestions.some((question) => {
                  const questionKey = question.questionId || question.questionCode;
                  const state = conditionalState[questionKey];
                  return state ? state.visible : true;
                });

                if (!hasVisibleChild) {
                  return null;
                }

                return (
                  <div key={`repeat-group-${config.groupId}`} className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
                    {extraEntries.map((entry) => (
                      <div key={`repeat-entry-${config.groupId}-${entry.repeatIndex}`} className="space-y-3 rounded-lg border border-emerald-200 bg-white p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-emerald-700">Nhóm lặp #{entry.repeatIndex + 1}</p>
                          {!readOnly && (
                            <button
                              type="button"
                              onClick={() => removeRepeatGroupEntry(config.groupId, entry.repeatIndex)}
                              className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                            >
                              Xóa nhóm này
                            </button>
                          )}
                        </div>

                        {config.childQuestions.map((question, childIdx) => {
                          const questionKey = question.questionId || question.questionCode;
                          const state = conditionalState[questionKey];
                          const isVisible = state ? state.visible : true;
                          const isRequired = state ? state.required : question.required;
                          const isDisabled = state ? state.disabled : false;
                          if (!isVisible) {
                            return null;
                          }

                          const value = entry?.answers?.[question.questionCode];
                          const errorKey = `${question.questionCode}__${config.groupId}__${entry.repeatIndex}`;

                          return (
                            <div
                              key={`repeat-question-${question.questionId || question.questionCode || childIdx}`}
                              className="rounded-lg border border-emerald-100 bg-white p-4"
                            >
                              <label className="mb-2 block text-sm font-semibold text-gray-800">
                                {question.questionText}
                                {isRequired && <span className="ml-1 text-red-500">*</span>}
                              </label>

                              {question.helpText && (
                                <p className="mb-2 rounded-lg border-l-4 border-blue-300 bg-blue-50 px-3 py-2 text-xs text-gray-600">
                                  {question.helpText}
                                </p>
                              )}

                              {renderQuestionInput(
                                question,
                                value,
                                (nextValue) => handleRepeatAnswerChange(config.groupId, entry.repeatIndex, question.questionCode, nextValue),
                                isDisabled || Boolean(question.formulaExpression),
                                readOnly
                              )}

                              {errors[errorKey] && (
                                <div className="mt-2 flex items-center gap-2 rounded-lg border-l-4 border-red-500 bg-red-50 px-3 py-2 text-sm text-red-600">
                                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                  <p className="font-medium">{errors[errorKey]}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}

                    {canAdd && (
                      <button
                        type="button"
                        onClick={() => addRepeatGroupEntry(config.groupId)}
                        className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
                      >
                        + {config.labelAddButton || 'Thêm mục khác'}
                      </button>
                    )}
                  </div>
                );
              })}
          </div>
        </section>
      ))}
      
      {!readOnly && (
        <div className="sticky bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur px-3 py-3 sm:px-0 sm:py-4">
          {errors._form && (
            <div className="mx-auto max-w-2xl mb-3 flex items-center gap-2 text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg border-l-4 border-red-500">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="font-medium">{errors._form}</p>
            </div>
          )}
          <div className="mx-auto w-full sm:w-auto flex flex-col items-center gap-2">
            <button 
              type="submit" 
              disabled={progressPercent < 80}
              className={`w-full sm:w-auto min-w-[220px] px-8 py-4 text-white font-bold text-lg rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                progressPercent >= 80
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 hover:shadow-xl hover:scale-105'
                  : 'bg-gray-400 cursor-not-allowed opacity-60'
              } disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100`}
              title={progressPercent < 80 ? `Cần hoàn thành ít nhất 80% (hiện tại: ${progressPercent}%)` : 'Gửi biểu mẫu'}
            >
              <Send className="w-5 h-5" />
              {progressPercent >= 80 ? 'Gửi biểu mẫu' : `Hoàn thành ${progressPercent}% (cần 80%)`}
            </button>
            {progressPercent < 80 && (
              <p className="text-xs text-gray-600 text-center">
                ⚠️ Vui lòng điền thêm {Math.ceil((80 - progressPercent) * visibleRequiredQuestions.length / 100)} câu hỏi bắt buộc
              </p>
            )}
          </div>
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
  const inputClasses = "w-full px-4 py-3 sm:py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none text-base text-gray-900 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500";
  
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
      const dateInputValue = toDateInputValue(value);
      const vietnameseDate = formatVietnameseLong(value);
      return (
        <div className="space-y-2">
          <input
            type="date"
            id={question.questionCode}
            value={dateInputValue || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled || readOnly}
            className={inputClasses}
          />
          {value && vietnameseDate && (
            <div className="text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg border-l-4 border-blue-400">
              📅 {vietnameseDate}
            </div>
          )}
        </div>
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
      
    case 'SINGLE_CHOICE_WITH_SUBFIELDS':
    case 'MULTIPLE_CHOICE_WITH_SUBFIELDS':
      // Value structure: { selectedOptions: [...], subFieldsData: {...} }
      const currentValue = value && typeof value === 'object' ? value : { selectedOptions: [], subFieldsData: {} };
      const selectedOpts = Array.isArray(currentValue.selectedOptions) ? currentValue.selectedOptions : [];
      const subFieldsData = currentValue.subFieldsData || {};
      const isSingleChoice = question.questionType === 'SINGLE_CHOICE_WITH_SUBFIELDS';
      
      return (
        <div className="space-y-3">
          {question.options?.map((option, idx) => {
            const optionId = `${question.questionCode}-${idx}`;
            const optionValue = option.optionValue || option.value || option.optionText || option.text;
            const isChecked = selectedOpts.includes(optionValue);
            
            // Parse sub-fields config from option
            let subFields = [];
            try {
              if (option.subFieldsConfig) {
                subFields = typeof option.subFieldsConfig === 'string' 
                  ? JSON.parse(option.subFieldsConfig) 
                  : option.subFieldsConfig;
              }
            } catch (e) {
              console.error('Failed to parse subFieldsConfig:', e);
            }
            
            const optionSubData = subFieldsData[optionValue] || {};
            
            return (
              <div key={`${question.questionCode}-${idx}`} className="border-2 border-gray-200 rounded-xl overflow-hidden">
                {/* Main option */}
                <label 
                  htmlFor={optionId} 
                  className={`flex items-center gap-3 p-4 transition-all duration-200 cursor-pointer ${
                    isChecked 
                      ? 'bg-blue-50 border-blue-500' 
                      : 'bg-white hover:border-blue-300 hover:bg-blue-50'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input
                    id={optionId}
                    type={isSingleChoice ? 'radio' : 'checkbox'}
                    name={question.questionCode}
                    value={optionValue}
                    checked={isChecked}
                    onChange={(e) => {
                      const newSelectedOpts = isSingleChoice ? [] : [...selectedOpts];
                      const newSubFieldsData = { ...subFieldsData };
                      
                      if (e.target.checked) {
                        if (isSingleChoice) {
                          // Keep only selected option data for single-choice mode.
                          Object.keys(newSubFieldsData).forEach((key) => delete newSubFieldsData[key]);
                        }
                        newSelectedOpts.push(optionValue);
                        // Initialize sub-fields data if needed
                        if (subFields.length > 0) {
                          newSubFieldsData[optionValue] = {};
                        }
                      } else {
                        const idx = newSelectedOpts.indexOf(optionValue);
                        if (idx > -1) newSelectedOpts.splice(idx, 1);
                        delete newSubFieldsData[optionValue];
                      }
                      
                      onChange({
                        selectedOptions: newSelectedOpts,
                        subFieldsData: newSubFieldsData
                      });
                    }}
                    disabled={disabled || readOnly}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <span className={`text-base font-medium ${isChecked ? 'text-blue-800' : 'text-gray-700'}`}>
                    {option.optionText || option.text}
                  </span>
                </label>
                
                {/* Sub-fields (only show when checked) */}
                {isChecked && subFields.length > 0 && (
                  <div className="bg-gray-50 p-4 border-t-2 border-gray-200 space-y-3">
                    {subFields.map((subField, sfIdx) => {
                      const subFieldValue = optionSubData[subField.key] || '';
                      const subFieldId = `${optionId}-sf-${sfIdx}`;
                      
                      return (
                        <div key={sfIdx} className="space-y-1">
                          <label htmlFor={subFieldId} className="block text-sm font-medium text-gray-700">
                            {subField.label}
                          </label>
                          
                          {subField.type === 'NUMBER' ? (
                            <input
                              id={subFieldId}
                              type="number"
                              value={subFieldValue}
                              onChange={(e) => {
                                const newSubFieldsData = { ...subFieldsData };
                                if (!newSubFieldsData[optionValue]) {
                                  newSubFieldsData[optionValue] = {};
                                }
                                newSubFieldsData[optionValue][subField.key] = e.target.value;
                                
                                onChange({
                                  selectedOptions: selectedOpts,
                                  subFieldsData: newSubFieldsData
                                });
                              }}
                              disabled={disabled || readOnly}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all disabled:bg-gray-100 text-gray-900 placeholder-gray-400"
                              placeholder={subField.placeholder || `Nhập ${subField.label.toLowerCase()}...`}
                            />
                          ) : subField.type === 'DATE' ? (
                            <input
                              id={subFieldId}
                              type="date"
                              value={subFieldValue}
                              onChange={(e) => {
                                const newSubFieldsData = { ...subFieldsData };
                                if (!newSubFieldsData[optionValue]) {
                                  newSubFieldsData[optionValue] = {};
                                }
                                newSubFieldsData[optionValue][subField.key] = e.target.value;
                                
                                onChange({
                                  selectedOptions: selectedOpts,
                                  subFieldsData: newSubFieldsData
                                });
                              }}
                              disabled={disabled || readOnly}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all disabled:bg-gray-100 text-gray-900 placeholder-gray-400"
                            />
                          ) : (subField.type === 'SELECT' || subField.type === 'SINGLE_CHOICE' || subField.type === 'MULTIPLE_CHOICE') && subField.options ? (
                            <select
                              id={subFieldId}
                              value={subFieldValue}
                              onChange={(e) => {
                                const newSubFieldsData = { ...subFieldsData };
                                if (!newSubFieldsData[optionValue]) {
                                  newSubFieldsData[optionValue] = {};
                                }
                                newSubFieldsData[optionValue][subField.key] = e.target.value;
                                
                                onChange({
                                  selectedOptions: selectedOpts,
                                  subFieldsData: newSubFieldsData
                                });
                              }}
                              disabled={disabled || readOnly}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all disabled:bg-gray-100 text-gray-900"
                            >
                              <option value="">-- Chọn --</option>
                              {(subField.options || []).map((opt, optIdx) => (
                                <option key={optIdx} value={opt.value || opt}>
                                  {opt.label || opt}
                                </option>
                              ))}
                            </select>
                          ) : subField.type === 'BOOLEAN' ? (
                            <select
                              id={subFieldId}
                              value={subFieldValue}
                              onChange={(e) => {
                                const newSubFieldsData = { ...subFieldsData };
                                if (!newSubFieldsData[optionValue]) {
                                  newSubFieldsData[optionValue] = {};
                                }
                                newSubFieldsData[optionValue][subField.key] = e.target.value;

                                onChange({
                                  selectedOptions: selectedOpts,
                                  subFieldsData: newSubFieldsData
                                });
                              }}
                              disabled={disabled || readOnly}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all disabled:bg-gray-100 text-gray-900"
                            >
                              <option value="">-- Chọn --</option>
                              <option value="true">Có</option>
                              <option value="false">Không</option>
                            </select>
                          ) : subField.type === 'TEXT' ? (
                            <input
                              id={subFieldId}
                              type="text"
                              value={subFieldValue}
                              onChange={(e) => {
                                const newSubFieldsData = { ...subFieldsData };
                                if (!newSubFieldsData[optionValue]) {
                                  newSubFieldsData[optionValue] = {};
                                }
                                newSubFieldsData[optionValue][subField.key] = e.target.value;

                                onChange({
                                  selectedOptions: selectedOpts,
                                  subFieldsData: newSubFieldsData
                                });
                              }}
                              disabled={disabled || readOnly}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all disabled:bg-gray-100 text-gray-900 placeholder-gray-400"
                              placeholder={subField.placeholder || `Nhập ${subField.label.toLowerCase()}...`}
                            />
                          ) : (
                            <textarea
                              id={subFieldId}
                              value={subFieldValue}
                              onChange={(e) => {
                                const newSubFieldsData = { ...subFieldsData };
                                if (!newSubFieldsData[optionValue]) {
                                  newSubFieldsData[optionValue] = {};
                                }
                                newSubFieldsData[optionValue][subField.key] = e.target.value;
                                
                                onChange({
                                  selectedOptions: selectedOpts,
                                  subFieldsData: newSubFieldsData
                                });
                              }}
                              disabled={disabled || readOnly}
                              rows={subField.rows || 2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all disabled:bg-gray-100 resize-y text-gray-900 placeholder-gray-400"
                              placeholder={subField.placeholder || `Nhập ${subField.label.toLowerCase()}...`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );

    case 'MATRIX_FAMILY_DISEASE':
      return (
        <MatrixDiseaseQuestion
          question={question}
          value={value}
          onChange={onChange}
          disabled={disabled}
          readOnly={readOnly}
        />
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
      
    case 'MEDICAL_HISTORY':
      return (
        <MedicalHistoryComponent
          value={value}
          onChange={onChange}
          disabled={disabled}
          readOnly={readOnly}
          showCategories={true}
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
          className={inputClasses}
          placeholder="Nhập câu trả lời..."
        />
      );
  }
}

function evaluateFormulaExpression(expression, answers) {
  if (!expression || typeof expression !== 'string') return null;
  try {
    // Helper functions for formulas
    const helperFunctions = {
      // AGE(dateField) - Calculate age from date field
      AGE: (dateField) => {
        const dateValue = answers[dateField];
        if (!dateValue) return 0;
        return getAgeFromDate(dateValue) || 0;
      },
      
      // BMI(weightField, heightField) - Calculate BMI
      // Weight in kg, height in cm
      BMI: (weightField, heightField) => {
        const weight = Number(answers[weightField]);
        const height = Number(answers[heightField]);
        if (!weight || !height || height === 0) return 0;
        const heightInMeters = height / 100;
        return weight / (heightInMeters * heightInMeters);
      },
      
      // CONVERT(value, fromUnit, toUnit) - Convert units
      CONVERT: (value, fromUnit, toUnit) => {
        const numValue = Number(value);
        if (!numValue) return 0;
        return convertValue(numValue, fromUnit, toUnit) || 0;
      },
      
      // CONVERT_FIELD(sourceField, fromUnit, toUnit) - Convert from a field value
      CONVERT_FIELD: (sourceField, fromUnit, toUnit) => {
        const value = Number(answers[sourceField]);
        if (!value) return 0;
        return convertValue(value, fromUnit, toUnit) || 0;
      },
      
      // IF(condition, trueValue, falseValue) - Conditional logic
      IF: (condition, trueValue, falseValue) => {
        return condition ? trueValue : falseValue;
      },
      
      // MAX(...values) - Maximum value
      MAX: (...values) => {
        return Math.max(...values.map(Number).filter(n => !isNaN(n)));
      },
      
      // MIN(...values) - Minimum value
      MIN: (...values) => {
        return Math.min(...values.map(Number).filter(n => !isNaN(n)));
      },
      
      // AVG(...fields) - Average of field values
      AVG: (...fields) => {
        const values = fields.map(f => Number(answers[f])).filter(n => !isNaN(n));
        if (values.length === 0) return 0;
        return values.reduce((sum, v) => sum + v, 0) / values.length;
      },
      
      // SUM(...fields) - Sum of field values
      SUM: (...fields) => {
        return fields.reduce((sum, f) => sum + (Number(answers[f]) || 0), 0);
      },
    };
    
    // Replace #variableName with actual values
    let jsExpression = expression.replace(/#([a-zA-Z0-9_]+)/g, (_, key) => {
      const raw = answers[key];
      if (raw === undefined || raw === null || raw === '') return '0';
      const parsed = Number(raw);
      return Number.isNaN(parsed) ? '0' : String(parsed);
    });
    
    // Replace ^ with ** for exponentiation
    jsExpression = jsExpression.replace(/\^/g, '**');
    
    // Create evaluation context with helper functions
    const context = { ...helperFunctions, answers };
    
    // Evaluate expression
    const func = new Function(...Object.keys(context), `return (${jsExpression});`);
    const result = func(...Object.values(context));
    
    if (result === null || result === undefined || Number.isNaN(result)) return null;
    return result;
  } catch (error) {
    console.error('Formula evaluation error:', error);
    return null;
  }
}
