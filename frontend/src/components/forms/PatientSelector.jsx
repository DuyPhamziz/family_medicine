import React, { useEffect, useMemo, useState, useRef } from "react";
import Pagination from "../common/Pagination";

const PatientSelector = ({ patients, selectedPatientId, onSelect, onAddPatient }) => {
  const [query, setQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 6;
  
  // Track previous filter state to detect changes
  const prevFilterRef = useRef();

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

  // Reset page when filters change, detected via ref
  useEffect(() => {
    const currentFilter = `${query}|${genderFilter}|${statusFilter}|${patients.length}`;
    if (prevFilterRef.current && prevFilterRef.current !== currentFilter) {
      setPage(1);
    }
    prevFilterRef.current = currentFilter;
  }, [query, genderFilter, statusFilter, patients.length]);

  const pagedPatients = filteredPatients.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Chọn bệnh nhân / Patient
        </h2>
        <span className="text-xs text-slate-500">
          {filteredPatients.length} bệnh nhân
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm theo tên, mã, số điện thoại..."
          className="px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <select
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">Tất cả giới tính</option>
          <option value="MALE">Nam</option>
          <option value="FEMALE">Nữ</option>
          <option value="OTHER">Khác</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang theo dõi</option>
          <option value="INACTIVE">Tạm ngưng</option>
          <option value="ARCHIVED">Lưu trữ</option>
        </select>
      </div>

      <div className="space-y-3">
        {filteredPatients.length > 0 ? (
          pagedPatients.map((patient) => (
            <div
              key={patient.patientId}
              onClick={() => onSelect(patient.patientId)}
              className={`p-4 rounded-xl cursor-pointer transition border ${
                selectedPatientId === patient.patientId
                  ? "bg-emerald-50 border-emerald-500"
                  : "bg-slate-50 border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{patient.fullName}</p>
                  <p className="text-sm text-gray-600">
                    {patient.dateOfBirth} - {patient.gender === "MALE" ? "Nam" : patient.gender === "FEMALE" ? "Nữ" : "Khác"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Mã: {patient.patientCode}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-slate-200 text-slate-700">
                  {patient.status === "ACTIVE" ? "Đang theo dõi" : patient.status === "INACTIVE" ? "Tạm ngưng" : "Lưu trữ"}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 bg-slate-50 rounded-lg">
            <p className="text-gray-500">Chưa có bệnh nhân nào</p>
            <button
              onClick={onAddPatient}
              className="mt-3 text-emerald-600 hover:text-emerald-800 font-semibold"
            >
              Thêm bệnh nhân mới
            </button>
          </div>
        )}
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

export default PatientSelector;
