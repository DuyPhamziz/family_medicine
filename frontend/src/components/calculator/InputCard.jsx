import React from 'react';
import Card from '../ui/Card';
import FormInput from '../ui/FormInput';

/**
 * InputCard component for calculator input fields
 * Displays input fields in a organized grid layout
 */
const InputCard = ({ fields, inputs, onChange, onSubmit, submitLabel = 'Tính toán' }) => {
  const handleChange = (fieldName) => (value) => {
    onChange(fieldName, value);
  };

  return (
    <Card elevated className="mb-8">
      <Card.Header>
        <h2 className="text-xl font-bold text-slate-900">Nhập dữ liệu</h2>
        <p className="text-sm text-slate-600 mt-1">
          Điền thông tin cần thiết để tính toán kết quả
        </p>
      </Card.Header>

      <Card.Content>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields?.map((field) => (
              <div key={field.code}>
                {field.type === 'boolean' ? (
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={inputs[field.code] || false}
                      onChange={(e) => handleChange(field.code)(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300"
                    />
                    <span className="font-medium text-slate-900">{field.label}</span>
                  </label>
                ) : field.type === 'select' ? (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {field.label}
                    </label>
                    <select
                      value={inputs[field.code] || ''}
                      onChange={(e) => handleChange(field.code)(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">{field.placeholder || 'Chọn...'}</option>
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <FormInput
                    label={field.label}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={inputs[field.code] || ''}
                    onChange={(e) => handleChange(field.code)(e.target.value)}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    helperText={field.helperText}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full md:w-auto px-8 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors duration-200 active:bg-emerald-800"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </Card.Content>
    </Card>
  );
};

export default InputCard;
