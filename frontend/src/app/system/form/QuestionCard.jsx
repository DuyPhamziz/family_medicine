import React, { useState } from "react";
import api from "../../../service/api";

const QuestionCard = ({ question, index, value, onChange, error, readOnly }) => {
  const [focused, setFocused] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const repeatableValues = Array.isArray(value)
    ? value
    : (question.allowAdditionalAnswers ? [] : null);

  const updateRepeatableValue = (idx, nextValue) => {
    const current = Array.isArray(repeatableValues) ? [...repeatableValues] : [];
    current[idx] = nextValue;
    onChange(current);
  };

  const addRepeatableValue = () => {
    const current = Array.isArray(repeatableValues) ? [...repeatableValues] : [];
    const maxAllowed = question.maxAdditionalAnswers;
    if (maxAllowed && current.length >= maxAllowed) return;
    current.push("");
    onChange(current);
  };

  const removeRepeatableValue = (idx) => {
    const current = Array.isArray(repeatableValues) ? [...repeatableValues] : [];
    current.splice(idx, 1);
    onChange(current);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      if (value && typeof value === "string") {
        await api.delete(`/api/files/${value}`).catch(() => {});
      }

      const response = await api.post("/api/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const uploadedValue = typeof response.data === "string" ? response.data : response.data?.fileId;
      onChange(uploadedValue);
      alert("Đã tải ảnh lên thành công!");
    } catch (error) {
      alert("Lỗi khi tải ảnh lên!");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!value || readOnly) return;
    try {
      await api.delete(`/api/files/${value}`).catch(() => {});
    } finally {
      onChange("");
    }
  };

  const renderInput = () => {
    // CSS dùng chung cho các ô nhập bị khóa
    const readOnlyStyles = readOnly 
      ? "bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200 shadow-none" 
      : "";

    switch (question.questionType) {
      case "TEXT":
        if (question.allowAdditionalAnswers) {
          const items = Array.isArray(repeatableValues) && repeatableValues.length > 0 ? repeatableValues : [""];
          const canAddMore = !question.maxAdditionalAnswers || items.length < question.maxAdditionalAnswers;

          return (
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={`${question.questionId}-text-${idx}`} className="flex gap-2 items-start">
                  <input
                    type="text"
                    value={item || ""}
                    readOnly={readOnly}
                    onChange={(e) => !readOnly && updateRepeatableValue(idx, e.target.value)}
                    onFocus={() => !readOnly && setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder={`Mục bổ sung #${idx + 1}`}
                    className={`flex-1 px-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                      error
                        ? "border-red-500"
                        : focused
                        ? "border-blue-500 focus:ring-2 focus:ring-blue-500"
                        : "border-gray-300"
                    } ${readOnlyStyles}`}
                  />
                  {!readOnly && items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRepeatableValue(idx)}
                      className="px-3 py-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Xóa
                    </button>
                  )}
                </div>
              ))}

              {!readOnly && canAddMore && (
                <button
                  type="button"
                  onClick={addRepeatableValue}
                  className="px-4 py-2 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 font-medium"
                >
                  ➕ Trả lời thêm
                </button>
              )}
            </div>
          );
        }

        return (
          <input
            type="text"
            value={value || ""}
            readOnly={readOnly} // Khóa ô nhập
            onChange={(e) => !readOnly && onChange(e.target.value)}
            onFocus={() => !readOnly && setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={readOnly ? "" : "Nhập câu trả lời..."}
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
              error
                ? "border-red-500"
                : focused
                ? "border-blue-500 focus:ring-2 focus:ring-blue-500"
                : "border-gray-300"
            } ${readOnlyStyles}`}
          />
        );

      case "NUMBER":
        if (question.allowAdditionalAnswers) {
          const items = Array.isArray(repeatableValues) && repeatableValues.length > 0 ? repeatableValues : [""];
          const canAddMore = !question.maxAdditionalAnswers || items.length < question.maxAdditionalAnswers;

          return (
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={`${question.questionId}-number-${idx}`} className="flex gap-2 items-start">
                  <input
                    type="number"
                    value={item || ""}
                    readOnly={readOnly}
                    onChange={(e) => !readOnly && updateRepeatableValue(idx, e.target.value)}
                    onFocus={() => !readOnly && setFocused(true)}
                    onBlur={() => setFocused(false)}
                    min={question.minValue}
                    max={question.maxValue}
                    placeholder={`Giá trị bổ sung #${idx + 1}`}
                    className={`flex-1 px-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                      error
                        ? "border-red-500"
                        : focused
                        ? "border-blue-500 focus:ring-2 focus:ring-blue-500"
                        : "border-gray-300"
                    } ${readOnlyStyles}`}
                  />
                  {!readOnly && items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRepeatableValue(idx)}
                      className="px-3 py-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Xóa
                    </button>
                  )}
                </div>
              ))}

              {!readOnly && canAddMore && (
                <button
                  type="button"
                  onClick={addRepeatableValue}
                  className="px-4 py-2 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 font-medium"
                >
                  ➕ Trả lời thêm
                </button>
              )}
            </div>
          );
        }

        return (
          <div className="flex gap-2">
            <input
              type="number"
              value={value || ""}
              readOnly={readOnly} // Khóa ô nhập
              onChange={(e) => !readOnly && onChange(e.target.value)}
              onFocus={() => !readOnly && setFocused(true)}
              onBlur={() => setFocused(false)}
              min={question.minValue}
              max={question.maxValue}
              placeholder={readOnly ? "" : "Nhập số..."}
              className={`flex-1 px-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                error
                  ? "border-red-500"
                  : focused
                  ? "border-blue-500 focus:ring-2 focus:ring-blue-500"
                  : "border-gray-300"
              } ${readOnlyStyles}`}
            />
            {question.unit && (
              <span className={`px-4 py-3 bg-gray-100 rounded-lg border-2 border-gray-300 flex items-center font-medium text-gray-600 ${readOnly ? 'opacity-50' : ''}`}>
                {question.unit}
              </span>
            )}
          </div>
        );

      case "DATE":
        if (question.allowAdditionalAnswers) {
          const items = Array.isArray(repeatableValues) && repeatableValues.length > 0 ? repeatableValues : [""];
          const canAddMore = !question.maxAdditionalAnswers || items.length < question.maxAdditionalAnswers;

          return (
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={`${question.questionId}-date-${idx}`} className="flex gap-2 items-start">
                  <input
                    type="date"
                    value={item || ""}
                    readOnly={readOnly}
                    onChange={(e) => !readOnly && updateRepeatableValue(idx, e.target.value)}
                    className={`flex-1 px-4 py-3 border-2 rounded-lg focus:outline-none ${
                      error ? "border-red-500" : "border-gray-300"
                    } ${readOnlyStyles}`}
                  />
                  {!readOnly && items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRepeatableValue(idx)}
                      className="px-3 py-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Xóa
                    </button>
                  )}
                </div>
              ))}

              {!readOnly && canAddMore && (
                <button
                  type="button"
                  onClick={addRepeatableValue}
                  className="px-4 py-2 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 font-medium"
                >
                  ➕ Trả lời thêm
                </button>
              )}
            </div>
          );
        }

        return (
          <input
            type="date"
            value={value || ""}
            readOnly={readOnly}
            onChange={(e) => !readOnly && onChange(e.target.value)}
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none ${
              error ? "border-red-500" : "border-gray-300"
            } ${readOnlyStyles}`}
          />
        );

      case "SINGLE_CHOICE": {
                let options = [];
        try {
          options = JSON.parse(question.options || "[]");
        } catch {
          options = question.options ? question.options.split(",") : [];
        }

        // --- GIAO DIỆN KHI BỊ KHÓA (READ ONLY) ---
        if (readOnly) {
          return (
            <div className="mt-2">
              <div className="inline-flex items-center px-5 py-2.5 rounded-xl bg-blue-50 text-blue-700 border-2 border-blue-200 shadow-sm">
                <span className="mr-2 text-xl">
                  {value === "Nam" ? "♂️" : value === "Nữ" ? "♀️" : "👤"}
                </span>
                <span className="font-bold text-lg uppercase tracking-wide">
                  {value || "Chưa xác định"}
                </span>
              </div>
            </div>
          );
        }

        // --- GIAO DIỆN KHI ĐƯỢC PHÉP CHỌN (BÌNH THƯỜNG) ---
        return (
          <div className="space-y-2">
            {options.map((option) => (
              <label
                key={option}
                className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  value === option
                    ? "border-blue-500 bg-blue-50"
                    : error
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <input
                  type="radio"
                  name={`question_${question.questionId}`}
                  value={option}
                  checked={value === option}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="ml-3 font-medium text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );
      }
      case "MULTIPLE_CHOICE": {
        let multiOptions = [];
        try {
          multiOptions = JSON.parse(question.options || "[]");
        } catch {
          multiOptions = question.options ? question.options.split(",") : [];
        }
        const selectedMulti = Array.isArray(value) ? value : [];

        return (
          <div className={`space-y-2 ${readOnly ? "pointer-events-none" : ""}`}>
            {multiOptions.map((option) => (
              <label
                key={option}
                className={`flex items-center p-3 border-2 rounded-lg transition-all ${
                  selectedMulti.includes(option)
                    ? "border-blue-500 bg-blue-50"
                    : readOnly
                    ? "border-slate-100 bg-slate-50 opacity-60"
                    : "border-gray-300 hover:border-gray-400 cursor-pointer"
                }`}
              >
                <input
                  type="checkbox"
                  disabled={readOnly}
                  checked={selectedMulti.includes(option)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange([...selectedMulti, option]);
                    } else {
                      onChange(selectedMulti.filter((o) => o !== option));
                    }
                  }}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="ml-3 font-medium text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );
      }
      case "IMAGE_UPLOAD":
        return (
          <div className="space-y-3 p-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
            <input
              type="file"
              accept="image/*"
              disabled={readOnly || isUploading}
              onChange={handleFileUpload}
              className="hidden"
              id={`file-${question.questionId}`}
            />
            <label 
              htmlFor={`file-${question.questionId}`}
              className={`flex flex-col items-center justify-center cursor-pointer ${readOnly ? 'hidden' : ''}`}
            >
              <span className="text-4xl mb-2">📸</span>
              <span className="text-blue-600 font-semibold">
                {isUploading ? "Đang tải lên..." : "Bấm để chọn ảnh kết quả / toa thuốc"}
              </span>
            </label>

            {value && (
              <div className="mt-2 text-center">
                <p className="text-xs text-green-600 font-medium mb-2">✅ Đã lưu file: {value}</p>
                <img 
                  src={`http://localhost:8080/api/files/view/${value}`} 
                  alt="Preview" 
                  className="w-32 h-32 object-cover rounded-lg shadow-md mx-auto border-2 border-white"
                />
                {!readOnly && (
                  <button
                    type="button"
                    onClick={handleDeleteImage}
                    className="mt-3 px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm"
                  >
                    Xóa ảnh
                  </button>
                )}
              </div>
            )}
          </div>
        );
      case "BOOLEAN": {
        const selectedValue = value === true ? "true" : value === false ? "false" : "";
        return (
          <div className={`flex gap-3 ${readOnly ? "pointer-events-none opacity-60" : ""}`}>
            {[
              { label: "Có", value: "true" },
              { label: "Không", value: "false" },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex items-center gap-2 px-4 py-3 border-2 rounded-lg transition-all ${
                  selectedValue === option.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400 cursor-pointer"
                }`}
              >
                <input
                  type="radio"
                  disabled={readOnly}
                  name={`question_${question.questionId}`}
                  value={option.value}
                  checked={selectedValue === option.value}
                  onChange={(e) => onChange(e.target.value === "true")}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="font-medium text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 border-l-4 transition-all ${
        readOnly ? "opacity-90 grayscale-[0.2]" : "hover:shadow-lg"
      } ${
        error ? "border-red-500" : "border-blue-500"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm ${
          error ? "bg-red-500" : (value || readOnly) ? "bg-green-500" : "bg-blue-500"
        }`}>
          {readOnly ? "🔒" : index + 1}
        </div>

        <div className="flex-1 min-w-0">
          <label className="block font-bold text-gray-800 mb-1 text-lg">
            {question.questionText}
            {question.required && !readOnly && (
              <span className="text-red-500 ml-1" title="Bắt buộc">*</span>
            )}
            {readOnly && <span className="ml-2 text-xs font-normal text-slate-400 italic">(Thông tin cố định)</span>}
          </label>

          {question.helpText && (
            <p className="text-sm text-blue-600 mb-3 bg-blue-50 p-2 rounded inline-block">
              💡 {question.helpText}
            </p>
          )}

          <div className="mt-4">{renderInput()}</div>
          {error && <p className="text-sm text-red-600 mt-2 flex items-center gap-1">⚠️ {error}</p>}
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;