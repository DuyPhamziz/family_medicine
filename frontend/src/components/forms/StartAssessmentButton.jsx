import React from "react";

const StartAssessmentButton = ({ onStart, disabled }) => (
  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-8 text-center">
    <button
      onClick={onStart}
      disabled={disabled}
      className="w-full md:w-auto px-8 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-lg"
    >
      Bắt đầu nhập liệu / Start assessment
    </button>
  </div>
);

export default StartAssessmentButton;
