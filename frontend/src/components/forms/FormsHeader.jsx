import React from "react";

const FormsHeader = ({ selectedFormId, onExport }) => (
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <div>
      <h1 className="text-3xl font-bold text-gray-800">
        Biểu mẫu chẩn đoán / Clinical forms
      </h1>
      <p className="text-gray-600 mt-2">
        Lựa chọn biểu mẫu và bệnh nhân để bắt đầu nhập liệu.
      </p>
    </div>
    <button
      type="button"
      onClick={onExport}
      disabled={!selectedFormId}
      className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold disabled:opacity-50"
    >
      Xuất Excel theo biểu mẫu
    </button>
  </div>
);

export default FormsHeader;
