/**
 * TimeRangeSelector.jsx
 * Selector for analytics time range
 */

import { Calendar } from 'lucide-react';

export const TimeRangeSelector = ({ value, onChange }) => {
  const options = [
    { value: 'week', label: 'Tuần này' },
    { value: 'month', label: 'Tháng này' },
    { value: 'quarter', label: 'Quý này' },
    { value: 'year', label: 'Năm này' }
  ];

  return (
    <div className="flex items-center gap-2">
      <Calendar size={18} className="text-blue-600" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none font-medium bg-white cursor-pointer transition-colors"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TimeRangeSelector;
