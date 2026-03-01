import React from 'react';

/**
 * LoadingOverlay component
 * Full-screen loading overlay for async operations
 */
const LoadingOverlay = ({ isVisible = false, message = 'Đang tải...' }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-lg p-8 shadow-2xl flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
        <p className="text-slate-700 dark:text-slate-200 font-medium">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
