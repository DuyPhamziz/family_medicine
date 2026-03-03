/**
 * PatientMetricsCard.jsx
 * Card displaying patient metrics and statistics
 */

import { Users, User, Users2, Loader } from 'lucide-react';

export const PatientMetricsCard = ({ patientMetrics, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader className="text-blue-500 animate-spin" size={32} />
        </div>
      </div>
    );
  }

  const {
    totalPatients = 0,
    newPatients = 0,
    returningPatients = 0,
    averageAge = 0,
    genderDistribution = {}
  } = patientMetrics || {};

  const male = genderDistribution.male || 0;
  const female = genderDistribution.female || 0;
  const other = genderDistribution.other || 0;
  const totalWithGender = male + female + other || 1;

  const malePercent = Math.round((male / totalWithGender) * 100);
  const femalePercent = Math.round((female / totalWithGender) * 100);
  const otherPercent = Math.round((other / totalWithGender) * 100);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-pink-50 to-rose-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Users2 className="text-pink-600" size={24} />
            Thống Kê Bệnh Nhân
          </h3>
          <Users className="text-blue-500" size={20} />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {totalPatients === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Chưa có dữ liệu bệnh nhân</p>
          </div>
        ) : (
          <>
            {/* Main metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-center">
                <p className="text-3xl font-bold text-blue-600">{totalPatients}</p>
                <p className="text-sm text-blue-700 font-medium mt-1">Tổng bệnh nhân</p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-100 text-center">
                <p className="text-3xl font-bold text-green-600">{newPatients}</p>
                <p className="text-sm text-green-700 font-medium mt-1">Bệnh nhân mới</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-100 text-center">
                <p className="text-3xl font-bold text-purple-600">{returningPatients}</p>
                <p className="text-sm text-purple-700 font-medium mt-1">Tái khám</p>
              </div>
            </div>

            {/* Average age */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">Tuổi trung bình</span>
                <span className="text-2xl font-bold text-indigo-600">{Math.round(averageAge)} tuổi</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  style={{ width: `${Math.min((averageAge / 100) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Gender distribution */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">Phân bố giới tính</h4>

              {/* Female */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 flex items-center gap-2">
                    <span className="text-lg">👩</span> Nữ
                  </span>
                  <span className="text-sm font-semibold text-gray-700">{female} ({femalePercent}%)</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"
                    style={{ width: `${femalePercent}%` }}
                  />
                </div>
              </div>

              {/* Male */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 flex items-center gap-2">
                    <span className="text-lg">👨</span> Nam
                  </span>
                  <span className="text-sm font-semibold text-gray-700">{male} ({malePercent}%)</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                    style={{ width: `${malePercent}%` }}
                  />
                </div>
              </div>

              {/* Other */}
              {other > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 flex items-center gap-2">
                      <span className="text-lg">🔷</span> Khác
                    </span>
                    <span className="text-sm font-semibold text-gray-700">{other} ({otherPercent}%)</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-gray-500 to-slate-500 rounded-full"
                      style={{ width: `${otherPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Summary stats */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Tỷ lệ bệnh nhân mới:</span> {totalPatients > 0 ? Math.round((newPatients / totalPatients) * 100) : 0}%
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Tỷ lệ tái khám:</span> {totalPatients > 0 ? Math.round((returningPatients / totalPatients) * 100) : 0}%
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PatientMetricsCard;
