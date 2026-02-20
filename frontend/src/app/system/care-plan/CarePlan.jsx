import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const buildStorageKey = (patientId) => `care_plan_${patientId}`;

const CarePlan = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [plan, setPlan] = useState(() => {
		const cached = localStorage.getItem(buildStorageKey(id));
		if (cached) {
			try {
				return JSON.parse(cached);
			} catch {
				return null;
			}
		}
		return null;
	});

	const [formData, setFormData] = useState(
		plan || {
			primaryDiagnosis: "Tăng huyết áp nguyên phát / Essential hypertension",
			chronicConditions: "ĐTĐ type 2, Rối loạn lipid máu",
			goals: "Huyết áp < 130/80, HbA1c < 7.0%",
			interventions: "Điều chỉnh thuốc, giáo dục dinh dưỡng, tăng vận động",
			monitoring: "Theo dõi huyết áp mỗi tuần, tái khám sau 4 tuần",
			careGaps: "Chưa có xét nghiệm lipid 3 tháng gần đây",
			responsibleTeam: "BS gia đình, Điều dưỡng quản lý ca",
			notes: "Ưu tiên kiểm soát nguy cơ tim mạch 10 năm",
		}
	);

	const updatedAt = useMemo(() => {
		const cached = localStorage.getItem(`${buildStorageKey(id)}_updatedAt`);
		return cached || "Chưa lưu";
	}, [id, plan]);

	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSave = () => {
		localStorage.setItem(buildStorageKey(id), JSON.stringify(formData));
		localStorage.setItem(`${buildStorageKey(id)}_updatedAt`, new Date().toLocaleString("vi-VN"));
		setPlan(formData);
		alert("Đã lưu care plan (local). Vui lòng tích hợp API để đồng bộ server.");
	};

	return (
		<div className="space-y-6">
			<button
				onClick={() => navigate(`/system/patients/${id}`)}
				className="text-blue-600 hover:text-blue-800 font-semibold"
			>
				← Quay lại hồ sơ / Back to profile
			</button>

			<div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
				<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
					<div>
						<h1 className="text-3xl font-bold text-slate-900">
							Kế hoạch chăm sóc / Chronic care plan
						</h1>
						<p className="text-slate-500 mt-2">
							Quản lý bệnh mạn, theo dõi mục tiêu và lộ trình can thiệp.
						</p>
					</div>
					<div className="text-sm text-slate-500">
						Cập nhật lần cuối: <span className="font-semibold">{updatedAt}</span>
					</div>
				</div>
			</div>

			<div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm font-semibold text-slate-600 mb-2">
							Chẩn đoán chính (ICD-10) / Primary diagnosis
						</label>
						<input
							type="text"
							name="primaryDiagnosis"
							value={formData.primaryDiagnosis}
							onChange={handleChange}
							className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
						/>
					</div>
					<div>
						<label className="block text-sm font-semibold text-slate-600 mb-2">
							Bệnh mạn tính kèm theo / Chronic conditions
						</label>
						<input
							type="text"
							name="chronicConditions"
							value={formData.chronicConditions}
							onChange={handleChange}
							className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
						/>
					</div>
				</div>

				<div>
					<label className="block text-sm font-semibold text-slate-600 mb-2">
						Mục tiêu điều trị / Clinical goals
					</label>
					<textarea
						name="goals"
						value={formData.goals}
						onChange={handleChange}
						rows="2"
						className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
					/>
				</div>

				<div>
					<label className="block text-sm font-semibold text-slate-600 mb-2">
						Can thiệp / Interventions
					</label>
					<textarea
						name="interventions"
						value={formData.interventions}
						onChange={handleChange}
						rows="3"
						className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
					/>
				</div>

				<div>
					<label className="block text-sm font-semibold text-slate-600 mb-2">
						Theo dõi / Monitoring schedule
					</label>
					<textarea
						name="monitoring"
						value={formData.monitoring}
						onChange={handleChange}
						rows="2"
						className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
					/>
				</div>

				<div>
					<label className="block text-sm font-semibold text-slate-600 mb-2">
						Care gaps / Khoảng trống chăm sóc
					</label>
					<textarea
						name="careGaps"
						value={formData.careGaps}
						onChange={handleChange}
						rows="2"
						className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
					/>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm font-semibold text-slate-600 mb-2">
							Đội phụ trách / Care team
						</label>
						<input
							type="text"
							name="responsibleTeam"
							value={formData.responsibleTeam}
							onChange={handleChange}
							className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
						/>
					</div>
					<div>
						<label className="block text-sm font-semibold text-slate-600 mb-2">
							Ghi chú / Notes
						</label>
						<input
							type="text"
							name="notes"
							value={formData.notes}
							onChange={handleChange}
							className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
						/>
					</div>
				</div>

				<div className="flex justify-end">
					<button
						type="button"
						onClick={handleSave}
						className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold"
					>
						Lưu care plan / Save
					</button>
				</div>
			</div>
		</div>
	);
};

export default CarePlan;
