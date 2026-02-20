import React, { useEffect, useState } from "react";

const SectionModal = ({ open, onClose, onSubmit, initialData }) => {
  const [sectionData, setSectionData] = useState({
    sectionName: "",
    sectionOrder: 1,
  });

  useEffect(() => {
    if (initialData) {
      setSectionData({
        sectionName: initialData.sectionName || "",
        sectionOrder: initialData.sectionOrder || 1,
      });
      return;
    }
    setSectionData({ sectionName: "", sectionOrder: 1 });
  }, [initialData]);

  if (!open) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSectionData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      sectionName: sectionData.sectionName,
      sectionOrder: Number(sectionData.sectionOrder) || 1,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">
          {initialData ? "Edit section" : "New section"}
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Section name</label>
            <input
              type="text"
              name="sectionName"
              value={sectionData.sectionName}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Order</label>
            <input
              type="number"
              name="sectionOrder"
              value={sectionData.sectionOrder}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
              min="1"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SectionModal;
