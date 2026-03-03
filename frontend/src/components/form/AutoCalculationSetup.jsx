import React, { useState } from 'react';
import { Calculator, Plus, Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import { UNIT_CONVERSIONS } from '../../utils/unitConverter';
import './AutoCalculationSetup.css';

/**
 * Component để setup các calculation tự động
 * VD: tính tuổi từ DOB, tính BMI từ weight+height, vv
 */
export const AutoCalculationSetup = ({ questions = [], value = [], onChange }) => {
  const calculationTypes = [
    { value: 'AGE_FROM_DOB', label: 'Tính tuổi từ ngày sinh', fields: ['dateField'] },
    { value: 'BMI', label: 'Tính BMI (Body Mass Index)', fields: ['weightField', 'heightField'] },
    { value: 'UNIT_CONVERSION', label: 'Đổi đơn vị', fields: ['sourceField', 'fromUnit', 'toUnit'] },
    { value: 'SUM', label: 'Tổng các câu trả lời', fields: ['targetFields'] },
    { value: 'AVERAGE', label: 'Trung bình các câu trả lời', fields: ['targetFields'] },
    { value: 'FORMULA', label: 'Công thức tùy chỉnh', fields: ['expression'] }
  ];
  
  // Build unit types from UNIT_CONVERSIONS
  const unitTypesDict = {};
  Object.values(UNIT_CONVERSIONS).forEach(conv => {
    const key = `${conv.from}|${conv.to}`;
    if (!unitTypesDict[key]) {
      unitTypesDict[key] = {
        from: conv.from,
        to: conv.to,
        label: conv.description
      };
    }
  });
  const unitTypes = Object.values(unitTypesDict);
  
  const addCalculation = () => {
    const newCalc = {
      type: 'AGE_FROM_DOB',
      outputField: '',
      config: {}
    };
    onChange([...value, newCalc]);
  };
  
  const removeCalculation = (index) => {
    onChange(value.filter((_, idx) => idx !== index));
  };
  
  const updateCalculation = (index, field, newValue) => {
    const newCalcs = [...value];
    newCalcs[index] = { ...newCalcs[index], [field]: newValue };
    onChange(newCalcs);
  };
  
  const updateConfig = (index, configField, configValue) => {
    const newCalcs = [...value];
    newCalcs[index] = {
      ...newCalcs[index],
      config: { ...newCalcs[index].config, [configField]: configValue }
    };
    onChange(newCalcs);
  };
  
  const renderConfigFields = (calc, index) => {
    const calcType = calculationTypes.find(t => t.value === calc.type);
    if (!calcType) return null;
    
    switch (calc.type) {
      case 'AGE_FROM_DOB':
        return (
          <div className="config-field">
            <label>Câu hỏi ngày sinh</label>
            <select
              value={calc.config.dateField || ''}
              onChange={(e) => updateConfig(index, 'dateField', e.target.value)}
              className="form-control"
            >
              <option value="">Chọn câu hỏi...</option>
              {questions.filter(q => q.questionType === 'DATE').map(q => (
                <option key={q.questionCode} value={q.questionCode}>
                  {q.questionCode} - {q.questionText}
                </option>
              ))}
            </select>
          </div>
        );
      
      case 'BMI':
        return (
          <>
            <div className="config-field">
              <label>Câu hỏi cân nặng (kg)</label>
              <select
                value={calc.config.weightField || ''}
                onChange={(e) => updateConfig(index, 'weightField', e.target.value)}
                className="form-control"
              >
                <option value="">Chọn câu hỏi...</option>
                {questions.filter(q => q.questionType === 'NUMBER').map(q => (
                  <option key={q.questionCode} value={q.questionCode}>
                    {q.questionCode} - {q.questionText}
                  </option>
                ))}
              </select>
            </div>
            <div className="config-field">
              <label>Câu hỏi chiều cao (cm)</label>
              <select
                value={calc.config.heightField || ''}
                onChange={(e) => updateConfig(index, 'heightField', e.target.value)}
                className="form-control"
              >
                <option value="">Chọn câu hỏi...</option>
                {questions.filter(q => q.questionType === 'NUMBER').map(q => (
                  <option key={q.questionCode} value={q.questionCode}>
                    {q.questionCode} - {q.questionText}
                  </option>
                ))}
              </select>
            </div>
          </>
        );
      
      case 'UNIT_CONVERSION':
        return (
          <>
            <div className="config-field">
              <label>Câu hỏi nguồn</label>
              <select
                value={calc.config.sourceField || ''}
                onChange={(e) => updateConfig(index, 'sourceField', e.target.value)}
                className="form-control"
              >
                <option value="">Chọn câu hỏi...</option>
                {questions.filter(q => q.questionType === 'NUMBER').map(q => (
                  <option key={q.questionCode} value={q.questionCode}>
                    {q.questionCode} - {q.questionText}
                  </option>
                ))}
              </select>
            </div>
            <div className="config-field">
              <label>Loại chuyển đổi</label>
              <select
                value={calc.config.fromUnit && calc.config.toUnit ? JSON.stringify({from: calc.config.fromUnit, to: calc.config.toUnit}) : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    const { from, to } = JSON.parse(e.target.value);
                    updateConfig(index, 'fromUnit', from);
                    updateConfig(index, 'toUnit', to);
                  }
                }}
                className="form-control"
              >
                <option value="">Chọn loại...</option>
                {unitTypes.map((u, idx) => (
                  <option key={idx} value={JSON.stringify({from: u.from, to: u.to})}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        );
      
      case 'FORMULA':
        return (
          <div className="config-field">
            <label>Biểu thức (VD: Q1 + Q2 * 2)</label>
            <input
              type="text"
              value={calc.config.expression || ''}
              onChange={(e) => updateConfig(index, 'expression', e.target.value)}
              className="form-control"
              placeholder="VD: WEIGHT / (HEIGHT * HEIGHT)"
            />
            <small className="help-text">
              Dùng questionCode làm biến. VD: Q1, Q2, WEIGHT, HEIGHT
            </small>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="auto-calculation-setup">
      <div className="setup-header">
        <h4><Calculator size={18} /> Tính toán tự động</h4>
        <Button onClick={addCalculation} variant="secondary" size="small">
          <Plus size={14} /> Thêm calculation
        </Button>
      </div>
      
      {value.length === 0 ? (
        <div className="empty-state">
          <p>Chưa có tính toán tự động nào.</p>
          <Button onClick={addCalculation} variant="primary" size="small">
            <Plus size={16} /> Tạo calculation đầu tiên
          </Button>
        </div>
      ) : (
        <div className="calculations-list">
          {value.map((calc, index) => {
            const calcType = calculationTypes.find(t => t.value === calc.type);
            
            return (
              <div key={index} className="calculation-card">
                <div className="calc-header">
                  <span className="calc-icon"><Calculator size={16} /></span>
                  <span className="calc-type">{calcType?.label}</span>
                </div>
                
                <div className="calc-body">
                  {/* Calculation Type */}
                  <div className="form-group">
                    <label>Loại tính toán</label>
                    <select
                      value={calc.type}
                      onChange={(e) => updateCalculation(index, 'type', e.target.value)}
                      className="form-control"
                    >
                      {calculationTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Config Fields */}
                  <div className="config-fields">
                    {renderConfigFields(calc, index)}
                  </div>
                  
                  {/* Output Field */}
                  <div className="form-group">
                    <label>Tên field kết quả (questionCode)</label>
                    <input
                      type="text"
                      value={calc.outputField}
                      onChange={(e) => updateCalculation(index, 'outputField', e.target.value)}
                      className="form-control"
                      placeholder="VD: CALCULATED_AGE, BMI_VALUE"
                    />
                  </div>
                </div>
                
                <div className="calc-footer">
                  <Button 
                    onClick={() => removeCalculation(index)} 
                    variant="danger" 
                    size="small"
                  >
                    <Trash2 size={14} /> Xóa
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Preview */}
      {value.length > 0 && (
        <details className="json-preview">
          <summary>Xem JSON (Debug)</summary>
          <pre>{JSON.stringify(value, null, 2)}</pre>
        </details>
      )}
    </div>
  );
};

export default AutoCalculationSetup;
