import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../service/api";

const FormList = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [formsRes, patientsRes] = await Promise.all([
          api.get("/api/forms"),
          api.get("/api/patients/doctor/list"),
        ]);

        setForms(formsRes.data);
        setPatients(patientsRes.data);
      } catch (error) {
        console.error("Error loading data:", error);
        alert("Lỗi khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleStartForm = () => {
    if (!selectedForm || !selectedPatient) {
      alert("Vui lòng chọn biểu mẫu và bệnh nhân");
      return;
    }

    navigate(
      `/system/diagnostic-form/${selectedPatient}/${selectedForm}`
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Biểu mẫu chuẩn đoán</h1>
        <p className="text-gray-600 mt-2">
          Lựa chọn biểu mẫu và bệnh nhân để bắt đầu nhập liệu
        </p>
      </div>

      {/* Selection Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Forms Selection */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            📋 Chọn biểu mẫu
          </h2>
          <div className="space-y-3">
            {forms.map((form) => (
              <div
                key={form.formId}
                onClick={() => setSelectedForm(form.formId)}
                className={`p-4 rounded-lg cursor-pointer transition border-2 ${
                  selectedForm === form.formId
                    ? "bg-blue-50 border-blue-500"
                    : "bg-gray-50 border-gray-200 hover:border-gray-300"
                }`}
              >
                <p className="font-semibold text-gray-800">{form.formName}</p>
                <p className="text-sm text-gray-600">{form.description}</p>
                {form.category && (
                  <p className="text-xs text-gray-500 mt-1">
                    🏷️ {form.category}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Patients Selection */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            👥 Chọn bệnh nhân
          </h2>
          <div className="space-y-3">
            {patients.length > 0 ? (
              patients.map((patient) => (
                <div
                  key={patient.patientId}
                  onClick={() => setSelectedPatient(patient.patientId)}
                  className={`p-4 rounded-lg cursor-pointer transition border-2 ${
                    selectedPatient === patient.patientId
                      ? "bg-green-50 border-green-500"
                      : "bg-gray-50 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="font-semibold text-gray-800">
                    {patient.fullName}
                  </p>
                  <p className="text-sm text-gray-600">
                    📅 {patient.dateOfBirth} • {patient.gender === "MALE" ? "👨" : "👩"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Mã: {patient.patientCode}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Chưa có bệnh nhân nào</p>
                <button
                  onClick={() => navigate("/system/patients/new")}
                  className="mt-3 text-blue-600 hover:text-blue-800 font-semibold"
                >
                  ➕ Thêm bệnh nhân mới
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-8 text-center">
        <button
          onClick={handleStartForm}
          disabled={!selectedForm || !selectedPatient}
          className="w-full md:w-auto px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-lg"
        >
          🚀 Bắt đầu nhập liệu
        </button>
      </div>

      {/* Recent Submissions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          📊 Kết quả gần đây
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-700 font-semibold">
                  Bệnh nhân
                </th>
                <th className="px-4 py-3 text-left text-gray-700 font-semibold">
                  Biểu mẫu
                </th>
                <th className="px-4 py-3 text-left text-gray-700 font-semibold">
                  Điểm số
                </th>
                <th className="px-4 py-3 text-left text-gray-700 font-semibold">
                  Mức độ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[1, 2, 3].map((i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-800">
                    {i === 1 ? "Nguyễn Văn A" : i === 2 ? "Trần Thị B" : "Lê Văn C"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    SCORE Tiền đái tháo đường
                  </td>
                  <td className="px-4 py-3 text-gray-800 font-semibold">
                    {i * 10}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        i === 1
                          ? "bg-red-100 text-red-800"
                          : i === 2
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {i === 1 ? "CAO" : i === 2 ? "TRUNG BÌNH" : "THẤP"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FormList;
