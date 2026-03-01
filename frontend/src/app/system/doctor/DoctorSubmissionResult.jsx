import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import api from '../../../service/api';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import LoadingOverlay from '../../../components/admin/LoadingOverlay';
import { showError } from '../../../utils/toastNotifications';
import './DoctorSubmissionResult.css';

/**
 * Trang kết quả phân tích form dành cho bác sĩ
 * Hiển thị:
 * - Thông tin bệnh nhân
 * - Điểm số và mức độ rủi ro
 * - Kết quả chi tiết theo từng section
 * - Các giá trị được tính toán tự động (tuổi, BMI, vv)
 */
export const DoctorSubmissionResult = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    loadSubmissionResult();
  }, [submissionId]);
  
  const loadSubmissionResult = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/doctor/submissions/${submissionId}/results`);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải kết quả');
      showError('Lỗi tải kết quả');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <LoadingOverlay visible={true} />;
  
  if (error) {
    return (
      <div className="submission-result error-container">
        <Button onClick={() => navigate(-1)} variant="secondary">
          <ArrowLeft size={18} /> Quay lại
        </Button>
        <div className="error-message">{error}</div>
      </div>
    );
  }
  
  if (!result) return null;
  
  return (
    <div className="submission-result">
      {/* Header */}
      <div className="result-header">
        <div className="header-top">
          <Button onClick={() => navigate(-1)} variant="secondary">
            <ArrowLeft size={18} /> Quay lại
          </Button>
          <div className="header-actions">
            <Button onClick={() => window.print()} variant="secondary">
              <Printer size={18} /> In
            </Button>
            <Button onClick={downloadResult} variant="secondary">
              <Download size={18} /> Xuất PDF
            </Button>
          </div>
        </div>
        
        <div className="header-main">
          <h1>{result.formName}</h1>
          <p className="form-version">Phiên bản: {result.formVersion}</p>
        </div>
      </div>
      
      {/* Patient Info */}
      <Card className="patient-info-card">
        <div className="card-title">Thông tin bệnh nhân</div>
        <div className="patient-grid">
          <div className="patient-field">
            <label>Tên bệnh nhân</label>
            <p>{result.patientName}</p>
          </div>
          <div className="patient-field">
            <label>Mã bệnh nhân</label>
            <p>{result.patientCode || 'N/A'}</p>
          </div>
          <div className="patient-field">
            <label>Email</label>
            <p>{result.patientEmail}</p>
          </div>
          <div className="patient-field">
            <label>Điện thoại</label>
            <p>{result.patientPhone}</p>
          </div>
          {result.patientAge && (
            <div className="patient-field">
              <label>Tuổi</label>
              <p>{result.patientAge} tuổi</p>
            </div>
          )}
          {result.patientGender && (
            <div className="patient-field">
              <label>Giới tính</label>
              <p>{result.patientGender}</p>
            </div>
          )}
        </div>
      </Card>
      
      {/* Scoring Summary */}
      <Card className="scoring-summary-card">
        <div className="card-title">Kết quả phân tích</div>
        <div className="scoring-grid">
          <div className={`score-box score-main ${getRiskLevelClass(result.riskLevel)}`}>
            <div className="score-value">{result.totalScore}</div>
            <div className="score-label">Tổng điểm</div>
          </div>
          <div className={`score-box risk-box ${getRiskLevelClass(result.riskLevel)}`}>
            <div className="risk-level">{result.riskLevel}</div>
            <div className="risk-label">Mức độ rủi ro</div>
          </div>
          <div className="score-box submit-date-box">
            <div className="submit-date">{formatDate(result.submittedAt)}</div>
            <div className="submit-label">Ngày nộp</div>
          </div>
        </div>
      </Card>
      
      {/* Calculated Fields */}
      {result.calculatedFields && result.calculatedFields.length > 0 && (
        <Card className="calculated-fields-card">
          <div className="card-title">Các chỉ số được tính toán</div>
          <div className="calculated-grid">
            {result.calculatedFields.map((field, idx) => (
              <div key={idx} className="calculated-field">
                <div className="field-label">{field.fieldLabel}</div>
                <div className="field-value">
                  {field.value} {field.unit && <span className="unit">{field.unit}</span>}
                </div>
                {field.interpretation && (
                  <div className="field-interpretation">{field.interpretation}</div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
      
      {/* Section Results */}
      <div className="sections-container">
        {result.sectionResults && Object.entries(result.sectionResults).map(([sectionCode, section]) => (
          <Card key={sectionCode} className="section-result-card">
            <div className="section-header">
              <h3>{section.sectionName}</h3>
              <div className="section-score">
                Điểm: <span>{section.sectionScore}</span>
              </div>
            </div>
            
            <div className="questions-list">
              {section.questions.map((q, idx) => (
                <div key={idx} className="question-result">
                  <div className="question-info">
                    <div className="question-code">{q.questionCode}</div>
                    <div className="question-text">{q.questionText}</div>
                  </div>
                  <div className="question-answer">
                    <span className="answer-value">{q.answer}</span>
                    {q.unit && <span className="answer-unit">{q.unit}</span>}
                  </div>
                  {q.points > 0 && (
                    <div className="question-points">+{q.points} điểm</div>
                  )}
                  {q.calculatedValues && Object.keys(q.calculatedValues).length > 0 && (
                    <div className="calculated-values">
                      {Object.entries(q.calculatedValues).map(([key, value]) => (
                        <span key={key} className="calc-value">
                          {key}: {value}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

function getRiskLevelClass(level) {
  if (!level) return 'neutral';
  const lower = level.toLowerCase();
  if (lower.includes('cao') || lower.includes('high')) return 'high-risk';
  if (lower.includes('vừa') || lower.includes('medium')) return 'medium-risk';
  if (lower.includes('thấp') || lower.includes('low')) return 'low-risk';
  return 'neutral';
}

function formatDate(dateTime) {
  if (!dateTime) return 'N/A';
  const date = new Date(dateTime);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function downloadResult() {
  // TODO: Implement PDF export
  console.log('Exporting to PDF...');
}

export default DoctorSubmissionResult;
