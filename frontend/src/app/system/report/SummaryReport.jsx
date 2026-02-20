import React, { useEffect, useMemo, useState } from "react";
import api from "../../../service/api";

const SummaryReport = () => {
	const [patients, setPatients] = useState([]);
	const [forms, setForms] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			setError("");
			try {
				const [patientRes, formRes] = await Promise.allSettled([
					api.get("/api/patients/doctor/list"),
					api.get("/api/forms/admin/all"),
				]);

				if (patientRes.status === "fulfilled") {
					setPatients(patientRes.value.data || []);
				}

				if (formRes.status === "fulfilled") {
					setForms(formRes.value.data || []);
				}

				if (
					patientRes.status === "rejected" &&
					formRes.status === "rejected"
				) {
					  setError("Không thể tải dữ liệu thống kê. Vui lòng thử lại.");
				}
			} catch (err) {
				console.error("Summary report error:", err);
				setError("Không thể tải dữ liệu thống kê. Vui lòng thử lại.");
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, []);

	const categoryStats = useMemo(() => {
		if (!forms.length) return [];
		const counts = forms.reduce((acc, form) => {
			const key = form.category || "Khac";
			acc[key] = (acc[key] || 0) + 1;
			return acc;
		}, {});

		return Object.entries(counts)
			.map(([category, count]) => ({ category, count }))
			.sort((a, b) => b.count - a.count);
	}, [forms]);

	const totalSections = useMemo(() => {
		return forms.reduce(
			(total, form) => total + (form.sections?.length || 0),
			0
		);
	}, [forms]);

	if (loading) {
		return (
			<div className="flex items-center justify-center h-96">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-3xl font-bold text-slate-900">Thống kê tổng quan</h1>
				<p className="text-slate-500 mt-2">
					Tổng hợp dữ liệu hệ thống theo nhóm chỉ số quan trọng.
				</p>
			</div>

			{error && (
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
					{error}
				</div>
			)}

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
					  <p className="text-sm text-slate-500">Tổng bệnh nhân</p>
					<p className="text-3xl font-extrabold text-slate-900 mt-2">
						{patients.length}
					</p>
					<p className="text-xs text-slate-400 mt-2">
						Lấy từ danh sách bệnh nhân của bác sĩ.
					</p>
				</div>
				<div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
					  <p className="text-sm text-slate-500">Biểu mẫu đang hoạt động</p>
					<p className="text-3xl font-extrabold text-slate-900 mt-2">
						{forms.length}
					</p>
					<p className="text-xs text-slate-400 mt-2">
						Tổng số biểu mẫu trong hệ thống.
					</p>
				</div>
				<div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
					  <p className="text-sm text-slate-500">Tổng số nhóm câu hỏi</p>
					<p className="text-3xl font-extrabold text-slate-900 mt-2">
						{totalSections}
					</p>
					<p className="text-xs text-slate-400 mt-2">
						Tổng các section trong biểu mẫu.
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
					<h2 className="text-lg font-bold text-slate-900 mb-4">
						Phân bổ danh mục biểu mẫu
					</h2>
					{categoryStats.length === 0 ? (
						<p className="text-sm text-slate-500">
							  Chưa có dữ liệu danh mục.
						</p>
					) : (
						<div className="space-y-4">
							{categoryStats.map((item) => (
								<div key={item.category}>
									<div className="flex items-center justify-between text-sm font-semibold text-slate-600">
										<span>{item.category}</span>
										<span>{item.count}</span>
									</div>
									<div className="h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
										<div
											className="h-full bg-emerald-500"
											style={{
												width: `${Math.min(100, (item.count / forms.length) * 100)}%`,
											}}
										/>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				<div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
					<h2 className="text-lg font-bold text-slate-900 mb-4">
						Hoạt động gần đây
					</h2>
					<div className="space-y-4 text-sm text-slate-600">
						<div className="flex items-start gap-3">
							<span className="mt-1 w-2 h-2 rounded-full bg-emerald-500" />
							  Cập nhật danh mục biểu mẫu và chuẩn hóa thông số điểm số.
						</div>
						<div className="flex items-start gap-3">
							<span className="mt-1 w-2 h-2 rounded-full bg-amber-400" />
							  Kiểm tra tính đồng bộ giữa nhóm bệnh nhân và guideline.
						</div>
						<div className="flex items-start gap-3">
							<span className="mt-1 w-2 h-2 rounded-full bg-sky-400" />
							  Lên lịch báo cáo tổng hợp định kỳ hàng tháng.
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SummaryReport;
