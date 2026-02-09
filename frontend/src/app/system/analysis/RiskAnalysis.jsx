import React, { useState, useEffect } from "react";
import api from "../../../service/api";

const RiskAnalysis = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        const response = await api.get("/api/forms/doctor/submissions");
        setSubmissions(response.data || []);
      } catch (error) {
        console.error("Error loading submissions:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSubmissions();
  }, []);

  const getRiskColor = (riskLevel) => {
    switch (riskLevel?.toUpperCase()) {
      case "HIGH":
        return "bg-red-100 text-red-800 border-red-300";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "LOW":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getRiskLabel = (riskLevel) => {
    const labels = {
      HIGH: "🔴 Cao",
      MEDIUM: "🟡 Trung bình",
      LOW: "🟢 Thấp",
    };
    return labels[riskLevel?.toUpperCase()] || riskLevel;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Kết quả chuẩn đoán</h1>
        <p className="text-gray-600 mt-2">
          Danh sách kết quả phân tầng nguy cơ bệnh của bệnh nhân
        </p>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">📊 Chưa có kết quả nào</p>
          <p className="text-gray-400">Hãy hoàn thành một biểu mẫu để xem kết quả phân tích</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {submissions.map((submission) => (
            <div
              key={submission.submissionId}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
                {/* Thông tin bệnh nhân */}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Bệnh nhân</p>
                  <p className="text-lg font-bold text-gray-800">
                    {submission.patientName || "N/A"}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Mã: {submission.patientCode || "N/A"}
                  </p>
                </div>

                {/* Thông tin biểu mẫu */}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Biểu mẫu</p>
                  <p className="text-lg font-bold text-gray-800">
                    {submission.formName || "N/A"}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Loại: {submission.category || "N/A"}
                  </p>
                </div>

                {/* Kết quả nguy cơ */}
                <div className="flex items-center justify-end">
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-2">Mức độ nguy cơ</p>
                    <span
                      className={`inline-block px-4 py-2 rounded-lg font-bold border-2 ${getRiskColor(
                        submission.riskLevel
                      )}`}
                    >
                      {getRiskLabel(submission.riskLevel)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chi tiết kết quả */}
              <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Điểm số:</span>
                    <span className="ml-2 font-bold text-gray-800">
                      {submission.totalScore?.toFixed(2) || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Ngày phân tích:</span>
                    <span className="ml-2 font-bold text-gray-800">
                      {new Date(submission.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>

                {submission.diagnosticResult && (
                  <div className="mt-4 p-3 bg-white rounded border border-gray-300">
                    <p className="text-xs text-gray-600 mb-1">💡 Kết quả chẩn đoán:</p>
                    <p className="text-sm text-gray-800">
                      {submission.diagnosticResult}
                    </p>
                  </div>
                )}

                {submission.notes && (
                  <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                    <p className="text-xs text-blue-600 mb-1">📝 Ghi chú:</p>
                    <p className="text-sm text-blue-800">{submission.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RiskAnalysis;
