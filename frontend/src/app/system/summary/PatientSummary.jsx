import React from "react";

const PatientSummary = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Tóm tắt hồ sơ / Patient summary
        </h1>
        <p className="text-slate-500 mt-2">
          Tổng hợp thông tin lâm sàng, chronic care và chỉ số theo guideline.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-slate-100 rounded-xl p-4">
            <p className="text-xs uppercase tracking-widest text-slate-400">Clinical</p>
            <p className="text-lg font-semibold text-slate-900 mt-2">Hồ sơ tổng quan</p>
            <p className="text-sm text-slate-500 mt-2">Chẩn đoán, thuốc, chỉ số</p>
          </div>
          <div className="border border-slate-100 rounded-xl p-4">
            <p className="text-xs uppercase tracking-widest text-slate-400">Care plan</p>
            <p className="text-lg font-semibold text-slate-900 mt-2">Mục tiêu điều trị</p>
            <p className="text-sm text-slate-500 mt-2">Theo dõi và can thiệp</p>
          </div>
          <div className="border border-slate-100 rounded-xl p-4">
            <p className="text-xs uppercase tracking-widest text-slate-400">Quality</p>
            <p className="text-lg font-semibold text-slate-900 mt-2">Guideline gap</p>
            <p className="text-sm text-slate-500 mt-2">Các xét nghiệm còn thiếu</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 justify-end">
          <button className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-semibold">
            Xuất PDF
          </button>
          <button className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold">
            Xuất Excel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientSummary;
