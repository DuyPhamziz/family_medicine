/**
 * AnalyticsDashboard.jsx
 * Admin analytics dashboard showing statistics and health metrics
 */

import { BarChart3, TrendingUp, RefreshCw } from 'lucide-react';
import useAnalytics from '../../../hooks/analytics/useAnalytics';
import TimeRangeSelector from '../../../components/analytics/TimeRangeSelector';
import DiseaseStatsCard from '../../../components/analytics/DiseaseStatsCard';
import CompletionStatsCard from '../../../components/analytics/CompletionStatsCard';
import PatientMetricsCard from '../../../components/analytics/PatientMetricsCard';

export const AnalyticsDashboard = () => {
  const {
    diseaseStats,
    diseaseLoading,
    completionStats,
    completionLoading,
    patientMetrics,
    patientLoading,
    timeRange,
    setTimeRange,
    isLoading
  } = useAnalytics();

  const handleRefresh = () => {
    // Trigger refresh by changing timeRange and back
    // This will re-fetch all analytics
    const current = timeRange;
    setTimeRange(current === 'month' ? 'week' : 'month');
    setTimeout(() => {
      setTimeRange(current);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                <BarChart3 className="text-white" size={32} />
              </div>
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Tổng hợp thống kê hoạt động hệ thống</p>
          </div>

          <div className="flex items-center gap-3">
            <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Làm mới dữ liệu"
            >
              <RefreshCw size={20} className={`text-blue-600 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Key metrics row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <DiseaseStatsCard 
            diseaseStats={diseaseStats} 
            isLoading={diseaseLoading}
          />
          
          <CompletionStatsCard 
            completionStats={completionStats}
            isLoading={completionLoading}
          />
          
          <PatientMetricsCard 
            patientMetrics={patientMetrics}
            isLoading={patientLoading}
          />
        </div>

        {/* Additional insights */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="text-green-600" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">Insights</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Insight 1: Disease prevalence */}
            <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200">
              <h3 className="font-semibold text-gray-900 mb-2">🏥 Bệnh Phổ Biến Nhất</h3>
              {diseaseStats.length > 0 ? (
                <p className="text-gray-700">
                  <span className="font-bold ">{diseaseStats[0].disease}</span> có{' '}
                  <span className="font-bold text-orange-600">{diseaseStats[0].count}</span> ca được ghi nhận
                </p>
              ) : (
                <p className="text-gray-600">Chưa có dữ liệu</p>
              )}
            </div>

            {/* Insight 2: Completion rate insight */}
            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">📋 Tỷ Lệ Hoàn Thành</h3>
              {completionStats ? (
                <p className="text-gray-700">
                  Người dùng đang hoàn thành trung bình{' '}
                  <span className="font-bold text-blue-600">{Math.round(completionStats.averageCompletion)}%</span> form
                </p>
              ) : (
                <p className="text-gray-600">Chưa có dữ liệu</p>
              )}
            </div>

            {/* Insight 3: Patient retention */}
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-gray-900 mb-2">👥 Bệnh Nhân Tái Khám</h3>
              {patientMetrics && patientMetrics.totalPatients > 0 ? (
                <p className="text-gray-700">
                  <span className="font-bold text-green-600">{patientMetrics.returningPatients}</span> bệnh nhân tái khám ({' '}
                  {Math.round((patientMetrics.returningPatients / patientMetrics.totalPatients) * 100)}%)
                </p>
              ) : (
                <p className="text-gray-600">Chưa có dữ liệu</p>
              )}
            </div>

            {/* Insight 4: Patient demographics */}
            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-gray-900 mb-2">📊 Bệnh Nhân Mới</h3>
              {patientMetrics && patientMetrics.totalPatients > 0 ? (
                <p className="text-gray-700">
                  <span className="font-bold text-purple-600">{patientMetrics.newPatients}</span> bệnh nhân mới trong kỳ ({' '}
                  {Math.round((patientMetrics.newPatients / patientMetrics.totalPatients) * 100)}%)
                </p>
              ) : (
                <p className="text-gray-600">Chưa có dữ liệu</p>
              )}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
          <p className="text-blue-900">
            <span className="font-semibold">💡 Ghi chú:</span> Các thống kê được cập nhật tự động dựa trên dữ liệu submission và medical history được ghi nhận trong hệ thống. 
            Chọn khoảng thời gian khác để so sánh xu hướng.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
