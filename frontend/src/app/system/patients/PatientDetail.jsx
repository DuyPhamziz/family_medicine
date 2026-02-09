import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../service/api";

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPatientData = async () => {
      try {
        const [patientRes, submissionsRes] = await Promise.all([
          api.get(`/api/patients/${id}`),
          api.get(`/api/forms/patient/${id}/submissions`),
        ]);

        setPatient(patientRes.data);
        setSubmissions(submissionsRes.data);
      } catch (error) {
        console.error("Error loading patient data:", error);
        alert("Lỗi khi tải dữ liệu bệnh nhân");
      } finally {
        setLoading(false);
      }
    };
    
    loadPatientData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Không tìm thấy bệnh nhân</p>
        <button
          onClick={() => navigate("/system/patients")}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          ← Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/system/patients")}
        className="text-blue-600 hover:text-blue-800 font-medium"
      >
        ← Quay lại danh sách
      </button>

      {/* Patient Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{patient.fullName}</h1>
            <p className="text-gray-600 mt-2">Mã bệnh nhân: <span className="font-semibold">{patient.patientCode}</span></p>
          </div>
          <button
            onClick={() => navigate(`/system/patients/edit/${patient.id}`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ✏️ Chỉnh sửa
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Thông tin cá nhân</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Ngày sinh</p>
                <p className="font-medium">{patient.dateOfBirth}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Giới tính</p>
                <p className="font-medium">
                  {patient.gender === "MALE" ? "👨 Nam" : patient.gender === "FEMALE" ? "👩 Nữ" : "Khác"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Số điện thoại</p>
                <p className="font-medium">{patient.phoneNumber || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{patient.email || "-"}</p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Thông tin y tế</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Địa chỉ</p>
                <p className="font-medium">{patient.address || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tiền sử bệnh</p>
                <p className="font-medium text-sm">{patient.medicalHistory || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Thuốc đang dùng</p>
                <p className="font-medium text-sm">{patient.currentMedications || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Dị ứng</p>
                <p className="font-medium text-sm">{patient.allergies || "-"}</p>
              </div>
            </div>
          </div>
        </div>

        {patient.notes && (
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-gray-600">Ghi chú</p>
            <p className="font-medium">{patient.notes}</p>
          </div>
        )}
      </div>

      {/* Submissions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Lịch sử chuẩn đoán</h2>
        {submissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Biểu mẫu</th>
                  <th className="px-4 py-3 text-left font-semibold">Điểm</th>
                  <th className="px-4 py-3 text-left font-semibold">Mức độ</th>
                  <th className="px-4 py-3 text-left font-semibold">Ngày</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{sub.formName}</td>
                    <td className="px-4 py-3 font-medium">{sub.totalScore}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          sub.riskLevel === "HIGH"
                            ? "bg-red-100 text-red-800"
                            : sub.riskLevel === "MEDIUM"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {sub.riskLevel === "HIGH"
                          ? "🔴 CAO"
                          : sub.riskLevel === "MEDIUM"
                          ? "🟡 TRUNG BÌNH"
                          : "🟢 THẤP"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">-</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Chưa có kết quả chuẩn đoán nào</p>
            <button
              onClick={() => navigate("/system/forms")}
              className="mt-3 text-blue-600 hover:text-blue-800 font-semibold"
            >
              Thêm kết quả chuẩn đoán →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDetail;
