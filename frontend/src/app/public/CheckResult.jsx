import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Phone, FileText, AlertCircle, CheckCircle, Clock, Calendar, User, Stethoscope } from 'lucide-react';
import MedicalLayout from '../../components/layout/MedicalLayout';
import { checkSubmissionResult } from '../../service/publicApi';
import { showError } from '../../utils/toastNotifications';

/**
 * Public Check Result Page
 * Allows patients to check their submission status and doctor's response
 */
export const CheckResult = () => {
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    phone: location.state?.phone || '',
    submissionId: location.state?.submissionId || ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!formData.phone || !formData.submissionId) {
      showError('Vui lòng nhập đầy đủ số điện thoại và mã hồ sơ');
      return;
    }

    try {
      setLoading(true);
      setSearched(true);
      const data = await checkSubmissionResult(formData.phone, formData.submissionId);
      setResult(data);
    } catch (err) {
      console.error('Check result error:', err);
      showError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại sau');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getStatusInfo = (status) => {
    const statuses = {
      'PENDING': {
        label: 'Đang chờ xử lý',
        icon: <Clock size={20} />,
        color: 'warning',
        description: 'Hồ sơ của bạn đang được bác sĩ xem xét'
      },
      'REVIEWED': {
        label: 'Đã có phản hồi',
        icon: <CheckCircle size={20} />,
        color: 'success',
        description: 'Bác sĩ đã phản hồi hồ sơ của bạn'
      },
      'CANCELLED': {
        label: 'Đã hủy',
        icon: <AlertCircle size={20} />,
        color: 'error',
        description: 'Hồ sơ đã được hủy'
      }
    };
    return statuses[status] || statuses['PENDING'];
  };

  return (
    <MedicalLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl">
              <Search size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Tra cứu kết quả</h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">Nhập thông tin để kiểm tra kết quả khám và phản hồi của bác sĩ</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6 border border-gray-200">
          <form onSubmit={handleSearch} className="space-y-5">
            <div>
              <label htmlFor="phone" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Phone size={18} className="text-blue-600" />
                Số điện thoại
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Nhập số điện thoại đã đăng ký"
                required
                className="w-full px-4 py-3 sm:py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-base"
              />
            </div>

            <div>
              <label htmlFor="submissionId" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FileText size={18} className="text-blue-600" />
                Mã hồ sơ
              </label>
              <input
                type="text"
                id="submissionId"
                name="submissionId"
                value={formData.submissionId}
                onChange={handleInputChange}
                placeholder="Nhập mã hồ sơ nhận được"
                required
                className="w-full px-4 py-3 sm:py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-base"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang tìm...
                </>
              ) : (
                <>
                  <Search size={20} />
                  Tra cứu
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        {searched && !loading && result && (
          <div className="space-y-5 sm:space-y-6">
            {/* Status Card */}
            <div className={`rounded-2xl shadow-lg p-6 sm:p-8 border-2 ${
              getStatusInfo(result.status).color === 'success' ? 'bg-green-50 border-green-500' :
              getStatusInfo(result.status).color === 'warning' ? 'bg-yellow-50 border-yellow-500' :
              'bg-red-50 border-red-500'
            }`}>
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${
                  getStatusInfo(result.status).color === 'success' ? 'bg-green-500' :
                  getStatusInfo(result.status).color === 'warning' ? 'bg-yellow-500' :
                  'bg-red-500'
                } text-white`}>
                  {getStatusInfo(result.status).icon}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                    {getStatusInfo(result.status).label}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-700">
                    {getStatusInfo(result.status).description}
                  </p>
                </div>
              </div>
            </div>

            {/* Patient Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200">
              <h3 className="flex items-center gap-2 text-lg sm:text-xl font-bold text-gray-900 mb-5 pb-3 border-b border-gray-200">
                <User size={20} className="text-blue-600" />
                Thông tin bệnh nhân
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-1 block">Họ tên</label>
                  <div className="text-base sm:text-lg font-semibold text-gray-900">{result.patientName}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-1 block">Số điện thoại</label>
                  <div className="text-base sm:text-lg font-semibold text-gray-900">{result.patientPhone}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-1 block">Email</label>
                  <div className="text-base sm:text-lg font-semibold text-gray-900">{result.patientEmail || 'N/A'}</div>
                </div>
                <div>
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-500 mb-1">
                    <Calendar size={16} />
                    Ngày gửi
                  </label>
                  <div className="text-base sm:text-lg font-semibold text-gray-900">{formatDate(result.submittedAt)}</div>
                </div>
              </div>
            </div>

            {/* Form Name */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200">
              <h3 className="flex items-center gap-2 text-lg sm:text-xl font-bold text-gray-900 mb-4">
                <FileText size={20} className="text-blue-600" />
                Loại form
              </h3>
              <div className="text-base sm:text-lg text-gray-800 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                {result.formName}
              </div>
            </div>

            {/* Doctor's Response (if available) */}
            {result.doctorResponse && (
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-lg p-6 sm:p-8 border-2 border-blue-200">
                <h3 className="flex items-center gap-2 text-lg sm:text-xl font-bold text-gray-900 mb-5 pb-3 border-b border-blue-200">
                  <Stethoscope size={20} className="text-blue-600" />
                  Phản hồi của bác sĩ
                </h3>
                
                <div className="space-y-5">
                  {result.doctorResponse.diagnosis && (
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100">
                      <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-3">Chẩn đoán</h4>
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{result.doctorResponse.diagnosis}</p>
                    </div>
                  )}

                  {result.doctorResponse.recommendations && (
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100">
                      <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-3">Lời khuyên</h4>
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{result.doctorResponse.recommendations}</p>
                    </div>
                  )}

                  {result.doctorResponse.notes && (
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100">
                      <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-3">Ghi chú</h4>
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{result.doctorResponse.notes}</p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm sm:text-base text-gray-700 pt-4 border-t border-blue-200">
                    <span>
                      Bác sĩ: <strong className="text-gray-900">{result.doctorResponse.doctorName || 'N/A'}</strong>
                    </span>
                    <span>
                      Ngày phản hồi: <strong className="text-gray-900">{formatDate(result.doctorResponse.respondedAt)}</strong>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* If pending */}
            {result.status === 'PENDING' && !result.doctorResponse && (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-8 sm:p-10 text-center">
                <Clock size={48} className="mx-auto text-yellow-600 mb-4" />
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Hồ sơ đang được xem xét</h3>
                <p className="text-sm sm:text-base text-gray-700 mb-4 max-w-2xl mx-auto leading-relaxed">
                  Bác sĩ sẽ xem xét và phản hồi trong thời gian sớm nhất.
                  Chúng tôi sẽ gửi thông báo qua Email và Zalo khi có phản hồi.
                </p>
                <p className="text-sm text-gray-600 italic">
                  Bạn có thể quay lại trang này để kiểm tra kết quả.
                </p>
              </div>
            )}
          </div>
        )}

        {/* No Results */}
        {searched && !loading && !result && (
          <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-8 sm:p-12 text-center">
            <AlertCircle size={48} className="mx-auto text-red-600 mb-4" />
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Không tìm thấy hồ sơ</h3>
            <p className="text-sm sm:text-base text-gray-700">Vui lòng kiểm tra lại số điện thoại và mã hồ sơ</p>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-md p-6 sm:p-8 border border-blue-200 mt-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Cần hỗ trợ?</h3>
          <p className="text-sm sm:text-base text-gray-700 mb-4">
            Nếu bạn gặp khó khăn trong việc tra cứu, vui lòng liên hệ:
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm sm:text-base">
            <div className="text-gray-700">
              Hotline: <strong className="text-blue-600">1900 xxxx</strong>
            </div>
            <div className="text-gray-700">
              Email: <a href="mailto:support@familymed.vn" className="text-blue-600 hover:text-blue-700 font-semibold underline">support@familymed.vn</a>
            </div>
          </div>
        </div>
      </div>
    </MedicalLayout>
  );
};

export default CheckResult;
