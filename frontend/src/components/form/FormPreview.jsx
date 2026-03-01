import React, { useState } from 'react';
import { Eye, X, Send } from 'lucide-react';
import Button from '../ui/Button';
import './FormPreview.css';

/**
 * Modal preview form - cho phép xem trước form trước khi publish
 */
export const FormPreview = ({ isOpen, onClose, formData, formSections }) => {
  const [sampleAnswers, setSampleAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  
  if (!isOpen) return null;
  
  const handleAnswerChange = (questionCode, value) => {
    setSampleAnswers(prev => ({
      ...prev,
      [questionCode]: value
    }));
  };
  
  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setSubmitted(false);
      setSampleAnswers({});
    }, 2000);
  };
  
  return (
    <div className="form-preview-modal">
      <div className="modal-overlay" onClick={onClose} />
      
      <div className="modal-content">
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2>👁️ Xem trước Form</h2>
            <p>{formData?.formName}</p>
          </div>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>
        
        {/* Body */}
        <div className="modal-body">
          {submitted ? (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <p>Form được xem trước thành công!</p>
              <small>Đó chỉ là mô phỏng, không được lưu.</small>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              {/* Description */}
              {formData?.description && (
                <div className="form-description">
                  {formData.description}
                </div>
              )}
              
              {/* Sections */}
              {formSections?.map((section, sIdx) => (
                <div key={sIdx} className="form-section">
                  <h3>{section.sectionName}</h3>
                  
                  {section.questions?.map((q, qIdx) => (
                    <div key={qIdx} className="form-question">
                      <label>
                        {q.questionText}
                        {q.required && <span className="required">*</span>}
                      </label>
                      
                      {q.questionType === 'TEXT' && (
                        <input
                          type="text"
                          placeholder="Nhập câu trả lời..."
                          value={sampleAnswers[q.questionCode] || ''}
                          onChange={(e) => handleAnswerChange(q.questionCode, e.target.value)}
                        />
                      )}
                      
                      {q.questionType === 'NUMBER' && (
                        <input
                          type="number"
                          min={q.minValue}
                          max={q.maxValue}
                          placeholder="Nhập số..."
                          value={sampleAnswers[q.questionCode] || ''}
                          onChange={(e) => handleAnswerChange(q.questionCode, e.target.value)}
                        />
                      )}
                      
                      {q.questionType === 'DATE' && (
                        <input
                          type="date"
                          value={sampleAnswers[q.questionCode] || ''}
                          onChange={(e) => handleAnswerChange(q.questionCode, e.target.value)}
                        />
                      )}
                      
                      {(q.questionType === 'SINGLE_CHOICE' || q.questionType === 'SELECT_DROPDOWN') && (
                        <select
                          value={sampleAnswers[q.questionCode] || ''}
                          onChange={(e) => handleAnswerChange(q.questionCode, e.target.value)}
                        >
                          <option value="">-- Chọn --</option>
                          {(q.optionItems || []).map((opt, oIdx) => (
                            <option key={oIdx} value={opt.optionText}>
                              {opt.optionText}
                            </option>
                          ))}
                        </select>
                      )}
                      
                      {q.questionType === 'MULTIPLE_CHOICE' && (
                        <div className="checkbox-group">
                          {(q.optionItems || []).map((opt, oIdx) => (
                            <label key={oIdx} className="checkbox-label">
                              <input
                                type="checkbox"
                                onChange={(e) => {
                                  const val = sampleAnswers[q.questionCode] || [];
                                  if (e.target.checked) {
                                    handleAnswerChange(q.questionCode, [...val, opt.optionText]);
                                  } else {
                                    handleAnswerChange(q.questionCode, val.filter(v => v !== opt.optionText));
                                  }
                                }}
                              />
                              {opt.optionText}
                            </label>
                          ))}
                        </div>
                      )}
                      
                      {q.questionType === 'BOOLEAN' && (
                        <div className="radio-group">
                          <label>
                            <input
                              type="radio"
                              name={q.questionCode}
                              value="true"
                              onChange={(e) => handleAnswerChange(q.questionCode, e.target.value)}
                            />
                            Có
                          </label>
                          <label>
                            <input
                              type="radio"
                              name={q.questionCode}
                              value="false"
                              onChange={(e) => handleAnswerChange(q.questionCode, e.target.value)}
                            />
                            Không
                          </label>
                        </div>
                      )}
                      
                      {q.helpText && <small className="help-text">{q.helpText}</small>}
                    </div>
                  ))}
                </div>
              ))}
              
              {/* Submit Button */}
              <button type="submit" className="submit-btn">
                <Send size={16} />
                Gửi form (Xem trước)
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormPreview;
