import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../service/api";
import Pagination from "../../../components/common/Pagination";

const PatientList = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

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

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const matchesQuery = query
        ? `${patient.fullName} ${patient.patientCode} ${patient.phoneNumber || ""}`
            .toLowerCase()
            .includes(query.toLowerCase())
        : true;
      const matchesGender =
        genderFilter === "all" ? true : patient.gender === genderFilter;
      const matchesStatus =
        statusFilter === "all" ? true : patient.status === statusFilter;
      return matchesQuery && matchesGender && matchesStatus;
    });
  }, [patients, query, genderFilter, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [query, genderFilter, statusFilter, patients.length]);

  const pagedPatients = filteredPatients.slice((page - 1) * pageSize, page * pageSize);

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
        <div>
          <h1 className="text-2xl font-bold">Hồ sơ bệnh nhân / Patients</h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý hồ sơ, theo dõi bệnh mạn và lịch tái khám.
          </p>
        </div>
        <button
          onClick={() => navigate("/system/patients/new")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          ➕ Thêm bệnh nhân
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên, mã, số điện thoại..."
            className="px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả giới tính</option>
            <option value="MALE">Nam</option>
            <option value="FEMALE">Nữ</option>
            <option value="OTHER">Khác</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang theo dõi</option>
            <option value="INACTIVE">Tạm ngưng</option>
            <option value="ARCHIVED">Lưu trữ</option>
          </select>
        </div>
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
            {filteredPatients.length > 0 ? (
              pagedPatients.map((p) => (
                <tr key={p.patientId} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{p.patientCode}</td>
                  <td className="p-3">{p.fullName}</td>
                  <td className="p-3">{p.dateOfBirth}</td>
                  <td className="p-3">
                    {p.gender === "MALE" ? "👨 Nam" : p.gender === "FEMALE" ? "👩 Nữ" : "Khác"}
                  </td>
                  <td className="p-3 text-gray-600">{p.phoneNumber || p.email || "-"}</td>
                  <td className="p-3 text-right space-x-3">
                    <Link
                      to={`/system/patients/${p.patientId}`}
                      className="text-blue-600 hover:underline"
                    >
                      Hồ sơ
                    </Link>
                    <Link
                      to={`/system/patients/${p.patientId}/care-plan`}
                      className="text-emerald-600 hover:underline"
                    >
                      Care plan
                    </Link>
                    <Link
                      to={`/system/patients/${p.patientId}/timeline`}
                      className="text-slate-600 hover:underline"
                    >
                      Timeline
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

      <Pagination
        currentPage={page}
        pageSize={pageSize}
        totalItems={filteredPatients.length}
        onPageChange={setPage}
      />
    </div>
  );
};

export default PatientList;
