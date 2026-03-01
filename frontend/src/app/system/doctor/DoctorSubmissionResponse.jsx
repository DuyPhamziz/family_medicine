import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import api from '../../../service/api';
import Button from '../../../components/ui/Button';
import './DoctorSubmissionResponse.css';

/**
 * Component để doctor trả lời submissions
 */
const DoctorSubmissionResponse = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [response, setResponse] = useState({
    response: '',
    notes: '',
    responseMethod: 'NONE'
  });
  
  useEffect(() => {
    loadSubmission();
  }, [submissionId]);
  
  const loadSubmission = async () => {
    try {
      setLoading(true);
      const result = await api.get(`/api/doctor/public-submissions/${submissionId}`);
      setSubmission(result.data);
    } catch (error) {
      console.error('Error loading submission:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!response.response.trim()) {
      alert('Vui lòng nhập kết quả trả lời');
      return;
    }
    
    try {
      setSubmitting(true);
      await api.post(
        `/api/doctor/public-submissions/${submissionId}/respond`,
        {
          response: response.response,
          notes: response.notes,
          responseMethod: response.responseMethod,
          doctor: true
        }
      );
      
      alert('Trả lời thành công!');
      navigate('/system/doctor/public-submissions');
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Lỗi khi trả lời');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return <div className="loading-container">Đang tải...</div>;
  }
  
  if (!submission) {
    return <div className="error-container">Không tìm thấy nhập liệu</div>;
  }
  
  return (
    <div className="doctor-submission-response">
      {/* Header */}
      <div className="page-header">
        <button 
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} /> Quay lại
        </button>
        <h1>Trả lời nhập liệu từ {submission.patientInfo?.patientName || 'Bệnh nhân'}</h1>
      </div>
      
      <div className="response-container">
        {/* Submission Info */}
        <div className="submission-info">
          <h3>ℹ️ Thông tin nhập liệu</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Form</label>
              <span>{submission.formInfo?.formName}</span>
            </div>
            <div className="info-item">
              <label>Bệnh nhân</label>
              <span>{submission.patientInfo?.patientName}</span>
            </div>
            <div className="info-item">
              <label>Email</label>
              <span>{submission.patientInfo?.email}</span>
            </div>
            <div className="info-item">
              <label>Điểm số</label>
              <span className="score-badge">{submission.totalScore || 0}</span>
            </div>
            {submission.riskLevel && (
              <div className="info-item">
                <label>Mức độ rủi ro</label>
                <span className={`risk-badge risk-${submission.riskLevel.toLowerCase()}`}>
                  {submission.riskLevel}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Answers Summary */}
        {submission.sections && submission.sections.length > 0 && (
          <div className="answers-summary">
            <h3>📝 Câu trả lời</h3>
            {submission.sections.map((section, idx) => (
              <div key={idx} className="section">
                <h4>{section.sectionName}</h4>
                <div className="questions-list">
                  {section.questions?.map((q, qIdx) => (
                    <div key={qIdx} className="question-answer">
                      <div className="question-text">{q.questionText}</div>
                      <div className="answer-value">
                        {Array.isArray(q.value) ? q.value.join(', ') : q.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Response Form */}
        <div className="response-form">
          <h3>📤 Trả lời</h3>
          <form onSubmit={handleSubmit}>
            {/* Response */}
            <div className="form-group">
              <label>Kết quả/Chẩn đoán *</label>
              <textarea
                value={response.response}
                onChange={(e) => setResponse({ ...response, response: e.target.value })}
                placeholder="Nhập kết quả sau khi phân tích nhập liệu..."
                rows="6"
                className="form-control textarea"
              />
              <small className="help-text">
                Nhập kết quả chẩn đoán, hướng dẫn hoặc recommend cho bệnh nhân
              </small>
            </div>
            
            {/* Notes */}
            <div className="form-group">
              <label>Ghi chú (tùy chọn)</label>
              <textarea
                value={response.notes}
                onChange={(e) => setResponse({ ...response, notes: e.target.value })}
                placeholder="Ghi chú nội bộ cho filer tô..."
                rows="3"
                className="form-control textarea"
              />
            </div>
            
            {/* Response Method */}
            <div className="form-group">
              <label>Cách thức trả lời</label>
              <select
                value={response.responseMethod}
                onChange={(e) => setResponse({ ...response, responseMethod: e.target.value })}
                className="form-control"
              >
                <option value="NONE">Không gửi</option>
                <option value="EMAIL">Gửi email</option>
                <option value="ZALO">Gửi Zalo</option>
              </select>
            </div>
            
            {/* Submit */}
            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-cancel"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-submit"
              >
                <Send size={16} />
                {submitting ? 'Đang gửi...' : 'Gửi trả lời'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DoctorSubmissionResponse;
