import React from 'react';
import Button from './Button';

/**
 * Confirmation Modal for destructive actions
 */
const ConfirmationModal = ({
  open = false,
  title = 'Xác nhận hành động',
  message = 'Bạn có chắc muốn thực hiện hành động này?',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <p className="text-slate-600 text-sm">{message}</p>

        <div className="flex gap-3 pt-4">
          <Button
            variant="secondary"
            size="md"
            fullWidth
            disabled={loading}
            onClick={onCancel}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            size="md"
            fullWidth
            loading={loading}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
