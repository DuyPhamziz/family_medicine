import React, { useState } from "react";

const QuestionCard = ({ question, index, value, onChange, error }) => {
  const [focused, setFocused] = useState(false);

  const renderInput = () => {
    switch (question.questionType) {
      case "TEXT":
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Nhập câu trả lời..."
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
              error
                ? "border-red-500 focus:ring-2 focus:ring-red-500"
                : focused
                ? "border-blue-500 focus:ring-2 focus:ring-blue-500"
                : "border-gray-300"
            }`}
          />
        );

      case "NUMBER":
        return (
          <div className="flex gap-2">
            <input
              type="number"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              min={question.minValue}
              max={question.maxValue}
              placeholder="Nhập số..."
              className={`flex-1 px-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                error
                  ? "border-red-500 focus:ring-2 focus:ring-red-500"
                  : focused
                  ? "border-blue-500 focus:ring-2 focus:ring-blue-500"
                  : "border-gray-300"
              }`}
            />
            {question.unit && (
              <span className="px-4 py-3 bg-gray-100 rounded-lg border-2 border-gray-300 flex items-center font-medium text-gray-600">
                {question.unit}
              </span>
            )}
          </div>
        );

      case "DATE":
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
              error
                ? "border-red-500 focus:ring-2 focus:ring-red-500"
                : focused
                ? "border-blue-500 focus:ring-2 focus:ring-blue-500"
                : "border-gray-300"
            }`}
          />
        );

      case "SINGLE_CHOICE": {
        let options = [];
        try {
          options = JSON.parse(question.options || "[]");
        } catch {
          options = question.options ? question.options.split(",") : [];
        }

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
          <div className="space-y-2">
            {multiOptions.map((option) => (
              <label
                key={option}
                className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedMulti.includes(option)
                    ? "border-blue-500 bg-blue-50"
                    : error
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <input
                  type="checkbox"
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

      case "BOOLEAN": {
        const selectedValue = value === true ? "true" : value === false ? "false" : "";
        return (
          <div className="flex gap-3">
            {[
              { label: "Có", value: "true" },
              { label: "Không", value: "false" },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex items-center gap-2 px-4 py-3 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedValue === option.value
                    ? "border-blue-500 bg-blue-50"
                    : error
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <input
                  type="radio"
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
      className={`bg-white rounded-lg shadow-md p-6 border-l-4 transition-all hover:shadow-lg ${
        error ? "border-red-500" : "border-blue-500"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Question number badge */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm ${
          error
            ? "bg-red-500"
            : value
            ? "bg-green-500"
            : "bg-blue-500"
        }`}>
          {index + 1}
        </div>

        <div className="flex-1 min-w-0">
          <label className="block font-bold text-gray-800 mb-1 text-lg">
            {question.questionText}
            {question.required && (
              <span className="text-red-500 ml-1" title="Bắt buộc">
                *
              </span>
            )}
          </label>

          {question.helpText && (
            <p className="text-sm text-blue-600 mb-3 bg-blue-50 p-2 rounded inline-block">
              💡 {question.helpText}
            </p>
          )}

          <div className="mt-4">{renderInput()}</div>

          {error && (
            <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
              ⚠️ {error}
            </p>
          )}

          {question.minValue !== null && question.maxValue !== null && question.questionType === "NUMBER" && (
            <p className="text-xs text-gray-500 mt-2">
              Phạm vi: {question.minValue} - {question.maxValue} {question.unit}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
