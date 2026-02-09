import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../service/api";

const PatientList = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const response = await api.get("/api/patients/doctor/list");
      setPatients(response.data);
    } catch (error) {
      console.error("Error loading patients:", error);
    } finally {
      setLoading(false);
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
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hồ sơ bệnh nhân</h1>
        <button
          onClick={() => navigate("/system/patients/new")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          ➕ Thêm bệnh nhân
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Mã BN</th>
              <th className="p-3">Tên</th>
              <th className="p-3">Ngày sinh</th>
              <th className="p-3">Giới tính</th>
              <th className="p-3">Liên hệ</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {patients.length > 0 ? (
              patients.map((p) => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{p.patientCode}</td>
                  <td className="p-3">{p.fullName}</td>
                  <td className="p-3">{p.dateOfBirth}</td>
                  <td className="p-3">
                    {p.gender === "MALE" ? "👨 Nam" : p.gender === "FEMALE" ? "👩 Nữ" : "Khác"}
                  </td>
                  <td className="p-3 text-gray-600">{p.phoneNumber || p.email || "-"}</td>
                  <td className="p-3 text-right">
                    <Link
                      to={`/system/patients/${p.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Xem →
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">
                  Chưa có bệnh nhân nào. <br />
                  <button
                    onClick={() => navigate("/system/patients/new")}
                    className="text-blue-600 hover:text-blue-800 font-semibold mt-2"
                  >
                    Thêm bệnh nhân đầu tiên →
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientList;
