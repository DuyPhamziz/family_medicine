import React from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * StatusFilter component
 * Dropdown filter for status selection in admin pages
 */
const StatusFilter = ({
  value,
  onChange,
  options = [
    { label: 'Tất cả', value: 'ALL' },
    { label: 'Bản nháp', value: 'DRAFT' },
    { label: 'Đã xuất bản', value: 'PUBLISHED' },
    { label: 'Lưu trữ', value: 'ARCHIVED' },
  ],
}) => {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 pr-10 rounded-lg border border-slate-300 dark:border-slate-700
                   bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100
                   focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                   appearance-none cursor-pointer transition-all"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 
                             text-slate-400 pointer-events-none" />
    </div>
  );
};

export default StatusFilter;
