import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer, FileText, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../../../service/api';
import exportApi from '../../../api/exportApi';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import LoadingOverlay from '../../../components/admin/LoadingOverlay';
import { showError, showSuccess } from '../../../utils/toastNotifications';
import './DoctorSubmissionResult.css';

/**
 * Doctor Submission Result Page (UPGRADED)
 * Features:
 * - Doctor notes for each field
 * - Quick assessment buttons (Good/Bad/Warning)
 * - Color-coded severity indicators
 * - Smart calculation suggestions
 * - Professional medical interface
 */
export const DoctorSubmissionResult = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [assessments, setAssessments] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
  
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
  
  const handleExportExcel = async () => {
    if (!result) {
      showError('No result data available');
      return;
    }
    
    try {
      setExporting(true);
      await exportApi.exportAndDownload({
        submissionId: submissionId,
      });
      showSuccess('Excel report exported successfully');
    } catch (err) {
      console.error('Export error:', err);
      showError('Failed to export Excel report');
    } finally {
      setExporting(false);
    }
  };

  const handleAssessment = (fieldCode, assessment) => {
    setAssessments(prev => ({
      ...prev,
      [fieldCode]: assessment
    }));
  };

  const toggleSection = (sectionCode) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionCode]: !prev[sectionCode]
    }));
  };

  const formatAnswer = (answer) => {
    if (!answer) return 'N/A';
    
    // Nếu là string, thử parse JSON
    let parsedAnswer = answer;
    if (typeof answer === 'string') {
      try {
        // Kiểm tra nếu là JSON array hoặc object
        if (answer.trim().startsWith('[') || answer.trim().startsWith('{')) {
          parsedAnswer = JSON.parse(answer);
        }
      } catch (e) {
        // Không phải JSON hợp lệ, giữ nguyên string
        return answer;
      }
    }
    
    // Nếu là array
    if (Array.isArray(parsedAnswer)) {
      if (parsedAnswer.length === 0) return 'Không có';
      // Join các giá trị, format đẹp hơn
      return parsedAnswer
        .map(item => {
          // Chuyển từ UPPERCASE sang Title Case
          if (typeof item === 'string') {
            return item.charAt(0).toUpperCase() + item.slice(1).toLowerCase();
          }
          return item;
        })
        .join(', ');
    }
    
    // Nếu là object
    if (typeof parsedAnswer === 'object' && parsedAnswer !== null) {
      return JSON.stringify(parsedAnswer, null, 2);
    }
    
    // String bình thường
    return parsedAnswer;
  };

  const getAssessmentClass = (assessment) => {
    switch(assessment) {
      case 'GOOD': return 'assessment-good';
      case 'BAD': return 'assessment-bad';
      case 'WARNING': return 'assessment-warning';
      default: return '';
    }
  };

  const getAssessmentIcon = (assessment) => {
    switch(assessment) {
      case 'GOOD': return <CheckCircle size={16} />;
      case 'BAD': return <AlertCircle size={16} />;
      case 'WARNING': return <AlertTriangle size={16} />;
      default: return null;
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
            <Button onClick={handleExportExcel} variant="secondary" disabled={exporting}>
              <FileText size={18} /> 
              {exporting ? ' Đang xuất...' : ' Xuất Excel'}
            </Button>
          </div>
        </div>
        
        <div className="header-main">
          <h1>{result.formName}</h1>
          <p className="form-version">Phiên bản: {result.formVersion}</p>
        </div>
      </div>
      
      {/* Patient Info Card */}
      <Card className="patient-info-card">
        <div className="card-title">👤 Thông tin bệnh nhân</div>
        <div className="patient-grid">
          <div className="patient-field">
            <label>Tên bệnh nhân</label>
            <p className="patient-value">{result.patientName}</p>
          </div>
          <div className="patient-field">
            <label>Mã bệnh nhân</label>
            <p className="patient-value">{result.patientCode || 'N/A'}</p>
          </div>
          <div className="patient-field">
            <label>Email</label>
            <p className="patient-value">{result.patientEmail}</p>
          </div>
          <div className="patient-field">
            <label>Điện thoại</label>
            <p className="patient-value">{result.patientPhone}</p>
          </div>
          {result.patientAge && (
            <div className="patient-field">
              <label>Tuổi</label>
              <p className="patient-value">{result.patientAge} tuổi</p>
            </div>
          )}
          {result.patientGender && (
            <div className="patient-field">
              <label>Giới tính</label>
              <p className="patient-value">{result.patientGender}</p>
            </div>
          )}
        </div>
      </Card>
      
      {/* Scoring Summary */}
      <Card className="scoring-summary-card">
        <div className="card-title">📊 Kết quả phân tích</div>
        <div className="scoring-grid">
          <div className={`score-box score-main ${getRiskLevelClass(result.riskLevel)}`}>
            <div className="score-value">{result.totalScore}</div>
            <div className="score-label">Tổng điểm</div>
          </div>
          <div className={`score-box risk-box ${getRiskLevelClass(result.riskLevel)}`}>
            <div className="risk-level">{formatRiskLevel(result.riskLevel)}</div>
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
          <div className="card-title">⚙️ Các chỉ số được tính toán</div>
          <div className="calculated-grid">
            {result.calculatedFields.map((field, idx) => (
              <div key={idx} className="calculated-field-item">
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
      
      {/* Section Results with Doctor Interface */}
      <div className="sections-container">
        {result.sectionResults && Object.entries(result.sectionResults).map(([sectionCode, section]) => (
          <Card key={sectionCode} className="section-result-card">
            <div 
              className="section-header-doctor"
              onClick={() => toggleSection(sectionCode)}
            >
              <div className="section-info">
                <h3>{section.sectionName}</h3>
                <div className="section-meta">
                  Điểm: <span className="section-score-badge">{section.sectionScore}</span>
                </div>
              </div>
              <div className="section-toggle">
                {expandedSections[sectionCode] ? '▼' : '▶'}
              </div>
            </div>
            
            {expandedSections[sectionCode] !== false && (
              <div className="questions-list-doctor">
                {section.questions.map((q, idx) => (
                  <div key={idx} className="question-result-doctor">
                    <div className="question-header">
                      <div className="question-code">{q.questionCode}</div>
                      <div className="question-text">{q.questionText}</div>
                    </div>
                    
                    <div className="question-answer-section">
                      <div className="answer-display">
                        <span className="answer-value">{formatAnswer(q.answer)}</span>
                        {q.unit && <span className="answer-unit">{q.unit}</span>}
                        {q.points > 0 && <span className="answer-points">+{q.points} pts</span>}
                      </div>
                    </div>

                    {/* Assessment Buttons */}
                    <div className="assessment-buttons">
                      <button
                        className={`assessment-btn ${assessments[q.questionCode] === 'GOOD' ? 'assessment-good' : ''}`}
                        onClick={() => handleAssessment(q.questionCode, 'GOOD')}
                        title="Bình thường"
                      >
                        <CheckCircle size={14} /> Tốt
                      </button>
                      <button
                        className={`assessment-btn ${assessments[q.questionCode] === 'WARNING' ? 'assessment-warning' : ''}`}
                        onClick={() => handleAssessment(q.questionCode, 'WARNING')}
                        title="Cảnh báo"
                      >
                        <AlertTriangle size={14} /> Cảnh báo
                      </button>
                      <button
                        className={`assessment-btn ${assessments[q.questionCode] === 'BAD' ? 'assessment-bad' : ''}`}
                        onClick={() => handleAssessment(q.questionCode, 'BAD')}
                        title="Xấu / Nguy hiểm"
                      >
                        <AlertCircle size={14} /> Xấu
                      </button>
                    </div>

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
            )}
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

function formatRiskLevel(level) {
  if (!level) return 'N/A';
  const lower = level.toLowerCase();
  if (lower.includes('cao') || lower.includes('high')) return '⚠️ CAO';
  if (lower.includes('vừa') || lower.includes('medium')) return '⚡ VỪA';
  if (lower.includes('thấp') || lower.includes('low')) return '✅ THẤP';
  return level;
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

export default DoctorSubmissionResult;
