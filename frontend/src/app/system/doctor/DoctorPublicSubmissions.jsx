import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, MessageSquare, Filter, Search, Trash2, Download, Archive, User, Mail, Calendar, Activity, AlertCircle } from 'lucide-react';
import api from '../../../service/api';
import Button from '../../../components/ui/Button';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8 p-6 sm:p-8 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 rounded-2xl text-white shadow-xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-3">
            <Activity className="w-8 h-8" />
            Nhập liệu từ Form công khai
          </h1>
          <p className="text-sm sm:text-base opacity-90">Quản lý và trả lời các form được bệnh nhân gửi</p>
        </div>
      </div>
      
      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Filter size={18} className="text-gray-600" />
          <button
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterStatus === 'ALL'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-500'
            }`}
            onClick={() => handleStatusFilter('ALL')}
          >
            Tất cả ({pagination.totalElements})
          </button>
          <button
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterStatus === 'PENDING'
                ? 'bg-yellow-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-yellow-500'
            }`}
            onClick={() => handleStatusFilter('PENDING')}
          >
            Chờ xử lý
          </button>
          <button
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterStatus === 'REVIEWED'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-500'
            }`}
            onClick={() => handleStatusFilter('REVIEWED')}
          >
            Đã xem
          </button>
          <button
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterStatus === 'RESPONDED'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-green-500'
            }`}
            onClick={() => handleStatusFilter('RESPONDED')}
          >
            Đã trả lời
          </button>
        </div>
        
        {/* Search and Date Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm tên, email..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="flex-1 outline-none text-sm"
            />
          </div>

          <select
            value={filterFormType}
            onChange={(e) => setFilterFormType(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg outline-none text-sm"
          >
            <option value="ALL">Tất cả loại form</option>
            {uniqueFormTypes.map((formName) => (
              <option key={formName} value={formName}>{formName}</option>
            ))}
          </select>

          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            placeholder="Từ ngày"
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg outline-none text-sm"
          />

          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            placeholder="Đến ngày"
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg outline-none text-sm"
          />
        </div>
      </div>
      
      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <p className="text-red-700">{error}</p>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="bg-gray-100 border-2 border-dashed border-gray-300 p-12 rounded-xl text-center">
          <p className="text-gray-500 text-lg">Không có nhập liệu nào</p>
        </div>
      ) : (
        <>
          {/* Mobile Card Layout */}
          <div className="block lg:hidden space-y-4 mb-6">
            {filteredSubmissions.map(submission => (
              <div key={submission.submissionId} className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
                {/* Header */}
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-base mb-1">{submission.formName}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User size={14} />
                      <span className="font-medium">{submission.patientName}</span>
                    </div>
                  </div>
                  {getStatusBadge(submission.status)}
                </div>

                {/* Info Grid */}
                <div className="space-y-3 mb-4">
                  {submission.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail size={14} className="text-gray-400" />
                      <span className="text-blue-600">{submission.email}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={14} className="text-gray-400" />
                      <span>
                        {submission.submittedAt 
                          ? new Date(submission.submittedAt).toLocaleDateString('vi-VN', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit'
                            })
                          : '-'
                        }
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">Điểm:</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg font-semibold text-sm">
                        {submission.totalScore || 0}
                      </span>
                    </div>
                  </div>

                  {submission.riskLevel && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Mức độ rủi ro:</span>
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getRiskLevelColor(submission.riskLevel)}`}>
                        {submission.riskLevel}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                  <button
                    className="flex-1 min-w-[120px] px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    onClick={() => navigate(`/system/public-submissions/${submission.submissionId}`)}
                  >
                    <Eye size={14} />
                    Xem
                  </button>
                  {submission.status !== 'RESPONDED' && (
                    <button
                      className="flex-1 min-w-[120px] px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      onClick={() => navigate(`/system/public-submissions/${submission.submissionId}/respond`)}
                    >
                      <MessageSquare size={14} />
                      Trả lời
                    </button>
                  )}
                  <button
                    className="px-3 py-2 bg-cyan-600 text-white rounded-lg text-sm font-medium hover:bg-cyan-700 transition-colors flex items-center justify-center gap-2"
                    onClick={() => handleExportSubmission(submission.submissionId)}
                    title="Xuất Excel"
                  >
                    <Download size={14} />
                  </button>
                  <button
                    className="px-3 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                    onClick={() => handleArchiveSubmission(submission.submissionId)}
                    title="Lưu trữ"
                  >
                    <Archive size={14} />
                  </button>
                  <button
                    className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    onClick={() => handleOpenDeleteModal(submission)}
                    title="Xóa"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden lg:block bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Form</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Bệnh nhân</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Điểm số</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Rủi ro</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Ngày gửi</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSubmissions.map(submission => (
                  <tr key={submission.submissionId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{submission.formName}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{submission.patientName}</td>
                    <td className="px-4 py-3 text-sm text-blue-600">{submission.email || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-lg font-semibold text-sm">
                        {submission.totalScore || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {submission.riskLevel && (
                        <span className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold ${getRiskLevelColor(submission.riskLevel)}`}>
                          {submission.riskLevel}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {submission.submittedAt 
                        ? new Date(submission.submittedAt).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          })
                        : '-'
                      }
                    </td>
                    <td className="px-4 py-3 text-center">{getStatusBadge(submission.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          onClick={() => navigate(`/system/public-submissions/${submission.submissionId}`)}
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>
                        {submission.status !== 'RESPONDED' && (
                          <button
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            onClick={() => navigate(`/system/public-submissions/${submission.submissionId}/respond`)}
                            title="Trả lời"
                          >
                            <MessageSquare size={16} />
                          </button>
                        )}
                        <button
                          className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                          onClick={() => handleExportSubmission(submission.submissionId)}
                          title="Xuất Excel"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          onClick={() => handleArchiveSubmission(submission.submissionId)}
                          title="Lưu trữ"
                        >
                          <Archive size={16} />
                        </button>
                        <button
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          onClick={() => handleOpenDeleteModal(submission)}
                          title="Xóa nhập liệu"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      
      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6 sm:mt-8 p-4 bg-white rounded-xl shadow-md">
          <button
            disabled={pagination.page === 0}
            onClick={() => loadSubmissions(pagination.page - 1, filterStatus)}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            Trang trước
          </button>
          <span className="text-gray-700 font-medium text-sm sm:text-base">
            Trang {pagination.page + 1} / {pagination.totalPages}
          </span>
          <button
            disabled={pagination.page >= pagination.totalPages - 1}
            onClick={() => loadSubmissions(pagination.page + 1, filterStatus)}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm sm:text-base"
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
