import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminForms } from "../../../hooks/admin/useAdminForms";
import FormModal from "./FormModal";

const AdminFormsPage = () => {
  const navigate = useNavigate();
  const { forms, loading, error, reload, saveForm, removeForm, createVersion } = useAdminForms();
  const [search, setSearch] = useState("");
  const [activeForm, setActiveForm] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filteredForms = useMemo(() => {
    if (!search.trim()) return forms;
    const keyword = search.toLowerCase();
    return forms.filter((form) =>
      [form.formName, form.description, form.category].some((value) =>
        String(value || "").toLowerCase().includes(keyword)
      )
    );
  }, [forms, search]);

  const openCreate = () => {
    setActiveForm(null);
    setModalOpen(true);
  };

  const openEdit = (form) => {
    setActiveForm(form);
    setModalOpen(true);
  };

  const handleSubmit = async (payload) => {
    await saveForm(payload, activeForm?.formId);
    setModalOpen(false);
    setActiveForm(null);
    reload();
  };

  const handleDelete = async (form) => {
    if (!window.confirm("Delete this form?")) return;
    await removeForm(form.formId);
    reload();
  };

  const handleCreateVersion = async (form) => {
    if (!window.confirm("Create a new version of this form?")) return;
    await createVersion(form.formId, {
      formName: form.formName,
      description: form.description,
      category: form.category,
    });
    reload();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="rounded-3xl bg-gradient-to-r from-sky-50 via-white to-slate-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Admin</p>
            <h1 className="text-2xl font-semibold text-slate-900">Form Management</h1>
            <p className="text-sm text-slate-500">Create, version, and organize forms for clinical intake.</p>
          </div>
          <button
            onClick={openCreate}
            className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700"
          >
            New form
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, category, description"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
          />
        </div>
        <div className="text-xs text-slate-400">{filteredForms.length} forms</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredForms.map((form) => (
          <div key={form.formId} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{form.formName}</h3>
                <p className="mt-1 text-sm text-slate-500">{form.description || "No description"}</p>
              </div>
              <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-600">
                {form.category || "GENERAL"}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="rounded-full border border-slate-200 px-3 py-1">Version {form.version || 1}</span>
              <span className="rounded-full border border-slate-200 px-3 py-1">{form.status || "ACTIVE"}</span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={() => navigate(`/system/admin/forms/${form.formId}/questions`)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-sky-200 hover:bg-sky-50"
              >
                Manage questions
              </button>
              <button
                onClick={() => openEdit(form)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-sky-200 hover:bg-sky-50"
              >
                Edit
              </button>
              <button
                onClick={() => handleCreateVersion(form)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-sky-200 hover:bg-sky-50"
              >
                New version
              </button>
              <button
                onClick={() => handleDelete(form)}
                className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={activeForm}
      />
    </div>
  );
};

export default AdminFormsPage;
