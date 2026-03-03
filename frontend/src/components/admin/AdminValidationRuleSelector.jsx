/**
 * AdminValidationRuleSelector.jsx
 * Component for Admin to select and configure medical validation rules
 * Used in AdminFormBuilder / AdminQuestionEditor
 */

import { useState } from 'react';
import { ChevronDown, Plus, Trash2, Info } from 'lucide-react';
import { MEDICAL_RANGES } from '../utils/medicalValidation';

export const AdminValidationRuleSelector = ({ 
  selectedKey = '', 
  minValue, 
  maxValue, 
  warningMin, 
  warningMax,
  onRuleChange 
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleSelectRule = (key) => {
    const range = MEDICAL_RANGES[key];
    if (onRuleChange && range) {
      onRuleChange({
        validationKey: key,
        minValue: range.min,
        maxValue: range.max,
        warningMin: range.warning?.min || range.min,
        warningMax: range.warning?.max || range.max,
        helpText: `${range.name} (${range.unit || 'giá trị'})`
      });
    }
    setExpanded(false);
  };

  const handleClearRule = () => {
    if (onRuleChange) {
      onRuleChange({
        validationKey: '',
        minValue: null,
        maxValue: null,
        warningMin: null,
        warningMax: null
      });
    }
  };

  const handleCustomMinChange = (value) => {
    if (onRuleChange) {
      onRuleChange({
        validationKey: selectedKey,
        minValue: parseFloat(value) || null,
        maxValue,
        warningMin,
        warningMax
      });
    }
  };

  const handleCustomMaxChange = (value) => {
    if (onRuleChange) {
      onRuleChange({
        validationKey: selectedKey,
        minValue,
        maxValue: parseFloat(value) || null,
        warningMin,
        warningMax
      });
    }
  };

  const handleWarningMinChange = (value) => {
    if (onRuleChange) {
      onRuleChange({
        validationKey: selectedKey,
        minValue,
        maxValue,
        warningMin: parseFloat(value) || null,
        warningMax
      });
    }
  };

  const handleWarningMaxChange = (value) => {
    if (onRuleChange) {
      onRuleChange({
        validationKey: selectedKey,
        minValue,
        maxValue,
        warningMin,
        warningMax: parseFloat(value) || null
      });
    }
  };

  const currentRange = selectedKey ? MEDICAL_RANGES[selectedKey] : null;

  return (
    <div className="space-y-4">
      <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-2">Validation Rule (Quy tắc kiểm tra)</h3>
          <p className="text-sm text-gray-600">
            Chọn quy tắc y khoa hoặc tùy chỉnh phạm vi giá trị
          </p>
        </div>

        {/* Selected Rule Display */}
        {selectedKey && currentRange && (
          <div className="px-4 py-3 bg-green-50 border-b border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-green-900">{currentRange.name}</p>
                <p className="text-sm text-green-700">
                  ✅ Phạm vi: {currentRange.min}-{currentRange.max} {currentRange.unit || 'giá trị'}
                  {currentRange.warning && (
                    <span className="ml-2">
                      | Cảnh báo: {currentRange.warning.min}-{currentRange.warning.max}
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={handleClearRule}
                className="px-3 py-2 text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2"
                title="Xóa validation rule"
              >
                <Trash2 size={16} /> Xóa
              </button>
            </div>
          </div>
        )}

        {/* Rule Selector Dropdown */}
        <div className="p-4 space-y-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full py-3 px-3 bg-blue-100 border-2 border-blue-400 rounded-lg font-semibold text-blue-900 hover:bg-blue-200 transition-colors flex items-center justify-between"
          >
            <span>
              {selectedKey ? (
                <>✅ {MEDICAL_RANGES[selectedKey]?.name}</>
              ) : (
                <>➕ Chọn Validation Rule</>
              )}
            </span>
            <ChevronDown 
              size={20} 
              className={`transform transition-transform ${expanded ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Expanded Rule List */}
          {expanded && (
            <div className="border-2 border-blue-200 rounded-lg overflow-hidden">
              {/* Group: Blood Pressure */}
              <div className="border-b border-gray-200">
                <div className="px-3 py-2 bg-gray-100 font-semibold text-sm text-gray-700">
                  🫀 Huyết Áp (Blood Pressure)
                </div>
                {['BLOOD_PRESSURE_SYSTOLIC', 'BLOOD_PRESSURE_DIASTOLIC'].map(key => (
                  <button
                    key={key}
                    onClick={() => handleSelectRule(key)}
                    className={`w-full text-left px-4 py-2 transition-colors ${
                      selectedKey === key 
                        ? 'bg-blue-100 border-l-4 border-blue-500' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{MEDICAL_RANGES[key].name}</div>
                    <div className="text-xs text-gray-500">
                      Phạm vi: {MEDICAL_RANGES[key].min}-{MEDICAL_RANGES[key].max} {MEDICAL_RANGES[key].unit}
                    </div>
                  </button>
                ))}
              </div>

              {/* Group: Glucose */}
              <div className="border-b border-gray-200">
                <div className="px-3 py-2 bg-gray-100 font-semibold text-sm text-gray-700">
                  🩺 Đường Huyết (Glucose)
                </div>
                {['GLUCOSE', 'GLUCOSE_MMOL'].map(key => (
                  <button
                    key={key}
                    onClick={() => handleSelectRule(key)}
                    className={`w-full text-left px-4 py-2 transition-colors ${
                      selectedKey === key 
                        ? 'bg-blue-100 border-l-4 border-blue-500' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{MEDICAL_RANGES[key].name}</div>
                    <div className="text-xs text-gray-500">
                      Phạm vi: {MEDICAL_RANGES[key].min}-{MEDICAL_RANGES[key].max} {MEDICAL_RANGES[key].unit}
                    </div>
                  </button>
                ))}
              </div>

              {/* Group: Vital Signs */}
              <div className="border-b border-gray-200">
                <div className="px-3 py-2 bg-gray-100 font-semibold text-sm text-gray-700">
                  ⏱️ Dấu Hiệu Sống (Vital Signs)
                </div>
                {['HEART_RATE', 'TEMPERATURE'].map(key => (
                  <button
                    key={key}
                    onClick={() => handleSelectRule(key)}
                    className={`w-full text-left px-4 py-2 transition-colors ${
                      selectedKey === key 
                        ? 'bg-blue-100 border-l-4 border-blue-500' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{MEDICAL_RANGES[key].name}</div>
                    <div className="text-xs text-gray-500">
                      Phạm vi: {MEDICAL_RANGES[key].min}-{MEDICAL_RANGES[key].max} {MEDICAL_RANGES[key].unit}
                    </div>
                  </button>
                ))}
              </div>

              {/* Group: Anthropometry */}
              <div className="border-b border-gray-200">
                <div className="px-3 py-2 bg-gray-100 font-semibold text-sm text-gray-700">
                  📏 Chỉ Số Cơ Thể (Body Metrics)
                </div>
                {['BMI', 'WEIGHT', 'HEIGHT'].map(key => (
                  <button
                    key={key}
                    onClick={() => handleSelectRule(key)}
                    className={`w-full text-left px-4 py-2 transition-colors ${
                      selectedKey === key 
                        ? 'bg-blue-100 border-l-4 border-blue-500' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{MEDICAL_RANGES[key].name}</div>
                    <div className="text-xs text-gray-500">
                      Phạm vi: {MEDICAL_RANGES[key].min}-{MEDICAL_RANGES[key].max} {MEDICAL_RANGES[key].unit}
                    </div>
                  </button>
                ))}
              </div>

              {/* Group: Laboratory Tests */}
              <div className="border-b border-gray-200">
                <div className="px-3 py-2 bg-gray-100 font-semibold text-sm text-gray-700">
                  🔬 Xét Nghiệm (Laboratory)
                </div>
                {['CREATININE', 'CHOLESTEROL', 'TRIGLYCERIDES', 'HDL', 'LDL', 'HEMOGLOBIN', 'HEMATOCRIT', 'WBC', 'PLATELETS'].map(key => (
                  <button
                    key={key}
                    onClick={() => handleSelectRule(key)}
                    className={`w-full text-left px-4 py-2 transition-colors ${
                      selectedKey === key 
                        ? 'bg-blue-100 border-l-4 border-blue-500' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{MEDICAL_RANGES[key].name}</div>
                    <div className="text-xs text-gray-500">
                      Phạm vi: {MEDICAL_RANGES[key].min}-{MEDICAL_RANGES[key].max} {MEDICAL_RANGES[key].unit}
                    </div>
                  </button>
                ))}
              </div>

              {/* Group: Demographics */}
              <div>
                <div className="px-3 py-2 bg-gray-100 font-semibold text-sm text-gray-700">
                  👤 Nhân Khẩu Học (Demographics)
                </div>
                <button
                  onClick={() => handleSelectRule('AGE')}
                  className={`w-full text-left px-4 py-2 transition-colors ${
                    selectedKey === 'AGE' 
                      ? 'bg-blue-100 border-l-4 border-blue-500' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-gray-900">{MEDICAL_RANGES.AGE.name}</div>
                  <div className="text-xs text-gray-500">
                    Phạm vi: {MEDICAL_RANGES.AGE.min}-{MEDICAL_RANGES.AGE.max} {MEDICAL_RANGES.AGE.unit}
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Range Editor */}
      {selectedKey && (
        <div className="bg-white border-2 border-orange-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Info size={18} className="text-orange-600" />
            Tùy chỉnh Phạm vi (Optional)
          </h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Value
              </label>
              <input
                type="number"
                value={minValue ?? ''}
                onChange={(e) => handleCustomMinChange(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none"
                placeholder={currentRange?.min}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Value
              </label>
              <input
                type="number"
                value={maxValue ?? ''}
                onChange={(e) => handleCustomMaxChange(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none"
                placeholder={currentRange?.max}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Warning Min
              </label>
              <input
                type="number"
                value={warningMin ?? ''}
                onChange={(e) => handleWarningMinChange(e.target.value)}
                className="w-full px-3 py-2 border-2 border-orange-200 rounded-lg focus:border-orange-500 outline-none"
                placeholder={currentRange?.warning?.min}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Warning Max
              </label>
              <input
                type="number"
                value={warningMax ?? ''}
                onChange={(e) => handleWarningMaxChange(e.target.value)}
                className="w-full px-3 py-2 border-2 border-orange-200 rounded-lg focus:border-orange-500 outline-none"
                placeholder={currentRange?.warning?.max}
              />
            </div>
          </div>

          <div className="mt-3 p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400">
            <p className="text-sm text-orange-800">
              <strong>Lưu ý:</strong> Để trống = dùng giá trị mặc định từ {currentRange?.name}
            </p>
          </div>
        </div>
      )}

      {/* Preview */}
      {selectedKey && (
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="w-full py-2 px-3 bg-indigo-100 border border-indigo-400 rounded-lg font-medium text-indigo-900 hover:bg-indigo-200 transition-colors"
        >
          {showPreview ? '✖️ Ẩn Preview' : '👁️ Xem Preview Cảnh Báo'}
        </button>
      )}

      {showPreview && selectedKey && (
        <ValidationPreview 
          validationKey={selectedKey} 
          minValue={minValue}
          maxValue={maxValue}
          warningMin={warningMin}
          warningMax={warningMax}
        />
      )}
    </div>
  );
};

/**
 * Validation preview component
 */
function ValidationPreview({ validationKey, minValue, maxValue, warningMin, warningMax }) {
  const range = MEDICAL_RANGES[validationKey];
  const min = minValue ?? range.min;
  const max = maxValue ?? range.max;
  const warnMin = warningMin ?? range.warning?.min;
  const warnMax = warningMax ?? range.warning?.max;

  const testValues = [
    { value: min - 1, label: `Giá trị thấp (${min - 1})` },
    { value: (min + warnMin) / 2, label: `Giá trị bình thường (${Math.round((min + warnMin) / 2)})` },
    { value: warnMin - 1, label: `Cảnh báo (${warnMin - 1})` },
    { value: (warnMin + warnMax) / 2, label: `Giá trị bình thường (${Math.round((warnMin + warnMax) / 2)})` },
    { value: warnMax + 1, label: `Cảnh báo (${warnMax + 1})` },
    { value: max + 1, label: `Giá trị quá cao (${max + 1})` }
  ];

  return (
    <div className="bg-white border-2 border-indigo-200 rounded-lg p-4">
      <h4 className="font-semibold text-gray-800 mb-3">📊 Preview Cảnh Báo (Preview)</h4>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {testValues.map((test, idx) => {
          const isError = test.value < min || test.value > max;
          const isWarning = !isError && (test.value < warnMin || test.value > warnMax);

          return (
            <div key={idx} className={`p-3 rounded-lg text-sm ${
              isError ? 'bg-red-50 border-l-4 border-red-500' :
              isWarning ? 'bg-yellow-50 border-l-4 border-yellow-500' :
              'bg-green-50 border-l-4 border-green-500'
            }`}>
              <div className="font-semibold text-gray-800">{test.label}</div>
              <div className={`text-xs mt-1 ${
                isError ? 'text-red-700' :
                isWarning ? 'text-yellow-700' :
                'text-green-700'
              }`}>
                {isError && `❌ Lỗi: Ngoài phạm vi (${min}-${max})`}
                {isWarning && `⚠️ Cảnh báo: Bất thường (${warnMin}-${warnMax} ${range.unit || ''})`}
                {!isError && !isWarning && `✅ Bình thường`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AdminValidationRuleSelector;
