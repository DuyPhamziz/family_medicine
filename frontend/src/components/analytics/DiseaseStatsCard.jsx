/**
 * DiseaseStatsCard.jsx
 * Card displaying top 10 diseases from medical history
 */

import { TrendingUp, Activity, Loader } from 'lucide-react';

export const DiseaseStatsCard = ({ diseaseStats, isLoading }) => {
  const maxCount = diseaseStats.length > 0 ? diseaseStats[0].count : 1;

  const getDiseaseColor = (index) => {
    const colors = [
      'from-red-500 to-pink-500',
      'from-orange-500 to-red-500',
      'from-yellow-500 to-orange-500',
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-green-500 to-emerald-500',
      'from-indigo-500 to-blue-500',
      'from-rose-500 to-orange-500',
      'from-amber-500 to-yellow-500',
      'from-teal-500 to-cyan-500'
    ];
    return colors[index % colors.length];
  };

  const formatDiseaseName = (name) => {
    const diseaseMap = {
      'HTN': 'Cao huyết áp',
      'IHD': 'Bệnh tim mạch',
      'AF': 'Rối loạn nhịp tim',
      'CVA': 'Đột quỵ',
      'CHF': 'Suy tim',
      'DM1': 'Tiểu đường type 1',
      'DM2': 'Tiểu đường type 2',
      'COPD': 'Bệnh phổi tắc nghẽn',
      'ASTHMA': 'Hen suyễn',
      'TB': 'Lao phổi',
      'CKD': 'Suy thận mạn',
      'ESRD': 'Suy thận giai đoạn cuối',
      'EPILEPSY': 'Động kinh',
      'PARKINSONS': 'Parkinson',
      'DEPRESSION': 'Trầm cảm',
      'ANXIETY': 'Lo âu',
      'BIPOLAR': 'Lưỡng cực',
      'CANCER_GI': 'Ung thư tiêu hóa',
      'CANCER_LUNG': 'Ung thư phổi',
      'CANCER_BREAST': 'Ung thư vú',
      'ARTHRITIS': 'Viêm khớp',
      'OSTEOPOROSIS': 'Loãng xương',
      'HIV': 'HIV/AIDS'
    };
    return diseaseMap[name] || name;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Activity className="text-blue-600" size={24} />
            Top 10 Bệnh Phổ Biến
          </h3>
          <TrendingUp className="text-orange-500" size={20} />
        </div>
        <p className="text-sm text-gray-600 mt-1">Bệnh được ghi nhận nhiều nhất</p>
      </div>

      <div className="p-6 space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader className="text-blue-500 animate-spin" size={32} />
          </div>
        )}

        {!isLoading && diseaseStats.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>Chưa có dữ liệu bệnh trong khoảng thời gian này</p>
          </div>
        )}

        {!isLoading && diseaseStats.length > 0 && (
          <div className="space-y-3">
            {diseaseStats.map((item, index) => (
              <div key={item.disease} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-sm text-gray-700">
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 truncate">
                        {formatDiseaseName(item.disease)}
                      </p>
                      <p className="text-xs text-gray-500">{item.disease}</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-gray-700 ml-2 flex-shrink-0">
                    {item.count}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getDiseaseColor(index)} rounded-full transition-all duration-500`}
                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {diseaseStats.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
          <p>📊 Total: {diseaseStats.reduce((sum, item) => sum + item.count, 0)} ca ghi nhận</p>
        </div>
      )}
    </div>
  );
};

export default DiseaseStatsCard;
