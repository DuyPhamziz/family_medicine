import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, MessageSquare, Filter, Search, Trash2, Download, Archive } from 'lucide-react';
import api from '../../../service/api';
import Button from '../../../components/ui/Button';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
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
  const [filterFormType, setFilterFormType] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0
  });
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    submissionId: null,
    patientName: '',
    deleting: false
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
  
  const handleOpenDeleteModal = (submission) => {
    setDeleteModal({
      open: true,
      submissionId: submission.submissionId,
      patientName: submission.patientName,
      deleting: false
    });
  };
  
  const handleDeleteConfirm = async () => {
    try {
      setDeleteModal(prev => ({ ...prev, deleting: true }));
      await api.delete(`/api/public-submission/${deleteModal.submissionId}`);
      
      // Remove deleted submission from list
      setSubmissions(submissions.filter(s => s.submissionId !== deleteModal.submissionId));
      
      // Update total elements count
      setPagination(prev => ({
        ...prev,
        totalElements: Math.max(0, prev.totalElements - 1)
      }));
      
      // Close modal
      setDeleteModal({
        open: false,
        submissionId: null,
        patientName: '',
        deleting: false
      });
    } catch (error) {
      console.error('Error deleting submission:', error);
      const message = error?.response?.data?.message
        || error?.response?.data?.error
        || 'Lỗi xóa nhập liệu. Vui lòng thử lại.';
      alert(message);
      setDeleteModal(prev => ({ ...prev, deleting: false }));
    }
  };
  
  const handleDeleteClose = () => {
    setDeleteModal({
      open: false,
      submissionId: null,
      patientName: '',
      deleting: false
    });
  };

  const handleExportSubmission = async (submissionId) => {
    try {
      const response = await api.post(`/api/export/submission/${submissionId}`, {}, {
        responseType: 'blob'
      });

      const blob = new Blob([
        response.data
      ], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const disposition = response.headers['content-disposition'];
      const filenameMatch = disposition?.match(/filename="?([^";]+)"?/);
      link.setAttribute('download', filenameMatch?.[1] || `submission_${submissionId}.xlsx`);

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting submission:', error);
      const message = error?.response?.data?.message || 'Xuất Excel thất bại. Vui lòng thử lại.';
      alert(message);
    }
  };

  const handleArchiveSubmission = async (submissionId) => {
    try {
      await api.put(`/api/doctor/submissions/${submissionId}/archive`);
      await loadSubmissions(pagination.page, filterStatus);
    } catch (error) {
      console.error('Error archiving submission:', error);
      const message = error?.response?.data?.message || 'Lưu trữ thất bại. Vui lòng thử lại.';
      alert(message);
    }
  };

  const uniqueFormTypes = Array.from(new Set(submissions.map(item => item.formName).filter(Boolean)));

  const filteredSubmissions = submissions.filter((submission) => {
    const searchTarget = `${submission.patientName || ''} ${submission.email || ''} ${submission.formName || ''}`.toLowerCase();
    const matchesSearch = !searchText || searchTarget.includes(searchText.toLowerCase());

    const matchesFormType = filterFormType === 'ALL' || submission.formName === filterFormType;

    const submittedDate = submission.submittedAt ? new Date(submission.submittedAt) : null;
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    const matchesFromDate = !from || (submittedDate && submittedDate >= from);
    const matchesToDate = !to || (submittedDate && submittedDate <= new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59));

    return matchesSearch && matchesFormType && matchesFromDate && matchesToDate;
  });
  
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

        <div className="search-box" style={{ maxWidth: '220px' }}>
          <select
            value={filterFormType}
            onChange={(e) => setFilterFormType(e.target.value)}
            style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent' }}
          >
            <option value="ALL">Tất cả loại form</option>
            {uniqueFormTypes.map((formName) => (
              <option key={formName} value={formName}>{formName}</option>
            ))}
          </select>
        </div>

        <div className="search-box" style={{ maxWidth: '220px' }}>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            placeholder="Từ ngày"
          />
        </div>

        <div className="search-box" style={{ maxWidth: '220px' }}>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            placeholder="Đến ngày"
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
      ) : filteredSubmissions.length === 0 ? (
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
              {filteredSubmissions.map(submission => (
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
                    <small>
                      {submission.submittedAt 
                        ? new Date(submission.submittedAt).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          })
                        : '-'
                      }
                    </small>
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
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleOpenDeleteModal(submission)}
                      title="Xóa nhập liệu"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      className="action-btn export-btn"
                      onClick={() => handleExportSubmission(submission.submissionId)}
                      title="Xuất Excel"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      className="action-btn archive-btn"
                      onClick={() => handleArchiveSubmission(submission.submissionId)}
                      title="Lưu trữ"
                    >
                      <Archive size={16} />
                    </button>
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
      
      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={deleteModal.open}
        title="Xóa nhập liệu"
        description={`Bạn có chắc chắn muốn xóa nhập liệu của "${deleteModal.patientName}"? Thao tác này không thể hoàn tác.`}
        confirmLabel={deleteModal.deleting ? 'Đang xóa...' : 'Xóa'}
        cancelLabel="Hủy"
        onConfirm={handleDeleteConfirm}
        onClose={handleDeleteClose}
      />
    </div>
  );
};

export default DoctorPublicSubmissions;
