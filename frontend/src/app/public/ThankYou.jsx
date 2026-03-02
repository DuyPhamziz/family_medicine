import React, { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Home, Search, Calendar, FileText, Mail, MessageCircle } from 'lucide-react';
import MedicalLayout from '../../components/layout/MedicalLayout';
import './ThankYou.css';

/**
 * Thank You Page - Shown after successful form submission
 */
export const ThankYou = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const submissionData = useMemo(() => {
    const submissionId = searchParams.get('submissionId');
    const patientName = searchParams.get('patientName');
    const patientPhone = searchParams.get('patientPhone');
    const submittedAt = searchParams.get('submittedAt');

    if (submissionId) {
      return {
        submissionId,
        patientName: patientName || 'N/A',
        patientPhone: patientPhone || 'N/A',
        submittedAt: submittedAt ? new Date(submittedAt) : new Date()
      };
    }
    return null;
  }, [searchParams]);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <MedicalLayout>
      <div className="thank-you-page">
        <div className="thank-you-card">
          {/* Success Icon */}
          <div className="success-icon-wrapper">
            <div className="success-icon">
              <CheckCircle size={64} />
            </div>
            <div className="success-animation"></div>
          </div>

          {/* Main Message */}
          <h1 className="thank-you-title">
            Cảm ơn bạn đã gửi thông tin!
          </h1>
          
          <p className="thank-you-message">
            Thông tin của bạn đã được ghi nhận thành công. 
            Bác sĩ sẽ xem xét và phản hồi trong thời gian sớm nhất.
          </p>

          {/* Submission Info */}
          {submissionData && (
            <div className="submission-info-card">
              <h2 className="info-title">
                <FileText size={20} />
                Thông tin hồ sơ
              </h2>
              
              <div className="info-grid">
                <div className="info-item">
                  <label>Mã hồ sơ</label>
                  <div className="info-value code">
                    {submissionData.submissionId}
                  </div>
                  <p className="info-note">Vui lòng lưu lại mã này để tra cứu</p>
                </div>

                <div className="info-item">
                  <label>Người gửi</label>
                  <div className="info-value">{submissionData.patientName}</div>
                </div>

                <div className="info-item">
                  <label>Số điện thoại</label>
                  <div className="info-value">{submissionData.patientPhone}</div>
                </div>

                <div className="info-item">
                  <label>
                    <Calendar size={16} />
                    Thời gian gửi
                  </label>
                  <div className="info-value">{formatDate(submissionData.submittedAt)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="next-steps-card">
            <h2 className="steps-title">Tiếp theo, bạn sẽ nhận được:</h2>
            <ul className="steps-list">
              <li className="step-item">
                <Mail className="step-icon" size={20} />
                <div>
                  <strong>Email xác nhận</strong>
                  <p>Thông tin hồ sơ gửi về email của bạn</p>
                </div>
              </li>
              <li className="step-item">
                <MessageCircle className="step-icon" size={20} />
                <div>
                  <strong>Thông báo Zalo</strong>
                  <p>Phản hồi của bác sĩ qua Zalo (nếu có)</p>
                </div>
              </li>
              <li className="step-item">
                <Search className="step-icon" size={20} />
                <div>
                  <strong>Tra cứu trực tuyến</strong>
                  <p>Kiểm tra kết quả bất cứ lúc nào trên website</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/check-result', { 
                state: { 
                  submissionId: submissionData?.submissionId,
                  phone: submissionData?.patientPhone 
                }
              })}
            >
              <Search size={20} />
              Tra cứu kết quả
            </button>
            
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/')}
            >
              <Home size={20} />
              Về trang chủ
            </button>
          </div>

          {/* Help Section */}
          <div className="help-section">
            <p className="help-text">
              Cần hỗ trợ? Liên hệ: <strong>1900 xxxx</strong> hoặc{' '}
              <a href="mailto:support@familymed.vn">support@familymed.vn</a>
            </p>
          </div>
        </div>
      </div>
    </MedicalLayout>
  );
};

export default ThankYou;
