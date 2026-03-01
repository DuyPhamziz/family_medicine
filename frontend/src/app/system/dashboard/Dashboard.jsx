import React from "react";
import { useAuth } from "../../../hooks/auth/useAuth";
import { useDoctorStats } from "../../../hooks/data/useDoctorData";
import { ROLES } from "../../../constants/roles";
import StatCard from "../../../components/common/StatCard";

const Dashboard = () => {
  const { user } = useAuth();
  
  // Use React Query hook for stats
  const { data: statsData, isLoading } = useDoctorStats();

  const stats = {
    totalPatients: statsData?.uniquePatients || 0,
    formsToday: statsData?.submissionsToday || 0,
    highRisk: statsData?.highRiskSubmissions || 0,
    pending: statsData?.pendingSubmissions || 0,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Xin chào, {user?.name || user?.fullName}!
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {user?.role === ROLES.DOCTOR
            ? "Chăm sóc bệnh mạn liên tục / Long-term chronic care management"
            : "Giám sát hệ thống & chất lượng / System & quality oversight"}
        </p>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Tổng bệnh nhân / Total patients"
            value={stats.totalPatients.toString()}
            color="text-blue-600"
            icon="👥"
          />
          <StatCard
            title="Biểu mẫu hôm nay / Forms today"
            value={stats.formsToday.toString()}
            color="text-green-600"
            icon="📋"
          />
          <StatCard
            title="Nguy cơ cao / High risk"
            value={stats.highRisk.toString()}
            color="text-red-600"
            icon="⚠️"
          />
          <StatCard
            title="Chờ xử lý / Pending"
            value={stats.pending.toString()}
            color="text-orange-500"
            icon="🔔"
          />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {user?.role === ROLES.DOCTOR && (
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Hành động nhanh / Quick actions
            </h2>
            <div className="space-y-3">
              <a
                href="/system/patients"
                className="block w-full bg-slate-900 text-white py-3 px-4 rounded-xl hover:shadow-lg transition text-center font-semibold"
              >
                ➕ Thêm bệnh nhân mới
              </a>
              <a
                href="/system/forms"
                className="block w-full bg-emerald-600 text-white py-3 px-4 rounded-xl hover:shadow-lg transition text-center font-semibold"
              >
                📋 Nhập liệu biểu mẫu
              </a>
              <a
                href="/system/analysis"
                className="block w-full bg-indigo-600 text-white py-3 px-4 rounded-xl hover:shadow-lg transition text-center font-semibold"
              >
                📊 Theo dõi nguy cơ
              </a>
              <a
                href="/system/report/summary"
                className="block w-full bg-amber-500 text-white py-3 px-4 rounded-xl hover:shadow-lg transition text-center font-semibold"
              >
                📈 Thống kê chuyên khoa
              </a>
            </div>
          </div>
        )}

        <div className={`${user?.role === ROLES.DOCTOR ? "lg:col-span-2" : "lg:col-span-3"} bg-white rounded-2xl shadow-sm border border-slate-100 p-6`}>
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Care gaps & ưu tiên / Clinical priorities
          </h2>
          <div className="space-y-4">
            {[
              {
                title: "Tăng huyết áp chưa kiểm soát",
                desc: "24 hồ sơ vượt ngưỡng > 140/90",
                tag: "Ưu tiên cao",
                color: "bg-red-50 text-red-700",
              },
              {
                title: "Chưa có xét nghiệm HbA1c",
                desc: "18 bệnh nhân chưa xét nghiệm trong 6 tháng",
                tag: "Theo dõi",
                color: "bg-amber-50 text-amber-700",
              },
              {
                title: "Lipid máu cần cập nhật",
                desc: "10 hồ sơ cần chỉ định xét nghiệm lipid",
                tag: "Nhắc lịch",
                color: "bg-emerald-50 text-emerald-700",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
              >
                <div>
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.color}`}>
                  {item.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Chronic program / Quản lý bệnh mạn
          </h2>
          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>BN tăng huyết áp</span>
              <span className="font-semibold text-slate-900">128</span>
            </div>
            <div className="flex items-center justify-between">
              <span>BN đái tháo đường</span>
              <span className="font-semibold text-slate-900">96</span>
            </div>
            <div className="flex items-center justify-between">
              <span>BN tim mạch nguy cơ cao</span>
              <span className="font-semibold text-slate-900">42</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Follow-up pipeline / Lịch hẹn
          </h2>
          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Tuần này</span>
              <span className="font-semibold text-slate-900">34 lịch</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Quá hạn</span>
              <span className="font-semibold text-red-600">6 lịch</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Ưu tiên tái khám</span>
              <span className="font-semibold text-amber-600">9 lịch</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Compliance / Tuân thủ
          </h2>
          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Tái khám đúng hẹn</span>
              <span className="font-semibold text-emerald-600">78%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Tuân thủ thuốc</span>
              <span className="font-semibold text-slate-900">82%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Hoàn tất xét nghiệm</span>
              <span className="font-semibold text-slate-900">70%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
