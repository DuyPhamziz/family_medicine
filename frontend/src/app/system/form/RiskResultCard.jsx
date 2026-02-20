import React, { useEffect, useState } from "react";

const RiskResultCard = ({
  result,
  form,
  patient,
  onReturnToForm,
  onBackToList,
}) => {
  const [displayPercentage, setDisplayPercentage] = useState(0);

  useEffect(() => {
    // Animate the risk percentage
    const target = result.riskPercentage || 0;
    let current = 0;
    const increment = target / 100;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setDisplayPercentage(target);
        clearInterval(timer);
      } else {
        setDisplayPercentage(Math.round(current));
      }
    }, 20);
    
    return () => clearInterval(timer);
  }, [result]);

  const getRiskColor = (percentage) => {
    if (percentage <= 33) return { bg: "bg-green-50", text: "text-green-700", badge: "bg-green-600", icon: "🟢", label: "THẤP" };
    if (percentage <= 66) return { bg: "bg-yellow-50", text: "text-yellow-700", badge: "bg-yellow-600", icon: "🟡", label: "TRUNG BÌNH" };
    return { bg: "bg-red-50", text: "text-red-700", badge: "bg-red-600", icon: "🔴", label: "CAO" };
  };

  const riskColor = getRiskColor(displayPercentage);
  const questionCount = form?.sections
    ? form.sections.reduce((total, section) => total + (section.questions?.length || 0), 0)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Kết quả chẩn đoán
          </h1>
          <p className="text-xl text-gray-600">{form.formName}</p>
        </div>

        {/* Patient Info Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-l-4 border-blue-600">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm text-gray-500 uppercase tracking-wide">Thông tin bệnh nhân</h3>
              <h2 className="text-2xl font-bold text-gray-800">{patient.fullName}</h2>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Tuổi</p>
              <p className="text-3xl font-bold text-blue-600">{patient.age}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-gray-600">Giới tính</p>
              <p className="font-semibold text-gray-800">
                {patient.gender === "M" ? "Nam" : "Nữ"}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-gray-600">Điều trị tại</p>
              <p className="font-semibold text-gray-800 truncate">
                {patient.clinic || "N/A"}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-gray-600">Phòng khám</p>
              <p className="font-semibold text-gray-800">{patient.roomNumber || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Main Risk Score Card */}
        <div className={`rounded-lg shadow-lg p-8 mb-6 border-2 border-transparent ${riskColor.bg}`}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Mức độ nguy cơ</h2>
            <div className={`text-6xl font-bold ${riskColor.text}`}>
              {displayPercentage.toFixed(1)}%
            </div>
          </div>

          {/* Risk Progress Bar */}
          <div className="mb-8">
            <div className="relative h-4 bg-gray-300 rounded-full overflow-hidden mb-4">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  displayPercentage <= 33
                    ? "bg-gradient-to-r from-green-400 to-green-600"
                    : displayPercentage <= 66
                    ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                    : "bg-gradient-to-r from-red-400 to-red-600"
                }`}
                style={{ width: `${displayPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>0%</span>
              <span>Thấp (0-33%)</span>
              <span>Trung bình (34-66%)</span>
              <span>Cao (67-100%)</span>
              <span>100%</span>
            </div>
          </div>

          {/* Risk Badge */}
          <div className="flex items-center gap-3">
            <span className={`${riskColor.badge} text-white px-4 py-2 rounded-full font-bold text-lg`}>
              {riskColor.icon} {riskColor.label}
            </span>
            <div className="text-sm text-gray-700">
              <p className="font-semibold">
                {displayPercentage <= 33
                  ? "Nguy cơ thấp - Tiếp tục theo dõi định kỳ"
                  : displayPercentage <= 66
                  ? "Nguy cơ trung bình - Tăng cường các biện pháp phòng ngừa"
                  : "Nguy cơ cao - Cần can thiệp và theo dõi chặt chẽ"}
              </p>
            </div>
          </div>
        </div>

        {/* Score Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-600">
            <p className="text-gray-600 text-sm uppercase tracking-wide mb-2">
              Tổng điểm số
            </p>
            <p className="text-4xl font-bold text-blue-600">
              {result.totalScore?.toFixed(1) || 0}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Điểm tối đa: {result.maxScore || 100}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-purple-600">
            <p className="text-gray-600 text-sm uppercase tracking-wide mb-2">
              Trung bình câu hỏi
            </p>
            <p className="text-4xl font-bold text-purple-600">
              {(result.totalScore / (questionCount || 1)).toFixed(1) || 0}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {questionCount} câu hỏi
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-indigo-600">
            <p className="text-gray-600 text-sm uppercase tracking-wide mb-2">
              Hoàn thành
            </p>
            <p className="text-4xl font-bold text-indigo-600">100%</p>
            <p className="text-xs text-gray-500 mt-2">
              Tất cả câu hỏi đã trả lời
            </p>
          </div>
        </div>

        {/* Diagnostic Result */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Kết luận chẩn đoán</h3>
          <div className={`p-4 rounded-lg ${riskColor.bg}`}>
            <p className={`${riskColor.text} leading-relaxed`}>
              {result.diagnosticResult ||
                `Dựa trên kết quả các chỉ số được cung cấp, mức độ nguy cơ của bệnh nhân được xác định ở mức ${riskColor.label.toLowerCase()} với tỷ lệ ${displayPercentage.toFixed(1)}%.`}
            </p>
          </div>
        </div>

        {/* Recommendations */}
        {result.recommendations && (
          <div className="bg-blue-50 rounded-lg shadow-lg p-6 mb-6 border-l-4 border-blue-600">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              💡 Khuyến nghị
            </h3>
            <ul className="space-y-3 text-gray-700">
              {result.recommendations.map((rec, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Notes */}
        {result.notes && (
          <div className="bg-gray-50 rounded-lg shadow-lg p-6 mb-6 border-l-4 border-gray-400">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Ghi chú</h3>
            <p className="text-gray-700">{result.notes}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center sticky bottom-0 bg-white rounded-lg shadow-lg p-4">
          <button
            onClick={onReturnToForm}
            className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-all hover:shadow-md"
          >
            ← Quay lại biểu mẫu
          </button>
          <button
            onClick={onBackToList}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium transition-all shadow-lg hover:shadow-xl"
          >
            Chọn biểu mẫu khác →
          </button>
        </div>
      </div>
    </div>
  );
};

export default RiskResultCard;
