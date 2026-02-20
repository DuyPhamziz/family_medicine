import React, { useEffect, useState } from "react";
import api from "../../service/api";

const RecentResultsTable = ({ selectedPatientId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadResults = async () => {
      if (!selectedPatientId) {
        setSubmissions([]);
        return;
      }
      setLoading(true);
      try {
        const response = await api.get(`/api/submissions/patient/${selectedPatientId}`);
        setSubmissions(response.data || []);
      } catch (err) {
        console.error("Error loading submissions:", err);
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [selectedPatientId]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Kết quả gần đây / Recent assessments
      </h2>

      {!selectedPatientId ? (
        <p className="text-sm text-slate-500">Chọn bệnh nhân để xem kết quả.</p>
      ) : loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : submissions.length === 0 ? (
        <p className="text-sm text-slate-500">Chưa có kết quả nào.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-700 font-semibold">
                  Biểu mẫu
                </th>
                <th className="px-4 py-3 text-left text-gray-700 font-semibold">
                  Điểm số
                </th>
                <th className="px-4 py-3 text-left text-gray-700 font-semibold">
                  Mức độ
                </th>
                <th className="px-4 py-3 text-left text-gray-700 font-semibold">
                  Xuất Excel
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {submissions.map((item) => (
                <tr key={item.submissionId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-800">{item.formName}</td>
                  <td className="px-4 py-3 text-gray-800 font-semibold">
                    {item.totalScore ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.riskLevel === "HIGH"
                          ? "bg-red-100 text-red-800"
                          : item.riskLevel === "MEDIUM"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {item.riskLevel === "HIGH"
                        ? "CAO"
                        : item.riskLevel === "MEDIUM"
                        ? "TRUNG BÌNH"
                        : "THẤP"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() =>
                        window.open(
                          `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8081"}/api/submissions/${
                            item.submissionId
                          }/export`,
                          "_blank"
                        )
                      }
                      className="text-emerald-600 font-semibold hover:underline"
                    >
                      Tải Excel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecentResultsTable;
