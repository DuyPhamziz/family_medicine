import React from "react";

const Modal = ({ open, onClose, title, children, actions }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            x
          </button>
        </div>
        <div className="mt-4 text-sm text-slate-600">{children}</div>
        {actions ? <div className="mt-6 flex items-center justify-end gap-3">{actions}</div> : null}
      </div>
    </div>
  );
};

export default Modal;
