import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../service/api";

const PatientForm = () => {
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post("/api/patients", formData);
      alert("Thêm bệnh nhân thành công!");
      navigate("/system/patients");
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi thêm bệnh nhân");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Thêm bệnh nhân mới / New patient</h1>
        <p className="text-gray-500 mt-2">
          Nhập thông tin cơ bản để tạo hồ sơ bệnh án.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-6"
      >
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Row 1: Code & Full Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã bệnh nhân / Patient code
            </label>
            <input
              type="text"
              name="patientCode"
              value={formData.patientCode}
              onChange={handleChange}
              placeholder="Bỏ trống để tự động tạo (YYYYMMDDXXXX)"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Hệ thống sẽ tự tạo nếu bạn bỏ trống.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Họ tên / Full name *
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Nhập họ tên"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Row 2: DOB & Gender */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày sinh / Date of birth *
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giới tính / Gender *
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="MALE">Nam / Male</option>
              <option value="FEMALE">Nữ / Female</option>
              <option value="OTHER">Khác / Other</option>
            </select>
          </div>
        </div>

        {/* Row 3: Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số điện thoại / Phone
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Nhập số điện thoại"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Nhập email"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Row 4: Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Địa chỉ / Address
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Nhập địa chỉ"
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* Row 5: Medical History */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tiền sử bệnh / Medical history
          </label>
          <textarea
            name="medicalHistory"
            value={formData.medicalHistory}
            onChange={handleChange}
            placeholder="Tiền sử bệnh tật, mổ cắt..."
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* Row 6: Current Medications */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thuốc đang dùng / Current medications
          </label>
          <textarea
            name="currentMedications"
            value={formData.currentMedications}
            onChange={handleChange}
            placeholder="Danh sách thuốc đang sử dụng..."
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* Row 7: Allergies */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dị ứng / Allergies
          </label>
          <textarea
            name="allergies"
            value={formData.allergies}
            onChange={handleChange}
            placeholder="Các dị ứng đã biết..."
            rows="2"
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* Row 8: Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ghi chú / Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Ghi chú thêm..."
            rows="2"
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => navigate("/system/patients")}
            className="px-6 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium"
          >
            Hủy / Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium disabled:opacity-50"
          >
            {loading ? "Đang lưu..." : "Lưu bệnh nhân / Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;
