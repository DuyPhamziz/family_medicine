import React, { useEffect, useMemo, useState } from "react";

const QUESTION_TYPES = [
  "TEXT",
  "NUMBER",
  "DATE",
  "BOOLEAN",
  "SINGLE_CHOICE",
  "MULTIPLE_CHOICE",
];

const QuestionModal = ({ open, onClose, onSubmit, initialData, sections, activeSectionId }) => {
  const [questionData, setQuestionData] = useState({
    questionCode: "",
    questionText: "",
    questionType: "TEXT",
    points: 0,
    unit: "",
    minValue: "",
    maxValue: "",
    options: "",
    required: true,
    questionOrder: 1,
    helpText: "",
    displayCondition: "",
  });

  useEffect(() => {
    if (initialData) {
      setQuestionData({
        questionCode: initialData.questionCode || "",
        questionText: initialData.questionText || "",
        questionType: initialData.questionType || "TEXT",
        points: initialData.points || 0,
        unit: initialData.unit || "",
        minValue: initialData.minValue ?? "",
        maxValue: initialData.maxValue ?? "",
        options: (initialData.optionItems || []).map((opt) => opt.optionText).join("\n"),
        required: initialData.required !== false,
        questionOrder: initialData.questionOrder || 1,
        helpText: initialData.helpText || "",
        displayCondition: initialData.displayCondition || "",
      });
      return;
    }
    setQuestionData({
      questionCode: "",
      questionText: "",
      questionType: "TEXT",
      points: 0,
      unit: "",
      minValue: "",
      maxValue: "",
      options: "",
      required: true,
      questionOrder: 1,
      helpText: "",
      displayCondition: "",
    });
  }, [initialData]);

  const sectionOptions = useMemo(() => sections || [], [sections]);

  if (!open) return null;

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setQuestionData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const buildOptions = () => {
    const lines = questionData.options
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    return lines.map((text, index) => ({
      optionText: text,
      optionValue: text,
      optionOrder: index + 1,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      questionCode: questionData.questionCode || undefined,
      questionOrder: Number(questionData.questionOrder) || 1,
      questionText: questionData.questionText,
      questionType: questionData.questionType,
      unit: questionData.unit || null,
      minValue: questionData.minValue === "" ? null : Number(questionData.minValue),
      maxValue: questionData.maxValue === "" ? null : Number(questionData.maxValue),
      points: Number(questionData.points) || 0,
      required: questionData.required,
      helpText: questionData.helpText || null,
      displayCondition: questionData.displayCondition || null,
      options:
        questionData.questionType === "SINGLE_CHOICE" ||
        questionData.questionType === "MULTIPLE_CHOICE"
          ? buildOptions()
          : [],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {initialData ? "Edit question" : "New question"}
            </h2>
            <p className="text-xs text-slate-400">Assign the question to a section and configure options.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="sectionId" className="text-sm font-medium text-slate-700">Section</label>
            <select
              id="sectionId"
              name="sectionId"
              value={activeSectionId || ""}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
              disabled
            >
              {sectionOptions.map((section) => (
                <option key={section.sectionId} value={section.sectionId}>
                  {section.sectionName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="questionCode" className="text-sm font-medium text-slate-700">Question code</label>
            <input
              id="questionCode"
              type="text"
              name="questionCode"
              value={questionData.questionCode}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
            />
          </div>
          <div>
            <label htmlFor="questionOrder" className="text-sm font-medium text-slate-700">Order</label>
            <input
              id="questionOrder"
              type="number"
              name="questionOrder"
              value={questionData.questionOrder}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
              min="1"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="questionText" className="text-sm font-medium text-slate-700">Question text</label>
            <textarea
              id="questionText"
              name="questionText"
              value={questionData.questionText}
              onChange={handleChange}
              rows="3"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
              required
            />
          </div>

          <div>
            <label htmlFor="questionType" className="text-sm font-medium text-slate-700">Type</label>
            <select
              id="questionType"
              name="questionType"
              value={questionData.questionType}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
            >
              {QUESTION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="points" className="text-sm font-medium text-slate-700">Points</label>
            <input
              id="points"
              type="number"
              name="points"
              value={questionData.points}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div>
            <label htmlFor="unit" className="text-sm font-medium text-slate-700">Unit</label>
            <input
              id="unit"
              type="text"
              name="unit"
              value={questionData.unit}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
            />
          </div>
          <div>
            <label htmlFor="minValue" className="text-sm font-medium text-slate-700">Min value</label>
            <input
              id="minValue"
              type="number"
              name="minValue"
              value={questionData.minValue}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
            />
          </div>
          <div>
            <label htmlFor="maxValue" className="text-sm font-medium text-slate-700">Max value</label>
            <input
              id="maxValue"
              type="number"
              name="maxValue"
              value={questionData.maxValue}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="helpText" className="text-sm font-medium text-slate-700">Help text</label>
            <textarea
              id="helpText"
              name="helpText"
              value={questionData.helpText}
              onChange={handleChange}
              rows="2"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {(questionData.questionType === "SINGLE_CHOICE" ||
            questionData.questionType === "MULTIPLE_CHOICE") && (
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Options (one per line)</label>
              <textarea
                name="options"
                value={questionData.options}
                onChange={handleChange}
                rows="4"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
              />
            </div>
          )}

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700">Display condition (JSON)</label>
            <textarea
              name="displayCondition"
              value={questionData.displayCondition}
              onChange={handleChange}
              rows="2"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div className="flex items-center gap-2 md:col-span-2">
            <input
              type="checkbox"
              name="required"
              checked={questionData.required}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            <span className="text-sm text-slate-600">Required question</span>
          </div>

          <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
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
              Save question
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionModal;
