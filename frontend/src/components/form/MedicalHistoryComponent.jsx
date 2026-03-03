import React, { useState } from 'react';
import { ChevronDown, Plus, X } from 'lucide-react';
import { MEDICAL_CONDITIONS, getConditionById } from '../../utils/medicalConditions';
import './MedicalHistoryComponent.css';

/**
 * Component để quản lý tiền sử bệnh của bệnh nhân
 * Cho phép chọn từ danh sách bệnh phổ biến hoặc thêm bệnh tùy chỉnh
 */
export const MedicalHistoryComponent = ({
  value = [],
  onChange,
  disabled = false,
  readOnly = false,
  showCategories = true
}) => {
  const [selectedConditions, setSelectedConditions] = useState(
    Array.isArray(value) ? value : []
  );
  const [expandedCategories, setExpandedCategories] = useState({});
  const [customCondition, setCustomCondition] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleConditionToggle = (conditionId) => {
    if (readOnly || disabled) return;

    const newSelected = selectedConditions.includes(conditionId)
      ? selectedConditions.filter(id => id !== conditionId)
      : [...selectedConditions, conditionId];

    setSelectedConditions(newSelected);
    if (onChange) {
      onChange(newSelected);
    }
  };

  const handleAddCustom = () => {
    if (!customCondition.trim()) return;

    const newConditionId = `CUSTOM_${Date.now()}`;
    const newSelected = [
      ...selectedConditions,
      newConditionId
    ];

    setSelectedConditions(newSelected);
    if (onChange) {
      onChange(newSelected);
    }

    // Store custom condition in localStorage or state
    // For now, we'll store it in a way that can be retrieved
    const customConditions = JSON.parse(localStorage.getItem('customMedicalConditions') || '{}');
    customConditions[newConditionId] = customCondition;
    localStorage.setItem('customMedicalConditions', JSON.stringify(customConditions));

    setCustomCondition('');
    setShowCustomInput(false);
  };

  const handleRemoveCondition = (conditionId) => {
    if (readOnly || disabled) return;

    const newSelected = selectedConditions.filter(id => id !== conditionId);
    setSelectedConditions(newSelected);
    if (onChange) {
      onChange(newSelected);
    }

    // Clean up custom condition from localStorage
    if (conditionId.startsWith('CUSTOM_')) {
      const customConditions = JSON.parse(localStorage.getItem('customMedicalConditions') || '{}');
      delete customConditions[conditionId];
      localStorage.setItem('customMedicalConditions', JSON.stringify(customConditions));
    }
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const getConditionLabel = (conditionId) => {
    if (conditionId.startsWith('CUSTOM_')) {
      const customConditions = JSON.parse(localStorage.getItem('customMedicalConditions') || '{}');
      return customConditions[conditionId] || conditionId;
    }
    const condition = getConditionById(conditionId);
    return condition ? condition.label : conditionId;
  };

  return (
    <div className="medical-history-component">
      {/* Selected Conditions Display */}
      {selectedConditions.length > 0 && (
        <div className="selected-conditions mb-4">
          <div className="flex flex-wrap gap-2">
            {selectedConditions.map(conditionId => (
              <div
                key={conditionId}
                className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm border border-blue-300"
              >
                <span>{getConditionLabel(conditionId)}</span>
                {!readOnly && !disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemoveCondition(conditionId)}
                    className="text-blue-600 hover:text-blue-800 focus:outline-none"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conditions List */}
      {!readOnly && (
        <>
          {showCategories ? (
            <div className="conditions-categories space-y-2">
              {Object.entries(MEDICAL_CONDITIONS).map(([categoryKey, conditions]) => {
                const isExpanded = expandedCategories[categoryKey];
                const categoryName = {
                  CARDIOVASCULAR: 'Hệ tim mạch',
                  ENDOCRINE: 'Nội tiết',
                  RESPIRATORY: 'Hô hấp',
                  HEPATIC: 'Gan',
                  RENAL: 'Thận',
                  NEUROLOGICAL: 'Thần kinh',
                  PSYCHIATRIC: 'Tâm lý',
                  CANCER: 'Ung thư',
                  MUSCULOSKELETAL: 'Cơ xương',
                  ALLERGIES: 'Dị ứng',
                  OTHER: 'Khác'
                }[categoryKey];

                return (
                  <div key={categoryKey} className="category-group border rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleCategory(categoryKey)}
                      disabled={disabled}
                      className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between font-semibold text-gray-700"
                    >
                      <span>{categoryName}</span>
                      <ChevronDown
                        size={18}
                        className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="category-conditions p-3 space-y-2 bg-white">
                        {conditions.map(condition => (
                          <label
                            key={condition.id}
                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                              selectedConditions.includes(condition.id)
                                ? 'bg-blue-50 border-l-4 border-blue-500'
                                : 'hover:bg-gray-50'
                            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedConditions.includes(condition.id)}
                              onChange={() => handleConditionToggle(condition.id)}
                              disabled={disabled}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                            />
                            <span className="text-sm text-gray-700">{condition.label}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="conditions-flat space-y-2">
              {Object.values(MEDICAL_CONDITIONS)
                .flat()
                .map(condition => (
                  <label
                    key={condition.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors border ${
                      selectedConditions.includes(condition.id)
                        ? 'bg-blue-50 border-blue-300'
                        : 'border-gray-200 hover:bg-gray-50'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedConditions.includes(condition.id)}
                      onChange={() => handleConditionToggle(condition.id)}
                      disabled={disabled}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <span className="text-sm text-gray-700">{condition.label}</span>
                  </label>
                ))}
            </div>
          )}

          {/* Custom Condition Input */}
          <div className="mt-4 pt-4 border-t">
            {!showCustomInput ? (
              <button
                type="button"
                onClick={() => setShowCustomInput(true)}
                disabled={disabled}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={16} />
                Thêm bệnh khác
              </button>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customCondition}
                  onChange={(e) => setCustomCondition(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleAddCustom();
                  }}
                  placeholder="Nhập tên bệnh..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  disabled={disabled}
                />
                <button
                  type="button"
                  onClick={handleAddCustom}
                  disabled={disabled || !customCondition.trim()}
                  className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Thêm
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomInput(false);
                    setCustomCondition('');
                  }}
                  className="px-3 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Read-only display */}
      {readOnly && selectedConditions.length === 0 && (
        <div className="text-sm text-gray-500 italic">Không có tiền sử bệnh được ghi nhận</div>
      )}
    </div>
  );
};

export default MedicalHistoryComponent;
