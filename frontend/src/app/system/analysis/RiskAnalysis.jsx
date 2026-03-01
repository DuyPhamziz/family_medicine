import React, { useEffect, useState } from "react";
import { useDoctorSubmissions, useDoctorSubmission, useRespondToSubmission } from "../../../hooks/data/useDoctorData";

const STATUS_OPTIONS = ["ALL", "PENDING", "REVIEWED", "RESPONDED"];
const RISK_LEVEL_OPTIONS = ["ALL", "VERY_HIGH", "HIGH", "MEDIUM", "LOW"];

const RiskAnalysis = () => {
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [riskLevelFilter, setRiskLevelFilter] = useState("ALL");
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [responseMethod, setResponseMethod] = useState("NONE");

  // Use React Query hooks
  const statusParam = statusFilter === "ALL" ? null : statusFilter;
  const { data: submissions = [], isLoading } = useDoctorSubmissions(statusParam);
  const { data: selected, isLoading: detailLoading } = useDoctorSubmission(selectedId);
  const respondMutation = useRespondToSubmission();

  // Filter submissions by risk level (client-side)
  useEffect(() => {
    if (riskLevelFilter === "ALL") {
      setFilteredSubmissions(submissions);
    } else {
      const filtered = submissions.filter(
        (s) => s.riskLevel && s.riskLevel.toUpperCase() === riskLevelFilter
      );
      setFilteredSubmissions(filtered);
    }
  }, [submissions, riskLevelFilter]);

  // Update response form when detail loads
  useEffect(() => {
    if (selected) {
      setResponseMessage(selected.doctorResponse || "");
      setResponseMethod(selected.responseMethod || "NONE");
    }
  }, [selected]);

  const openDetail = (submissionId) => {
    setSelectedId(submissionId);
  };

  const submitResponse = () => {
    if (!selected?.submissionId || !responseMessage.trim()) return;

    respondMutation.mutate({
      id: selected.submissionId,
      response: {
        responseMessage,
        responseMethod,
      },
    });
  };

  const getRiskBadgeColor = (riskLevel) => {
    if (!riskLevel) return "bg-gray-100 text-gray-600";
    const level = riskLevel.toUpperCase();
    if (level === "VERY_HIGH") return "bg-red-600 text-white";
    if (level === "HIGH") return "bg-orange-500 text-white";
    if (level === "MEDIUM") return "bg-yellow-500 text-white";
    if (level === "LOW") return "bg-green-500 text-white";
    return "bg-gray-100 text-gray-600";
  };

  const getStatusBadgeColor = (status) => {
    if (status === "PENDING") return "bg-orange-100 text-orange-700";
    if (status === "RESPONDED") return "bg-green-100 text-green-700";
    if (status === "REVIEWED") return "bg-blue-100 text-blue-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Submissions từ Form Public</h1>
          <p className="text-gray-600 mt-2">
            Phân loại theo trạng thái và mức độ nguy cơ • {filteredSubmissions.length} kết quả
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 font-medium">Trạng thái:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 bg-white"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 font-medium">Nguy cơ:</label>
            <select
              value={riskLevelFilter}
              onChange={(e) => setRiskLevelFilter(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 bg-white"
            >
              {RISK_LEVEL_OPTIONS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
          Không có submission phù hợp với bộ lọc: <strong>{statusFilter}</strong>
          {riskLevelFilter !== "ALL" && <> • <strong>{riskLevelFilter}</strong></>}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {filteredSubmissions.map((submission) => (
              <button
                key={submission.submissionId}
                onClick={() => openDetail(submission.submissionId)}
                className="w-full text-left bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:border-teal-300 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-bold text-slate-800">{submission.patientName || "N/A"}</p>
                    <p className="text-sm text-slate-500 mt-1">{submission.formTitle || "Unknown form"}</p>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getStatusBadgeColor(submission.status)}`}>
                      {submission.status}
                    </span>
                    {submission.riskLevel && (
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getRiskBadgeColor(submission.riskLevel)}`}>
                        {submission.riskLevel}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                  <span>📧 {submission.email || "-"}</span>
                  <span>📞 {submission.phone || "-"}</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  {submission.createdAt ? new Date(submission.createdAt).toLocaleString("vi-VN") : "-"}
                </p>
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 min-h-[400px]">
            {detailLoading ? (
              <div className="text-slate-500">Đang tải chi tiết...</div>
            ) : !selected ? (
              <div className="text-slate-500">Chọn một submission để xem chi tiết</div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{selected.patientName || "N/A"}</h3>
                  <p className="text-sm text-slate-500">{selected.phone || "-"} • {selected.email || "-"}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-slate-50 p-3 rounded">
                    <span className="text-slate-500">Form:</span> <span className="font-semibold">{selected.formTitle || "-"}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded">
                    <span className="text-slate-500">Version:</span> <span className="font-semibold">{selected.formVersion || "-"}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded flex items-center gap-2">
                    <span className="text-slate-500">Risk:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRiskBadgeColor(selected.riskLevel)}`}>
                      {selected.riskLevel || "N/A"}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded">
                    <span className="text-slate-500">Score:</span> <span className="font-semibold">{selected.totalScore ?? "-"}</span>
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-slate-700 mb-2">Answers</p>
                  <div className="max-h-40 overflow-y-auto border rounded-lg">
                    {(selected.answers || []).map((a, idx) => (
                      <div key={`${a.questionCode}-${idx}`} className="px-3 py-2 border-b last:border-b-0 text-sm">
                        <span className="font-semibold text-slate-700">{a.questionCode}</span>: {a.value}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t">
                  <p className="font-semibold text-slate-700">Doctor response</p>
                  <textarea
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    className="w-full border rounded-lg p-3 min-h-24"
                    placeholder="Nhập phản hồi cho bệnh nhân..."
                  />

                  <div className="flex items-center gap-3">
                    <select
                      value={responseMethod}
                      onChange={(e) => setResponseMethod(e.target.value)}
                      className="border rounded-lg px-3 py-2"
                    >
                      <option value="NONE">NONE</option>
                      <option value="EMAIL">EMAIL</option>
                      <option value="ZALO">ZALO</option>
                    </select>

                    <button
                      onClick={submitResponse}
                      disabled={respondMutation.isPending || !responseMessage.trim()}
                      className="px-4 py-2 rounded-lg bg-emerald-600 text-white disabled:opacity-50"
                    >
                      {respondMutation.isPending ? "Đang gửi..." : "Gửi phản hồi"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskAnalysis;
