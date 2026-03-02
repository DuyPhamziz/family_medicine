import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Phone, FileText, AlertCircle, CheckCircle, Clock, Calendar, User, Stethoscope } from 'lucide-react';
import MedicalLayout from '../../components/layout/MedicalLayout';
import { checkSubmissionResult } from '../../service/publicApi';
import { showError } from '../../utils/toastNotifications';
import './CheckResult.css';

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
      <div className="check-result-page">
        <div className="page-header">
          <h1>
            <Search size={32} />
            Tra cứu kết quả
          </h1>
          <p>Nhập thông tin để kiểm tra kết quả khám và phản hồi của bác sĩ</p>
        </div>

        {/* Search Form */}
        <div className="search-card">
          <form onSubmit={handleSearch} className="search-form">
            <div className="form-group">
              <label htmlFor="phone">
                <Phone size={18} />
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
              />
            </div>

            <div className="form-group">
              <label htmlFor="submissionId">
                <FileText size={18} />
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
              />
            </div>

            <button type="submit" className="btn-search" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
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
          <div className="result-section">
            {/* Status Card */}
            <div className={`status-card status-${getStatusInfo(result.status).color}`}>
              <div className="status-icon">
                {getStatusInfo(result.status).icon}
              </div>
              <div className="status-content">
                <h2>{getStatusInfo(result.status).label}</h2>
                <p>{getStatusInfo(result.status).description}</p>
              </div>
            </div>

            {/* Patient Info */}
            <div className="info-card">
              <h3>
                <User size={20} />
                Thông tin bệnh nhân
              </h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Họ tên</label>
                  <div className="info-value">{result.patientName}</div>
                </div>
                <div className="info-item">
                  <label>Số điện thoại</label>
                  <div className="info-value">{result.patientPhone}</div>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <div className="info-value">{result.patientEmail || 'N/A'}</div>
                </div>
                <div className="info-item">
                  <label>
                    <Calendar size={16} />
                    Ngày gửi
                  </label>
                  <div className="info-value">{formatDate(result.submittedAt)}</div>
                </div>
              </div>
            </div>

            {/* Form Name */}
            <div className="info-card">
              <h3>
                <FileText size={20} />
                Loại form
              </h3>
              <div className="form-name-display">{result.formName}</div>
            </div>

            {/* Doctor's Response (if available) */}
            {result.doctorResponse && (
              <div className="response-card">
                <h3>
                  <Stethoscope size={20} />
                  Phản hồi của bác sĩ
                </h3>
                
                {result.doctorResponse.diagnosis && (
                  <div className="response-section">
                    <h4>Chẩn đoán</h4>
                    <p>{result.doctorResponse.diagnosis}</p>
                  </div>
                )}

                {result.doctorResponse.recommendations && (
                  <div className="response-section">
                    <h4>Lời khuyên</h4>
                    <p>{result.doctorResponse.recommendations}</p>
                  </div>
                )}

                {result.doctorResponse.notes && (
                  <div className="response-section">
                    <h4>Ghi chú</h4>
                    <p>{result.doctorResponse.notes}</p>
                  </div>
                )}

                <div className="response-meta">
                  <span>
                    Bác sĩ: <strong>{result.doctorResponse.doctorName || 'N/A'}</strong>
                  </span>
                  <span>
                    Ngày phản hồi: <strong>{formatDate(result.doctorResponse.respondedAt)}</strong>
                  </span>
                </div>
              </div>
            )}

            {/* If pending */}
            {result.status === 'PENDING' && !result.doctorResponse && (
              <div className="pending-message">
                <Clock size={48} />
                <h3>Hồ sơ đang được xem xét</h3>
                <p>
                  Bác sĩ sẽ xem xét và phản hồi trong thời gian sớm nhất.
                  Chúng tôi sẽ gửi thông báo qua Email và Zalo khi có phản hồi.
                </p>
                <p className="helper-text">
                  Bạn có thể quay lại trang này để kiểm tra kết quả.
                </p>
              </div>
            )}
          </div>
        )}

        {/* No Results */}
        {searched && !loading && !result && (
          <div className="no-results">
            <AlertCircle size={48} />
            <h3>Không tìm thấy hồ sơ</h3>
            <p>Vui lòng kiểm tra lại số điện thoại và mã hồ sơ</p>
          </div>
        )}

        {/* Help Section */}
        <div className="help-card">
          <h3>Cần hỗ trợ?</h3>
          <p>
            Nếu bạn gặp khó khăn trong việc tra cứu, vui lòng liên hệ:
          </p>
          <div className="help-contacts">
            <div>Hotline: <strong>1900 xxxx</strong></div>
            <div>Email: <a href="mailto:support@familymed.vn">support@familymed.vn</a></div>
          </div>
        </div>
      </div>
    </MedicalLayout>
  );
};

export default CheckResult;
