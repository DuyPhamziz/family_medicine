import React from "react";
import { useAuth } from "../../../hooks/auth/useAuth";
import { ROLES } from "../../../constants/roles";
import StatCard from "../../../components/common/StatCard";

const Dashboard = () => {
  const { user } = useAuth();
  
  // Compute stats based on user role (no setState in effect)
  let stats = {
    totalPatients: 0,
    formsToday: 0,
    highRisk: 0,
    pending: 0,
  };
  
  if (user?.role === ROLES.DOCTOR) {
    stats = {
      totalPatients: 24,
      formsToday: 5,
      highRisk: 3,
      pending: 2,
    };
  } else if (user?.role === ROLES.ADMIN) {
    stats = {
      totalPatients: 248,
      formsToday: 45,
      highRisk: 12,
      pending: 8,
    };
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Xin chào, {user?.name || user?.fullName}!
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {user?.role === ROLES.DOCTOR
            ? "Quản lý bệnh nhân và nhập liệu chuẩn đoán"
            : "Giám sát hệ thống toàn bộ"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Tổng bệnh nhân"
          value={stats.totalPatients.toString()}
          color="text-blue-600"
          icon="👥"
        />
        <StatCard
          title="Biểu mẫu hôm nay"
          value={stats.formsToday.toString()}
          color="text-green-600"
          icon="📋"
        />
        <StatCard
          title="Nguy cơ cao"
          value={stats.highRisk.toString()}
          color="text-red-600"
          icon="⚠️"
        />
        <StatCard
          title="Chờ xử lý"
          value={stats.pending.toString()}
          color="text-orange-500"
          icon="🔔"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions for Doctor */}
        {user?.role === ROLES.DOCTOR && (
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Hành động nhanh
            </h2>
            <div className="space-y-3">
              <a
                href="/system/patients"
                className="block w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg hover:shadow-lg transition text-center font-medium"
              >
                ➕ Thêm bệnh nhân mới
              </a>
              <a
                href="/system/forms"
                className="block w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg hover:shadow-lg transition text-center font-medium"
              >
                📋 Nhập liệu biểu mẫu
              </a>
              <a
                href="/system/analysis"
                className="block w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:shadow-lg transition text-center font-medium"
              >
                📊 Xem kết quả
              </a>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className={`${user?.role === ROLES.DOCTOR ? "lg:col-span-2" : "lg:col-span-3"} bg-white rounded-xl shadow-sm border p-6`}>
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Hoạt động gần đây
          </h2>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">
                    Bệnh nhân {i === 1 ? "Nguyễn Văn A" : i === 2 ? "Trần Thị B" : "Lê Văn C"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {i === 1 ? "Cập nhật SCORE tiền đái" : i === 2 ? "Nhập huyết áp" : "Tải kết quả"}
                  </p>
                </div>
                <span className="text-xs text-gray-400">{i * 2}h trước</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
