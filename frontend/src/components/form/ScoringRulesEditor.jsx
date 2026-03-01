import React, { useState } from 'react';
import { Plus, Trash2, Award } from 'lucide-react';
import Button from '../ui/Button';
import './ScoringRulesEditor.css';

/**
 * Editor cho scoring rules - cấu hình điểm số cho form
 */
export const ScoringRulesEditor = ({ value, onChange }) => {
  const [scoringConfig, setScoringConfig] = useState(value || {
    questions: [],
    riskLevels: [
      { level: 'Thấp', minScore: 0, maxScore: 3, color: '#27ae60' },
      { level: 'Trung bình', minScore: 4, maxScore: 7, color: '#f39c12' },
      { level: 'Cao', minScore: 8, maxScore: 999, color: '#e74c3c' }
    ]
  });
  
  const updateConfig = (newConfig) => {
    setScoringConfig(newConfig);
    onChange(JSON.stringify(newConfig));
  };
  
  const addRiskLevel = () => {
    const newConfig = {
      ...scoringConfig,
      riskLevels: [
        ...scoringConfig.riskLevels,
        { level: 'Mới', minScore: 0, maxScore: 0, color: '#95a5a6' }
      ]
    };
    updateConfig(newConfig);
  };
  
  const removeRiskLevel = (index) => {
    const newConfig = {
      ...scoringConfig,
      riskLevels: scoringConfig.riskLevels.filter((_, idx) => idx !== index)
    };
    updateConfig(newConfig);
  };
  
  const updateRiskLevel = (index, field, value) => {
    const newLevels = [...scoringConfig.riskLevels];
    newLevels[index] = { ...newLevels[index], [field]: value };
    updateConfig({ ...scoringConfig, riskLevels: newLevels });
  };
  
  return (
    <div className="scoring-rules-editor">
      <div className="editor-header">
        <h4><Award size={18} /> Cấu hình điểm số & Phân loại rủi ro</h4>
      </div>
      
      {/* Risk Levels */}
      <div className="risk-levels-section">
        <div className="section-header">
          <label>Phân loại mức độ rủi ro</label>
          <Button onClick={addRiskLevel} variant="secondary" size="small">
            <Plus size={14} /> Thêm level
          </Button>
        </div>
        
        <div className="risk-levels-list">
          {scoringConfig.riskLevels.map((level, index) => (
            <div key={index} className="risk-level-item">
              <div className="level-fields">
                <div className="field">
                  <label>Tên mức độ</label>
                  <input
                    type="text"
                    value={level.level}
                    onChange={(e) => updateRiskLevel(index, 'level', e.target.value)}
                    className="form-control"
                    placeholder="VD: Thấp, Trung bình, Cao"
                  />
                </div>
                
                <div className="field">
                  <label>Điểm tối thiểu</label>
                  <input
                    type="number"
                    value={level.minScore}
                    onChange={(e) => updateRiskLevel(index, 'minScore', parseInt(e.target.value))}
                    className="form-control"
                    min="0"
                  />
                </div>
                
                <div className="field">
                  <label>Điểm tối đa</label>
                  <input
                    type="number"
                    value={level.maxScore}
                    onChange={(e) => updateRiskLevel(index, 'maxScore', parseInt(e.target.value))}
                    className="form-control"
                    min="0"
                  />
                </div>
                
                <div className="field">
                  <label>Màu sắc</label>
                  <input
                    type="color"
                    value={level.color}
                    onChange={(e) => updateRiskLevel(index, 'color', e.target.value)}
                    className="form-control-color"
                  />
                </div>
              </div>
              
              {scoringConfig.riskLevels.length > 1 && (
                <button
                  onClick={() => removeRiskLevel(index)}
                  className="btn-remove"
                  title="Xóa"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Preview Risk Levels */}
      <div className="risk-preview">
        <h5>Xem trước phân loại:</h5>
        <div className="preview-items">
          {scoringConfig.riskLevels.map((level, index) => (
            <div 
              key={index} 
              className="preview-badge"
              style={{ backgroundColor: level.color }}
            >
              <span className="level-name">{level.level}</span>
              <span className="level-range">
                {level.minScore} - {level.maxScore === 999 ? '∞' : level.maxScore}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* JSON Preview */}
      <details className="json-preview">
        <summary>Xem JSON (Debug)</summary>
        <pre>{JSON.stringify(scoringConfig, null, 2)}</pre>
      </details>
    </div>
  );
};

export default ScoringRulesEditor;
