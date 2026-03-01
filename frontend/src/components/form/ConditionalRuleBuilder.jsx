import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '../ui/Button';
import './ConditionalRuleBuilder.css';

/**
 * Visual builder cho điều kiện hiển thị/ẩn câu hỏi
 * Thay vì viết JSON thủ công, admin có thể dùng UI để tạo rules
 */
export const ConditionalRuleBuilder = ({ 
  questions = [], 
  value = [], 
  onChange 
}) => {
  const [expandedRules, setExpandedRules] = useState(new Set([0]));
  
  const operators = [
    { value: 'equals', label: 'Bằng (=)' },
    { value: 'not_equals', label: 'Khác (≠)' },
    { value: 'greater_than', label: 'Lớn hơn (>)' },
    { value: 'less_than', label: 'Nhỏ hơn (<)' },
    { value: 'greater_than_or_equal', label: 'Lớn hơn hoặc bằng (≥)' },
    { value: 'less_than_or_equal', label: 'Nhỏ hơn hoặc bằng (≤)' },
    { value: 'contains', label: 'Chứa' },
    { value: 'not_contains', label: 'Không chứa' },
    { value: 'in', label: 'Trong danh sách' },
    { value: 'is_empty', label: 'Trống' },
    { value: 'is_not_empty', label: 'Không trống' }
  ];
  
  const conditionTypes = [
    { value: 'SHOW', label: 'Hiển thị', color: '#27ae60' },
    { value: 'HIDE', label: 'Ẩn', color: '#e74c3c' },
    { value: 'REQUIRE', label: 'Bắt buộc', color: '#f39c12' },
    { value: 'DISABLE', label: 'Vô hiệu hóa', color: '#95a5a6' }
  ];
  
  const addRule = () => {
    const newRule = {
      conditionType: 'SHOW',
      operators: 'AND',
      conditions: [{
        targetQuestion: '',
        operator: 'equals',
        value: ''
      }]
    };
    onChange([...value, newRule]);
    setExpandedRules(new Set([...expandedRules, value.length]));
  };
  
  const removeRule = (ruleIndex) => {
    const newRules = value.filter((_, idx) => idx !== ruleIndex);
    onChange(newRules);
    
    const newExpanded = new Set(expandedRules);
    newExpanded.delete(ruleIndex);
    setExpandedRules(newExpanded);
  };
  
  const updateRule = (ruleIndex, field, newValue) => {
    const newRules = [...value];
    newRules[ruleIndex] = { ...newRules[ruleIndex], [field]: newValue };
    onChange(newRules);
  };
  
  const addCondition = (ruleIndex) => {
    const newRules = [...value];
    newRules[ruleIndex].conditions.push({
      targetQuestion: '',
      operator: 'equals',
      value: ''
    });
    onChange(newRules);
  };
  
  const removeCondition = (ruleIndex, condIndex) => {
    const newRules = [...value];
    newRules[ruleIndex].conditions = newRules[ruleIndex].conditions.filter((_, idx) => idx !== condIndex);
    onChange(newRules);
  };
  
  const updateCondition = (ruleIndex, condIndex, field, newValue) => {
    const newRules = [...value];
    newRules[ruleIndex].conditions[condIndex] = {
      ...newRules[ruleIndex].conditions[condIndex],
      [field]: newValue
    };
    onChange(newRules);
  };
  
  const toggleExpanded = (ruleIndex) => {
    const newExpanded = new Set(expandedRules);
    if (newExpanded.has(ruleIndex)) {
      newExpanded.delete(ruleIndex);
    } else {
      newExpanded.add(ruleIndex);
    }
    setExpandedRules(newExpanded);
  };
  
  const getQuestionLabel = (questionCode) => {
    const q = questions.find(q => q.questionCode === questionCode);
    return q ? `${q.questionCode} - ${q.questionText}` : questionCode;
  };
  
  return (
    <div className="conditional-rule-builder">
      <div className="builder-header">
        <h4>Điều kiện hiển thị</h4>
        <Button onClick={addRule} variant="secondary" size="small">
          <Plus size={16} /> Thêm luật
        </Button>
      </div>
      
      {value.length === 0 ? (
        <div className="empty-state">
          <p>Chưa có điều kiện nào. Câu hỏi sẽ luôn hiển thị.</p>
          <Button onClick={addRule} variant="primary" size="small">
            <Plus size={16} /> Tạo điều kiện đầu tiên
          </Button>
        </div>
      ) : (
        <div className="rules-list">
          {value.map((rule, ruleIndex) => {
            const isExpanded = expandedRules.has(ruleIndex);
            const condType = conditionTypes.find(t => t.value === rule.conditionType);
            
            return (
              <div key={ruleIndex} className="rule-card">
                <div className="rule-header" onClick={() => toggleExpanded(ruleIndex)}>
                  <div className="rule-title">
                    <span 
                      className="rule-badge" 
                      style={{ backgroundColor: condType?.color }}
                    >
                      {condType?.label}
                    </span>
                    <span className="rule-summary">
                      khi {rule.conditions.length} điều kiện 
                      ({rule.operators === 'AND' ? 'Tất cả' : 'Ít nhất 1'})
                    </span>
                  </div>
                  <div className="rule-actions">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="rule-body">
                    {/* Rule Type */}
                    <div className="form-group">
                      <label>Hành động</label>
                      <select
                        value={rule.conditionType}
                        onChange={(e) => updateRule(ruleIndex, 'conditionType', e.target.value)}
                        className="form-control"
                      >
                        {conditionTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Logic Operator */}
                    {rule.conditions.length > 1 && (
                      <div className="form-group">
                        <label>Kết hợp điều kiện</label>
                        <select
                          value={rule.operators}
                          onChange={(e) => updateRule(ruleIndex, 'operators', e.target.value)}
                          className="form-control"
                        >
                          <option value="AND">Tất cả phải đúng (AND)</option>
                          <option value="OR">Ít nhất 1 đúng (OR)</option>
                        </select>
                      </div>
                    )}
                    
                    {/* Conditions */}
                    <div className="conditions-section">
                      <div className="conditions-header">
                        <label>Điều kiện</label>
                        <Button 
                          onClick={() => addCondition(ruleIndex)} 
                          variant="ghost" 
                          size="small"
                        >
                          <Plus size={14} /> Thêm điều kiện
                        </Button>
                      </div>
                      
                      {rule.conditions.map((condition, condIndex) => (
                        <div key={condIndex} className="condition-row">
                          <div className="condition-fields">
                            {/* Target Question */}
                            <div className="field">
                              <label>Câu hỏi</label>
                              <select
                                value={condition.targetQuestion}
                                onChange={(e) => updateCondition(ruleIndex, condIndex, 'targetQuestion', e.target.value)}
                                className="form-control"
                              >
                                <option value="">Chọn câu hỏi...</option>
                                {questions.map(q => (
                                  <option key={q.questionCode} value={q.questionCode}>
                                    {q.questionCode} - {q.questionText}
                                  </option>
                                ))}
                              </select>
                            </div>
                            
                            {/* Operator */}
                            <div className="field">
                              <label>Toán tử</label>
                              <select
                                value={condition.operator}
                                onChange={(e) => updateCondition(ruleIndex, condIndex, 'operator', e.target.value)}
                                className="form-control"
                              >
                                {operators.map(op => (
                                  <option key={op.value} value={op.value}>
                                    {op.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            
                            {/* Value */}
                            {!['is_empty', 'is_not_empty'].includes(condition.operator) && (
                              <div className="field">
                                <label>Giá trị</label>
                                <input
                                  type="text"
                                  value={condition.value}
                                  onChange={(e) => updateCondition(ruleIndex, condIndex, 'value', e.target.value)}
                                  className="form-control"
                                  placeholder="Nhập giá trị..."
                                />
                              </div>
                            )}
                          </div>
                          
                          {rule.conditions.length > 1 && (
                            <button
                              onClick={() => removeCondition(ruleIndex, condIndex)}
                              className="btn-remove-condition"
                              title="Xóa điều kiện"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Remove Rule */}
                    <div className="rule-footer">
                      <Button 
                        onClick={() => removeRule(ruleIndex)} 
                        variant="danger" 
                        size="small"
                      >
                        <Trash2 size={14} /> Xóa luật này
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {/* Preview JSON (for debugging) */}
      {value.length > 0 && (
        <details className="json-preview">
          <summary>Xem JSON (Debug)</summary>
          <pre>{JSON.stringify(value, null, 2)}</pre>
        </details>
      )}
    </div>
  );
};

export default ConditionalRuleBuilder;
