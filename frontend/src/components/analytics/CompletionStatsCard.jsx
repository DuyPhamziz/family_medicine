/**
 * CompletionStatsCard.jsx
 * Card displaying form completion rate statistics
 */

import { CheckCircle, AlertCircle, BarChart3, Loader } from 'lucide-react';

export const CompletionStatsCard = ({ completionStats, isLoading }) => {
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
    averageCompletion = 0,
    totalSubmissions = 0,
    completedSubmissions = 0,
    incompleteSubmissions = 0
  } = completionStats || {};

  const completionRate = totalSubmissions > 0
    ? Math.round((completedSubmissions / totalSubmissions) * 100)
    : 0;

  const getCompletionColor = (rate) => {
    if (rate >= 85) return 'from-green-500 to-emerald-500';
    if (rate >= 70) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const getCompletionStatus = (rate) => {
    if (rate >= 85) return { label: 'Rất tốt', emoji: '🌟' };
    if (rate >= 70) return { label: 'Tốt', emoji: '⭐' };
    if (rate >= 50) return { label: 'Bình thường', emoji: '📊' };
    return { label: 'Cần cải thiện', emoji: '⚠️' };
  };

  const status = getCompletionStatus(completionRate);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 className="text-purple-600" size={24} />
            Tỷ Lệ Hoàn Thành Form
          </h3>
          <CheckCircle className="text-green-500" size={20} />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {totalSubmissions === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Chưa có dữ liệu submission</p>
          </div>
        ) : (
          <>
            {/* Main completion rate */}
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br ${getCompletionColor(completionRate)} shadow-lg mb-4`}>
                <div className="text-center">
                  <div className="text-5xl font-bold text-white">{completionRate}%</div>
                  <div className="text-sm text-white/90">Hoàn thành</div>
                </div>
              </div>
              <p className="text-lg font-semibold text-gray-800">
                {status.emoji} {status.label}
              </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-3xl font-bold text-blue-600">{totalSubmissions}</p>
                <p className="text-sm text-blue-700 font-medium">Tổng cộng</p>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                <p className="text-3xl font-bold text-green-600">{completedSubmissions}</p>
                <p className="text-sm text-green-700 font-medium">Hoàn thành</p>
              </div>

              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-100">
                <p className="text-3xl font-bold text-red-600">{incompleteSubmissions}</p>
                <p className="text-sm text-red-700 font-medium">Chưa hoàn</p>
              </div>
            </div>

            {/* Average completion */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">Hoàn thành trung bình</span>
                <span className="text-lg font-bold text-blue-600">{Math.round(averageCompletion)}%</span>
              </div>
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(averageCompletion, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Trung bình người dùng hoàn thành {Math.round(averageCompletion)}% form trước khi submit
              </p>
            </div>

            {/* Incomplete rate */}
            {incompleteSubmissions > 0 && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="text-orange-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-semibold text-orange-900">Lưu ý</p>
                  <p className="text-sm text-orange-700">
                    Có {incompleteSubmissions} submission chưa hoàn thành ({Math.round((incompleteSubmissions / totalSubmissions) * 100)}%)
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CompletionStatsCard;
