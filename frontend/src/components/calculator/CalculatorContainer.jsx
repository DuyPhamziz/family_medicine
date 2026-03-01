import React, { useState } from 'react';
import CalculatorHeader from './CalculatorHeader';
import InputCard from './InputCard';
import ResultCard from './ResultCard';
import GuidelineSection from './GuidelineSection';
import ReferencesSection from './ReferencesSection';
import { showError } from '../../utils/toastNotifications';

/**
 * CalculatorContainer component
 * Orchestrates the complete calculator flow:
 * 1. Header (title, description, category)
 * 2. Input form (fields)
 * 3. Result display (score, interpretation, risk)
 * 4. Guideline section (clinical recommendations)
 * 5. References (citations)
 *
 * Props:
 * - calculator: { id, title, description, category, icon, fields[], calculation }
 * - onCalculate: (inputs) => Promise<result>
 * - guideline: { title, summary, recommendations, source }
 * - references: Array of reference objects
 * - onSave: (result) => Promise<void> (optional, for saving assessments)
 */
const CalculatorContainer = ({
  calculator,
  onCalculate,
  guideline,
  references = [],
  onSave,
  loading = false,
}) => {
  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleInputChange = (fieldName) => (value) => {
    setInputs((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setCalculating(true);

      // Validate required fields
      if (calculator.fields) {
        const requiredFields = calculator.fields.filter((f) => f.required);
        const missingFields = requiredFields.filter((f) => !inputs[f.name]);

        if (missingFields.length > 0) {
          const fieldNames = missingFields.map((f) => f.label).join(', ');
          showError(`Vui lòng điền: ${fieldNames}`);
          return;
        }
      }

      // Call calculation handler
      const calculatedResult = await onCalculate(inputs);
      setResult(calculatedResult);
    } catch (error) {
      console.error('Calculation error:', error);
      showError('Lỗi trong quá trình tính toán. Vui lòng thử lại.');
    } finally {
      setCalculating(false);
    }
  };

  const handleSave = async () => {
    if (!onSave || !result) return;

    try {
      setSaving(true);
      await onSave({
        calculatorId: calculator.id,
        inputs,
        result,
      });
    } catch (error) {
      console.error('Save error:', error);
      showError('Lỗi khi lưu kết quả. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setInputs({});
    setResult(null);
  };

  if (!calculator) {
    return <div className="text-center py-12 text-slate-500">Không tìm thấy máy tính</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <CalculatorHeader
          title={calculator.title}
          description={calculator.description}
          category={calculator.category}
          icon={calculator.icon}
        />

        {/* Input Form */}
        <InputCard
          fields={calculator.fields || []}
          inputs={inputs}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          loading={calculating}
          submitLabel={result ? 'Tính toán lại' : 'Tính toán'}
        />

        {/* Result Section */}
        {result && (
          <>
            <div className="mt-8">
              <ResultCard
                score={result.score || result.value}
                interpretation={result.interpretation}
                riskLevel={result.riskLevel || result.risk}
                details={result.details}
                onReset={handleReset}
              />
            </div>

            {/* Guideline */}
            {guideline && (
              <GuidelineSection guideline={guideline} />
            )}

            {/* References */}
            <ReferencesSection references={references} />

            {/* Save Button (if callback provided) */}
            {onSave && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                    saving
                      ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'
                  }`}
                >
                  {saving ? 'Đang lưu...' : 'Lưu đánh giá này'}
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!result && (
          <div className="mt-8 text-center py-12 bg-white rounded-xl border border-slate-200">
            <p className="text-slate-500">
              Điền các thông tin cần thiết ở trên và nhấn{' '}
              <span className="font-semibold">Tính toán</span> để xem kết quả
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalculatorContainer;
