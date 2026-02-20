import React from "react";
import Modal from "./Modal";

const ConfirmDialog = ({ open, title, description, confirmLabel, cancelLabel, onConfirm, onClose }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      actions={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            {cancelLabel || "Cancel"}
          </button>
          <button
            type="button"
            onClick={() => onConfirm && onConfirm()}
            className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-700"
          >
            {confirmLabel || "Confirm"}
          </button>
        </>
      }
    >
      <p>{description}</p>
    </Modal>
  );
};

export default ConfirmDialog;
