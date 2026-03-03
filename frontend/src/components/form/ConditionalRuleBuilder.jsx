import React, { useState } from 'react';
import { Plus, Trash2, Eye, EyeOff, AlertCircle } from 'lucide-react';

/**
 * REDESIGNED: Visual builder đơn giản cho điều kiện hiển thị câu hỏi
 * Chỉ focus vào: "Nếu [Câu hỏi X] = [Giá trị] → Hiện câu hỏi này"
 */
export const ConditionalRuleBuilder = ({ 
  questions = [], 
  value = [], 
  onChange 
}) => {
  // Parse existing rules into simple format
  const parseRules = () => {
    if (!value || value.length === 0) return [];
    try {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [];
    }
  };
  
  const [rules, setRules] = useState(parseRules());
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const updateRules = (newRules) => {
    setRules(newRules);
    // Convert to old format for backend compatibility
    const formatted = newRules.map(rule => ({
      questionCode: rule.questionCode,
      questionId: rule.questionId,
      operator: rule.operator || 'equals',
      value: rule.value
    }));
    onChange(formatted);
  };
  
  const addRule = () => {
    updateRules([...rules, {
      questionCode: '',
      questionId: null,
      operator: 'equals',
      value: ''
    }]);
  };
  
  const removeRule = (index) => {
    updateRules(rules.filter((_, i) => i !== index));
  };
  
  const updateRule = (index, field, newValue) => {
    const newRules = [...rules];
    
    // If selecting a question, update both code and id
    if (field === 'questionCode') {
      const selectedQ = questions.find(q => q.questionCode === newValue);
      newRules[index] = {
        ...newRules[index],
        questionCode: newValue,
        questionId: selectedQ?.questionId || null
      };
    } else {
      newRules[index] = { ...newRules[index], [field]: newValue };
    }
    
    updateRules(newRules);
  };
  
  const getQuestionOptions = (questionCode) => {
    const q = questions.find(q => q.questionCode === questionCode);
    if (!q || q.questionType !== 'SINGLE_CHOICE') return [];
    
    try {
      const options = JSON.parse(q.options || '[]');
      return Array.isArray(options) ? options : [];
    } catch {
      return [];
    }
  };
  
  const getQuestionType = (questionCode) => {
    const q = questions.find(q => q.questionCode === questionCode);
    return q?.questionType || 'TEXT';
  };
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-600" />
          <h4 className="font-semibold text-gray-800">Điều kiện hiển thị</h4>
        </div>
        <button
          type="button"
          onClick={addRule}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Thêm điều kiện
        </button>
      </div>
      
      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Cách hoạt động:</p>
            <p>• Nếu <strong>KHÔNG CÓ</strong> điều kiện → Câu hỏi <strong>luôn hiển thị</strong></p>
            <p>• Nếu <strong>CÓ</strong> điều kiện → Chỉ hiện khi <strong>TẤT CẢ</strong> điều kiện đúng</p>
            <p className="mt-2 text-xs">
              <strong>Ví dụ:</strong> "Nếu C1 = Có → hiện câu này"
            </p>
          </div>
        </div>
      </div>
      
      {/* Rules List */}
      {rules.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <EyeOff className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-3">Chưa có điều kiện - Câu hỏi sẽ luôn hiển thị</p>
          <button
            type="button"
            onClick={addRule}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Tạo điều kiện đầu tiên
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule, index) => {
            const questionType = getQuestionType(rule.questionCode);
            const options = getQuestionOptions(rule.questionCode);
            
            return (
              <div key={index} className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm">
                {/* Rule Number */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700">
                    {rules.length > 1 && `Điều kiện ${index + 1}`}
                    {rules.length > 1 && index < rules.length - 1 && (
                      <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">VÀ</span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeRule(index)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Xóa điều kiện"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-12 gap-3 items-center">
                  {/* "Nếu" label */}
                  <div className="col-span-12 sm:col-span-1 text-sm font-medium text-gray-600">
                    Nếu
                  </div>
                  
                  {/* Question Selector */}
                  <div className="col-span-12 sm:col-span-4">
                    <select
                      value={rule.questionCode || ''}
                      onChange={(e) => updateRule(index, 'questionCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">-- Chọn câu hỏi --</option>
                      {questions.map(q => (
                        <option key={q.questionId} value={q.questionCode}>
                          {q.questionCode} - {q.questionText.substring(0, 40)}{q.questionText.length > 40 ? '...' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Operator */}
                  <div className="col-span-12 sm:col-span-2">
                    <select
                      value={rule.operator || 'equals'}
                      onChange={(e) => updateRule(index, 'operator', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="equals">Bằng</option>
                      <option value="not_equals">Khác</option>
                      {questionType === 'NUMBER' && (
                        <>
                          <option value="greaterThan">Lớn hơn</option>
                          <option value="lessThan">Nhỏ hơn</option>
                          <option value="greaterThanOrEqual">≥</option>
                          <option value="lessThanOrEqual">≤</option>
                        </>
                      )}
                      <option value="in">Trong</option>
                    </select>
                  </div>
                  
                  {/* Value Input */}
                  <div className="col-span-12 sm:col-span-5">
                    {options.length > 0 ? (
                      // Dropdown for SINGLE_CHOICE questions
                      <select
                        value={rule.value || ''}
                        onChange={(e) => updateRule(index, 'value', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="">-- Chọn giá trị --</option>
                        {options.map((opt, i) => (
                          <option key={i} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      // Text input for other types
                      <input
                        type={questionType === 'NUMBER' ? 'number' : 'text'}
                        value={rule.value || ''}
                        onChange={(e) => updateRule(index, 'value', e.target.value)}
                        placeholder="Nhập giá trị..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    )}
                  </div>
                </div>
                
                {/* Preview */}
                {rule.questionCode && rule.value && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600">
                      <strong>Preview:</strong> Câu hỏi này sẽ hiển thị khi{' '}
                      <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">
                        {rule.questionCode}
                      </span>
                      {' '}{rule.operator === 'equals' ? '=' : rule.operator === 'greaterThan' ? '>' : rule.operator}{' '}
                      <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">
                        {rule.value}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {/* Multiple Rules Info */}
      {rules.length > 1 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            <strong>Lưu ý:</strong> Có {rules.length} điều kiện. Câu hỏi chỉ hiện khi <strong>TẤT CẢ</strong> điều kiện đều đúng (logic AND).
          </p>
        </div>
      )}
    </div>
  );
};

export default ConditionalRuleBuilder;
