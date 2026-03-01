import React from 'react';
import Card from '../ui/Card';

/**
 * Calculator Header component
 * Displays title, description, and category badge
 */
const CalculatorHeader = ({ title, description, category, icon: Icon }) => {
  return (
    <div className="mb-8">
      <div className="flex items-start gap-4 mb-4">
        {Icon && (
          <div className="p-3 bg-emerald-100 rounded-xl">
            <Icon className="w-8 h-8 text-emerald-600" />
          </div>
        )}
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">{title}</h1>
          {category && (
            <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full inline-block">
              {category}
            </span>
          )}
        </div>
      </div>
      {description && (
        <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
          {description}
        </p>
      )}
    </div>
  );
};

export default CalculatorHeader;
