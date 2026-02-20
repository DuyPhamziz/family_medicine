import React, { useEffect, useState } from "react";
import Pagination from "../common/Pagination";

const FormSelector = ({ forms, selectedFormId, onSelect }) => {
  const [page, setPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    setPage(1);
  }, [forms.length]);

  const pagedForms = forms.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Chọn biểu mẫu / Form</h2>
      <div className="space-y-3">
        {forms.length > 0 ? (
          pagedForms.map((form) => (
            <div
              key={form.formId}
              onClick={() => onSelect(form.formId)}
              className={`p-4 rounded-lg cursor-pointer transition border-2 ${
                selectedFormId === form.formId
                  ? "bg-blue-50 border-blue-500"
                  : "bg-slate-50 border-slate-200 hover:border-slate-300"
              }`}
            >
              <p className="font-semibold text-gray-800">{form.formName}</p>
              <p className="text-sm text-gray-600">{form.description}</p>
              {form.category && (
                <p className="text-xs text-gray-500 mt-1">{form.category}</p>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 bg-slate-50 rounded-lg">
            <p className="text-gray-500">Chưa có biểu mẫu nào</p>
            <p className="text-sm text-gray-400 mt-2">Liên hệ admin để thêm biểu mẫu</p>
          </div>
        )}
      </div>

      <Pagination
        currentPage={page}
        pageSize={pageSize}
        totalItems={forms.length}
        onPageChange={setPage}
      />
    </div>
  );
};

export default FormSelector;
