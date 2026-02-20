import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../service/api";

const PatientEdit = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		patientCode: "",
		fullName: "",
		dateOfBirth: "",
		gender: "MALE",
		phoneNumber: "",
		email: "",
		address: "",
		medicalHistory: "",
		currentMedications: "",
		allergies: "",
		notes: "",
	});
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		const loadPatient = async () => {
			setLoading(true);
			setError("");
			try {
				const response = await api.get(`/api/patients/${id}`);
				const patient = response.data;
				setFormData({
					patientCode: patient.patientCode || "",
					fullName: patient.fullName || "",
					dateOfBirth: patient.dateOfBirth || "",
					gender: patient.gender || "MALE",
					phoneNumber: patient.phoneNumber || "",
					email: patient.email || "",
					address: patient.address || "",
					medicalHistory: patient.medicalHistory || "",
					currentMedications: patient.currentMedications || "",
					allergies: patient.allergies || "",
					notes: patient.notes || "",
				});
			} catch (err) {
				console.error("Error loading patient:", err);
				setError("Không thể tải hồ sơ bệnh nhân.");
			} finally {
				setLoading(false);
			}
		};

		loadPatient();
	}, [id]);

	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setSaving(true);
		setError("");
		try {
			await api.put(`/api/patients/${id}`, formData);
			navigate(`/system/patients/${id}`);
		} catch (err) {
			console.error("Error updating patient:", err);
			setError(err.response?.data?.message || "Không thể cập nhật bệnh nhân.");
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-96">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-slate-900">
					Chỉnh sửa hồ sơ / Edit patient profile
				</h1>
				<p className="text-slate-500 mt-2">
					Cập nhật thông tin bệnh nhân để đồng bộ hồ sơ liên tục.
				</p>
			</div>

			<form
				onSubmit={handleSubmit}
				className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-6"
			>
				{error && (
					<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
						{error}
					</div>
				)}

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-semibold text-slate-600 mb-2">
							Mã bệnh nhân / Patient code
						</label>
						<input
							type="text"
							name="patientCode"
							value={formData.patientCode}
							onChange={handleChange}
							className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
						/>
					</div>
					<div>
						<label className="block text-sm font-semibold text-slate-600 mb-2">
							Họ tên / Full name
						</label>
						<input
							type="text"
							name="fullName"
							value={formData.fullName}
							onChange={handleChange}
							required
							className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-semibold text-slate-600 mb-2">
							Ngày sinh / Date of birth
						</label>
						<input
							type="date"
							name="dateOfBirth"
							value={formData.dateOfBirth}
							onChange={handleChange}
							required
							className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
						/>
					</div>
					<div>
						<label className="block text-sm font-semibold text-slate-600 mb-2">
							Giới tính / Gender
						</label>
						<select
							name="gender"
							value={formData.gender}
							onChange={handleChange}
							className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
						>
							<option value="MALE">Nam / Male</option>
							<option value="FEMALE">Nữ / Female</option>
							<option value="OTHER">Khác / Other</option>
						</select>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-semibold text-slate-600 mb-2">
							Số điện thoại / Phone
						</label>
						<input
							type="tel"
							name="phoneNumber"
							value={formData.phoneNumber}
							onChange={handleChange}
							className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
						/>
					</div>
					<div>
						<label className="block text-sm font-semibold text-slate-600 mb-2">
							Email
						</label>
						<input
							type="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
						/>
					</div>
				</div>

				<div>
					<label className="block text-sm font-semibold text-slate-600 mb-2">
						Địa chỉ / Address
					</label>
					<input
						type="text"
						name="address"
						value={formData.address}
						onChange={handleChange}
						className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
					/>
				</div>

				<div>
					<label className="block text-sm font-semibold text-slate-600 mb-2">
						Tiền sử bệnh / Medical history
					</label>
					<textarea
						name="medicalHistory"
						value={formData.medicalHistory}
						onChange={handleChange}
						rows="3"
						className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
					/>
				</div>

				<div>
					<label className="block text-sm font-semibold text-slate-600 mb-2">
						Thuốc đang dùng / Current medications
					</label>
					<textarea
						name="currentMedications"
						value={formData.currentMedications}
						onChange={handleChange}
						rows="3"
						className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
					/>
				</div>

				<div>
					<label className="block text-sm font-semibold text-slate-600 mb-2">
						Dị ứng / Allergies
					</label>
					<textarea
						name="allergies"
						value={formData.allergies}
						onChange={handleChange}
						rows="2"
						className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
					/>
				</div>

				<div>
					<label className="block text-sm font-semibold text-slate-600 mb-2">
						Ghi chú / Notes
					</label>
					<textarea
						name="notes"
						value={formData.notes}
						onChange={handleChange}
						rows="2"
						className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
					/>
				</div>

				<div className="flex flex-wrap gap-4 justify-end">
					<button
						type="button"
						onClick={() => navigate(`/system/patients/${id}`)}
						className="px-6 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-semibold"
					>
						Quay lại / Back
					</button>
					<button
						type="submit"
						disabled={saving}
						className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold disabled:opacity-50"
					>
						{saving ? "Đang lưu..." : "Lưu thay đổi / Save"}
					</button>
				</div>
			</form>
		</div>
	);
};

export default PatientEdit;
