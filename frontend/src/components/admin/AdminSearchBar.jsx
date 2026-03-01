import React from 'react';
import { Search, X } from 'lucide-react';

/**
 * AdminSearchBar component
 * Search input for filtering admin lists
 */
const AdminSearchBar = ({ value, onChange, placeholder = "Tìm kiếm..." }) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 
                   bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100
                   placeholder-slate-500 dark:placeholder-slate-400
                   focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                   transition-all"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 
                     dark:hover:text-slate-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default AdminSearchBar;
