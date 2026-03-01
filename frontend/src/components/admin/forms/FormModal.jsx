import React, { useEffect, useState } from "react";

const FormModal = ({ open, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    formName: "",
    description: "",
    category: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        formName: initialData.formName || "",
        description: initialData.description || "",
        category: initialData.category || "",
      });
      return;
    }
    setFormData({ formName: "", description: "", category: "" });
  }, [initialData]);

  if (!open) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900">
            {initialData ? "Edit form" : "New form"}
          </h2>
          <p className="text-sm text-slate-500">Define the basic metadata for this form.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="formName" className="text-sm font-medium text-slate-700">Form name</label>
            <input
              id="formName"
              type="text"
              name="formName"
              value={formData.formName}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
              placeholder="e.g. Diabetes Screening"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="text-sm font-medium text-slate-700">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
              placeholder="Short description"
            />
          </div>

          <div>
            <label htmlFor="category" className="text-sm font-medium text-slate-700">Category</label>
            <input
              id="category"
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
              placeholder="e.g. GENERAL"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormModal;
