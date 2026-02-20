import React from "react";
import Modal from "./Modal";

const MessageDialog = ({ open, title, description, onClose, actionLabel }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      actions={
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
        >
          {actionLabel || "Close"}
        </button>
      }
    >
      <p>{description}</p>
    </Modal>
  );
};

export default MessageDialog;
