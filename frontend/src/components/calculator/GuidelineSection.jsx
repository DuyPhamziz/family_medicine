import React from 'react';
import Card from '../ui/Card';
import { ExternalLink, BookOpen } from 'lucide-react';

/**
 * GuidelineSection component
 * Displays clinical guidelines related to the calculator
 */
const GuidelineSection = ({ guideline }) => {
  if (!guideline) {
    return null;
  }

  return (
    <Card elevated className="mb-8 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
      <Card.Header>
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-slate-900">Hướng dẫn lâm sàng</h2>
        </div>
      </Card.Header>

      <Card.Content className="space-y-4">
        {guideline.title && (
          <h3 className="font-semibold text-slate-900 text-lg">
            {guideline.title}
          </h3>
        )}

        {guideline.summary && (
          <p className="text-slate-700 leading-relaxed">
            {guideline.summary}
          </p>
        )}

        {guideline.recommendations && Array.isArray(guideline.recommendations) && (
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-800">Khuyến cáo:</h4>
            <ul className="space-y-2">
              {guideline.recommendations.map((rec, idx) => (
                <li key={idx} className="flex gap-3 text-slate-700">
                  <span className="text-emerald-600 font-bold mt-0.5">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {guideline.source && (
          <div className="text-xs text-slate-500 pt-3 border-t border-slate-200">
            Nguồn: {guideline.source}
          </div>
        )}
      </Card.Content>
    </Card>
  );
};

export default GuidelineSection;
