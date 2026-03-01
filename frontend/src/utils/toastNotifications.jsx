import { toast } from 'react-hot-toast';

/**
 * Toast notification helpers using react-hot-toast
 */

export const showSuccess = (message, title = 'Thành công') => {
  toast.success((t) => (
    <div>
      <p className="font-semibold text-sm">{title}</p>
      <p className="text-xs mt-1">{message}</p>
    </div>
  ));
};

export const showError = (message, title = 'Lỗi') => {
  toast.error((t) => (
    <div>
      <p className="font-semibold text-sm">{title}</p>
      <p className="text-xs mt-1">{message}</p>
    </div>
  ));
};

export const showInfo = (message, title = 'Thông báo') => {
  toast((t) => (
    <div className="bg-blue-50 text-blue-900 border border-blue-200 rounded-lg p-3">
      <p className="font-semibold text-sm">{title}</p>
      <p className="text-xs mt-1">{message}</p>
    </div>
  ));
};

export const showWarning = (message, title = 'Cảnh báo') => {
  toast((t) => (
    <div className="bg-amber-50 text-amber-900 border border-amber-200 rounded-lg p-3">
      <p className="font-semibold text-sm">{title}</p>
      <p className="text-xs mt-1">{message}</p>
    </div>
  ));
};
