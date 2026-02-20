import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../service/api";

const PatientTimeline = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [patient, setPatient] = useState(null);
	const [submissions, setSubmissions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const loadTimeline = async () => {
			setLoading(true);
			setError("");
			try {
				const [patientRes, submissionsRes] = await Promise.all([
					api.get(`/api/patients/${id}`),
					api.get(`/api/submissions/patient/${id}`),
				]);
				setPatient(patientRes.data);
				setSubmissions(submissionsRes.data || []);
			} catch (err) {
				console.error("Error loading timeline:", err);
				setError("Không thể tải timeline bệnh nhân.");
			} finally {
				setLoading(false);
			}
		};

		loadTimeline();
	}, [id]);

	if (loading) {
		return (
			<div className="flex items-center justify-center h-96">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<button
				onClick={() => navigate(`/system/patients/${id}`)}
				className="text-blue-600 hover:text-blue-800 font-semibold"
			>
				← Quay lại hồ sơ / Back to profile
			</button>

			<div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
				<h1 className="text-3xl font-bold text-slate-900">
					Timeline bệnh nhân / Patient timeline
				</h1>
				<p className="text-slate-500 mt-2">
					{patient?.fullName} • {patient?.patientCode}
				</p>
			</div>

			{error && (
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
					{error}
				</div>
			)}

			<div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
				<h2 className="text-lg font-bold text-slate-900 mb-4">
					Lần khám và đánh giá / Visits & assessments
				</h2>
				{submissions.length === 0 ? (
					<p className="text-slate-500">Chưa có dữ liệu đánh giá.</p>
				) : (
					<div className="space-y-6">
						{submissions.map((sub) => (
							<div
								key={sub.submissionId}
								className="border border-slate-100 rounded-2xl p-5"
							>
								<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
									<div>
										<p className="text-sm text-slate-500">
											Biểu mẫu / Form
										</p>
										<p className="text-lg font-semibold text-slate-900">
											{sub.formName}
										</p>
									</div>
									<div className="flex items-center gap-3">
										<span
											className={`px-3 py-1 rounded-full text-xs font-semibold ${
												sub.riskLevel === "HIGH"
													? "bg-red-50 text-red-700"
													: sub.riskLevel === "MEDIUM"
													? "bg-amber-50 text-amber-700"
													: "bg-emerald-50 text-emerald-700"
											}`}
										>
											{sub.riskLevel === "HIGH"
												? "Nguy cơ cao / High"
												: sub.riskLevel === "MEDIUM"
												? "Nguy cơ trung bình / Medium"
												: "Nguy cơ thấp / Low"}
										</span>
										<button
											type="button"
											onClick={() =>
												window.open(
													`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8081"}/api/submissions/${
														sub.submissionId
													}/export`,
													"_blank"
												)
											}
											className="text-emerald-600 font-semibold hover:underline"
										>
											Xuất Excel
										</button>
									</div>
								</div>

								<div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
									<div>
										<p className="text-slate-500">Điểm / Score</p>
										<p className="font-semibold text-slate-900">
											{sub.totalScore ?? "-"}
										</p>
									</div>
									<div>
										<p className="text-slate-500">Ghi chú</p>
										<p className="font-semibold text-slate-900">
											{sub.notes || "-"}
										</p>
									</div>
									<div>
										<p className="text-slate-500">Trạng thái</p>
										<p className="font-semibold text-slate-900">
											{sub.status || "-"}
										</p>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default PatientTimeline;
