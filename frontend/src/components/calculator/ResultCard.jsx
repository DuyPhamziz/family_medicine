import React from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

/**
 * ResultCard component
 * Displays calculation result prominently
 * Used for medical calculators to show risk scores, diagnoses, etc.
 */
const ResultCard = ({ score, interpretation, riskLevel, unit = '' }) => {
  const getRiskColor = (level) => {
    if (!level) return 'neutral';
    const normalized = level.toUpperCase();
    if (normalized.includes('VERY_HIGH') || normalized.includes('CRITICAL')) {
      return 'danger';
    }
    if (normalized.includes('HIGH')) return 'warning';
    if (normalized.includes('MEDIUM')) return 'info';
    return 'success';
  };

  const riskColor = getRiskColor(riskLevel);

  return (
    <Card elevated className="mb-8 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
      <Card.Content className="py-8">
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">
            Kết quả Tính toán
          </p>

          {/* Score Display */}
          <div className="mb-6">
            <div className="text-6xl font-black text-emerald-600 leading-tight">
              {score.toFixed(1 || score)}
            </div>
            {unit && <p className="text-xl text-slate-600 mt-2">{unit}</p>}
          </div>

          {/* Risk Level Badge */}
          {riskLevel && (
            <div className="flex justify-center mb-6">
              <Badge variant={riskColor} size="lg">
                {riskLevel}
              </Badge>
            </div>
          )}

          {/* Interpretation */}
          {interpretation && (
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <p className="text-lg font-semibold text-slate-900 mb-2">
                Diễn giải
              </p>
              <p className="text-slate-600 leading-relaxed text-base">
                {interpretation}
              </p>
            </div>
          )}
        </div>
      </Card.Content>
    </Card>
  );
};

export default ResultCard;
