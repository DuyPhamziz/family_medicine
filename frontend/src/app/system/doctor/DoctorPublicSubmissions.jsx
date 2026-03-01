import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, MessageSquare, Filter, Search } from 'lucide-react';
import api from '../../../service/api';
import Button from '../../../components/ui/Button';
import './DoctorPublicSubmissions.css';

/**
 * Trang dashboard cho bác sĩ xem submissions từ public forms
 */
const DoctorPublicSubmissions = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0
  });
  
  const loadSubmissions = async (page = 0, status = 'ALL') => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('size', 10);
      if (status !== 'ALL') {
        params.append('status', status);
      }
      
      const response = await api.get(`/api/doctor/public-submissions?${params.toString()}`);
      setSubmissions(response.data.content || []);
      setPagination({
        page: response.data.currentPage,
        size: response.data.pageSize,
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements
      });
    } catch (error) {
      console.error('Error loading submissions:', error);
      const message = error?.response?.data?.error
        || error?.response?.data?.message
        || 'Không tải được danh sách nhập liệu. Vui lòng thử lại.';
      setError(message);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadSubmissions(pagination.page, filterStatus);
  }, [filterStatus]);
  
  const handleStatusFilter = (status) => {
    setFilterStatus(status);
    setPagination({ ...pagination, page: 0 });
  };
  
  const getStatusBadge = (status) => {
    const badges = {
      'PENDING': { color: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ xử lý' },
      'REVIEWED': { color: 'bg-blue-100', text: 'text-blue-800', label: 'Đã xem' },
      'RESPONDED': { color: 'bg-green-100', text: 'text-green-800', label: 'Đã trả lời' },
      'COMPLETED': { color: 'bg-gray-100', text: 'text-gray-800', label: 'Hoàn thành' }
    };
    const badge = badges[status] || badges['COMPLETED'];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };
  
  const getRiskLevelColor = (level) => {
    if (!level) return 'bg-gray-100 text-gray-800';
    switch (level.toUpperCase()) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-orange-100 text-orange-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="doctor-public-submissions">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>📋 Nhập liệu từ Form công khai</h1>
          <p>Quản lý và trả lời các form được bệnh nhân gửi</p>
        </div>
      </div>
      
      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <Filter size={16} style={{ color: '#666' }} />
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filterStatus === 'ALL' ? 'active' : ''}`}
              onClick={() => handleStatusFilter('ALL')}
            >
              Tất cả ({pagination.totalElements})
            </button>
            <button
              className={`filter-btn ${filterStatus === 'PENDING' ? 'active' : ''}`}
              onClick={() => handleStatusFilter('PENDING')}
            >
              Chờ xử lý
            </button>
            <button
              className={`filter-btn ${filterStatus === 'REVIEWED' ? 'active' : ''}`}
              onClick={() => handleStatusFilter('REVIEWED')}
            >
              Đã xem
            </button>
            <button
              className={`filter-btn ${filterStatus === 'RESPONDED' ? 'active' : ''}`}
              onClick={() => handleStatusFilter('RESPONDED')}
            >
              Đã trả lời
            </button>
          </div>
        </div>
        
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Tìm kiếm tên, email..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>
      
      {/* Table */}
      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : error ? (
        <div className="empty-state">
          <p>{error}</p>
        </div>
      ) : submissions.length === 0 ? (
        <div className="empty-state">
          <p>Không có nhập liệu nào</p>
        </div>
      ) : (
        <div className="submissions-table">
          <table>
            <thead>
              <tr>
                <th>Form</th>
                <th>Bệnh nhân</th>
                <th>Email</th>
                <th>Điểm số</th>
                <th>Mức độ rủi ro</th>
                <th>Ngày gửi</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(submission => (
                <tr key={submission.submissionId} className="submission-row">
                  <td className="form-name">
                    <div>{submission.formName}</div>
                  </td>
                  <td className="patient-name">
                    <div>{submission.patientName}</div>
                  </td>
                  <td className="email">
                    <small>{submission.email || '-'}</small>
                  </td>
                  <td className="score">
                    <span className="score-badge">{submission.totalScore || 0}</span>
                  </td>
                  <td className="risk-level">
                    {submission.riskLevel && (
                      <span className={`risk-badge ${getRiskLevelColor(submission.riskLevel)}`}>
                        {submission.riskLevel}
                      </span>
                    )}
                  </td>
                  <td className="date">
                    <small>{new Date(submission.submittedAt).toLocaleDateString('vi-VN')}</small>
                  </td>
                  <td className="status">
                    {getStatusBadge(submission.status)}
                  </td>
                  <td className="actions">
                    <button
                      className="action-btn view-btn"
                      onClick={() => navigate(`/system/public-submissions/${submission.submissionId}`)}
                      title="Xem chi tiết"
                    >
                      <Eye size={16} />
                    </button>
                    {submission.status !== 'RESPONDED' && (
                      <button
                        className="action-btn respond-btn"
                        onClick={() => navigate(`/system/public-submissions/${submission.submissionId}/respond`)}
                        title="Trả lời"
                      >
                        <MessageSquare size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={pagination.page === 0}
            onClick={() => loadSubmissions(pagination.page - 1, filterStatus)}
          >
            Trang trước
          </button>
          <span>
            Trang {pagination.page + 1} / {pagination.totalPages}
          </span>
          <button
            disabled={pagination.page >= pagination.totalPages - 1}
            onClick={() => loadSubmissions(pagination.page + 1, filterStatus)}
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
};

export default DoctorPublicSubmissions;
