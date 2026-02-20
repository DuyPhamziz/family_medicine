const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Quản trị hệ thống</h1>
        <p className="text-slate-500 mt-2">
          Quản lý chất lượng lâm sàng, guideline và hạ tầng dữ liệu.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Người dùng hoạt động", value: "128" },
          { label: "Biểu mẫu lâm sàng", value: "24" },
          { label: "Guideline áp dụng", value: "12" },
          { label: "Cảnh báo chất lượng", value: "6" },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Chất lượng dữ liệu / Data quality
          </h2>
          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Hồ sơ đầy đủ</span>
              <span className="font-semibold text-emerald-600">92%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Đồng bộ ICD-10</span>
              <span className="font-semibold text-slate-900">87%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Kê đơn điện tử</span>
              <span className="font-semibold text-slate-900">78%</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Tích hợp / Integration status
          </h2>
          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>HL7/FHIR Gateway</span>
              <span className="font-semibold text-emerald-600">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span>ePrescription</span>
              <span className="font-semibold text-amber-600">Partial</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Lab integration</span>
              <span className="font-semibold text-slate-900">Pending</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
