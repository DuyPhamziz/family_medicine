import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAdminFormDetail } from "../../../hooks/admin/useAdminFormDetail";
import QuestionModal from "./QuestionModal";
import SectionModal from "./SectionModal";

const AdminFormQuestionsPage = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const {
    form,
    sections,
    loading,
    error,
    questionCount,
    addSection,
    editSection,
    removeSection,
    addQuestion,
    editQuestion,
    removeQuestion,
  } = useAdminFormDetail(formId);

  const [activeSectionId, setActiveSectionId] = useState("");
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const activeSection = useMemo(
    () => sections.find((section) => section.sectionId === activeSectionId),
    [sections, activeSectionId]
  );

  const handleSelectSection = (sectionId) => {
    setActiveSectionId(sectionId);
  };

  const handleCreateSection = () => {
    setEditingSection(null);
    setSectionModalOpen(true);
  };

  const handleEditSection = (section) => {
    setEditingSection(section);
    setSectionModalOpen(true);
  };

  const handleSaveSection = async (payload) => {
    if (editingSection) {
      await editSection(editingSection.sectionId, payload);
    } else {
      const created = await addSection(payload);
      setActiveSectionId(created.sectionId);
    }
    setSectionModalOpen(false);
    setEditingSection(null);
  };

  const handleRemoveSection = async (sectionId) => {
    if (!window.confirm("Delete this section?")) return;
    await removeSection(sectionId);
    if (activeSectionId === sectionId) {
      setActiveSectionId("");
    }
  };

  const handleCreateQuestion = () => {
    if (!activeSectionId) return;
    setEditingQuestion(null);
    setQuestionModalOpen(true);
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setQuestionModalOpen(true);
  };

  const handleSaveQuestion = async (payload) => {
    if (!activeSectionId) return;
    if (editingQuestion) {
      await editQuestion(editingQuestion.questionId, payload);
    } else {
      await addQuestion(activeSectionId, payload);
    }
    setQuestionModalOpen(false);
    setEditingQuestion(null);
  };

  const handleRemoveQuestion = async (questionId) => {
    if (!window.confirm("Delete this question?")) return;
    await removeQuestion(questionId);
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
      <header className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <button
              onClick={() => navigate("/system/admin/forms")}
              className="text-xs font-semibold text-sky-600"
            >
              Back to forms
            </button>
            <h1 className="text-2xl font-semibold text-slate-900">{form?.formName}</h1>
            <p className="text-sm text-slate-500">{questionCount} questions across sections</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreateSection}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Add section
            </button>
            <button
              onClick={handleCreateQuestion}
              disabled={!activeSectionId}
              className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add question
            </button>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Sections</div>
          {sections.map((section) => (
            <button
              key={section.sectionId}
              onClick={() => handleSelectSection(section.sectionId)}
              className={`w-full rounded-xl border px-3 py-2 text-left text-sm font-semibold transition ${
                activeSectionId === section.sectionId
                  ? "border-sky-200 bg-sky-50 text-sky-700"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{section.sectionName}</span>
                <span className="text-xs text-slate-400">{section.questions?.length || 0}</span>
              </div>
              <div className="mt-2 flex gap-2 text-xs">
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    handleEditSection(section);
                  }}
                  className="text-slate-500 hover:text-slate-700"
                >
                  Edit
                </button>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    handleRemoveSection(section.sectionId);
                  }}
                  className="text-rose-500 hover:text-rose-700"
                >
                  Delete
                </button>
              </div>
            </button>
          ))}
        </aside>

        <section className="space-y-4">
          {!activeSection ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
              Select a section to manage questions.
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{activeSection.sectionName}</h2>
                  <p className="text-xs text-slate-400">Order {activeSection.sectionOrder || 1}</p>
                </div>
                <button
                  onClick={handleCreateQuestion}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  New question
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {(activeSection.questions || []).map((question) => (
                  <div
                    key={question.questionId}
                    className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {question.questionOrder || 1}. {question.questionText}
                        </p>
                        <p className="text-xs text-slate-500">
                          {question.questionType} {question.questionCode ? `• ${question.questionCode}` : ""}
                        </p>
                      </div>
                      <div className="flex gap-2 text-xs">
                        <button
                          onClick={() => handleEditQuestion(question)}
                          className="text-slate-500 hover:text-slate-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleRemoveQuestion(question.questionId)}
                          className="text-rose-500 hover:text-rose-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    {question.helpText && (
                      <p className="mt-2 text-xs text-slate-500">{question.helpText}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      <SectionModal
        open={sectionModalOpen}
        onClose={() => setSectionModalOpen(false)}
        onSubmit={handleSaveSection}
        initialData={editingSection}
      />

      <QuestionModal
        open={questionModalOpen}
        onClose={() => setQuestionModalOpen(false)}
        onSubmit={handleSaveQuestion}
        initialData={editingQuestion}
        sections={sections}
        activeSectionId={activeSectionId}
      />
    </div>
  );
};

export default AdminFormQuestionsPage;
