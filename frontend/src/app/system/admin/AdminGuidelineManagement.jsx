import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, SearchX } from 'lucide-react';
import { guidelinesApi } from '../../../api/guidelinesApi';
import api from '../../../service/api';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import FormInput from '../../../components/ui/FormInput';
import AdminSearchBar from '../../../components/admin/AdminSearchBar';
import AdminTable from '../../../components/admin/AdminTable';
import ConfirmationModal from '../../../components/ui/ConfirmationModal';
import { showSuccess, showError } from '../../../utils/toastNotifications';
import TwoColumnFormLayout from '../../../components/form/TwoColumnFormLayout';

const AdminGuidelineManagement = () => {
  const navigate = useNavigate();
  const [guidelines, setGuidelines] = useState([]);
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category: '',
    status: 'DRAFT',
    owner: '',
    formId: '',
    recommendations: '',
    referenceList: '',
  });

  // Load guidelines and forms
  const loadData = async () => {
    try {
      setLoading(true);
      const [guidelinesData, formsResponse] = await Promise.all([
        guidelinesApi.getAll(),
        api.get('/api/forms/admin/all'),
      ]);
      setGuidelines(guidelinesData);
      setForms(formsResponse.data || []);
    } catch (err) {
      console.error('Error loading data:', err);
      showError('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter guidelines
  const filteredGuidelines = guidelines.filter((g) =>
    g.title?.toLowerCase().includes(searchText.toLowerCase()) ||
    g.category?.toLowerCase().includes(searchText.toLowerCase())
  );

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle textarea change
  const handleTextareaChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Open modal for create or edit
  const openModal = (guideline = null) => {
    if (guideline) {
      setEditingId(guideline.id);
      setFormData({
        title: guideline.title,
        summary: guideline.summary || '',
        content: guideline.content || '',
        category: guideline.category || '',
        status: guideline.status || 'DRAFT',
        owner: guideline.owner || '',
        formId: guideline.formId || '',
        recommendations: guideline.recommendations || '',
        referenceList: guideline.referenceList || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        summary: '',
        content: '',
        category: '',
        status: 'DRAFT',
        owner: '',
        formId: '',
        recommendations: '',
        referenceList: '',
      });
    }
    setShowModal(true);
  };

  // Save guideline
  const handleSave = async () => {
    if (!formData.title.trim()) {
      showError('Vui lòng nhập tiêu đề');
      return;
    }

    try {
      setSubmitting(true);
      if (editingId) {
        await guidelinesApi.update(editingId, formData);
        showSuccess('Cập nhật thành công');
      } else {
        await guidelinesApi.create(formData);
        showSuccess('Tạo thành công');
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      console.error('Error saving guideline:', err);
      showError('Lỗi khi lưu');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete guideline
  const handleDelete = async () => {
    if (!confirmDelete) return;

    try {
      setSubmitting(true);
      await guidelinesApi.delete(confirmDelete);
      showSuccess('Xóa thành công');
      await loadData();
      setConfirmDelete(null);
    } catch (err) {
      console.error('Error deleting guideline:', err);
      showError('Lỗi khi xóa');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Quản lý Hướng dẫn lâm sàng
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            {filteredGuidelines.length} hướng dẫn
          </p>
        </div>
        <Button
          onClick={() => openModal()}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Thêm hướng dẫn
        </Button>
      </div>

      {/* Search */}
      <AdminSearchBar
        value={searchText}
        onChange={setSearchText}
        placeholder="Tìm hướng dẫn..."
      />

      {/* Guidelines List */}
      {filteredGuidelines.length > 0 ? (
        <div className="space-y-4">
          {filteredGuidelines.map((guideline) => (
            <Card key={guideline.id} elevated>
              <Card.Header>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {guideline.title}
                    </h3>
                    {guideline.category && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {guideline.category}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      guideline.status === 'PUBLISHED'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {guideline.status}
                  </span>
                </div>
              </Card.Header>

              <Card.Content>
                {guideline.summary && (
                  <p className="text-slate-700 dark:text-slate-300 mb-3">
                    {guideline.summary}
                  </p>
                )}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Người tạo</p>
                    <p className="text-slate-900 dark:text-slate-100 font-medium">
                      {guideline.owner || 'Chưa xác định'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Cập nhật</p>
                    <p className="text-slate-900 dark:text-slate-100 font-medium">
                      {guideline.updatedAt
                        ? new Date(guideline.updatedAt).toLocaleDateString('vi-VN')
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </Card.Content>

              <Card.Footer>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openModal(guideline)}
                    className="flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Sửa
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setConfirmDelete(guideline.id)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Xóa
                  </Button>
                </div>
              </Card.Footer>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <SearchX className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-500">Không tìm thấy hướng dẫn</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <Card.Header>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {editingId ? 'Cập nhật hướng dẫn' : 'Tạo hướng dẫn mới'}
              </h2>
            </Card.Header>

            <Card.Content>
              <TwoColumnFormLayout isLoading={submitting}>
                <FormInput
                  label="Tiêu đề *"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Vd: Khuyến cáo điều trị tiểu đường"
                />

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                    Danh mục
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700
                             bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100
                             focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Chọn danh mục</option>
                    <option value="Tim mạch">Tim mạch</option>
                    <option value="Hô hấp">Hô hấp</option>
                    <option value="Thần kinh">Thần kinh</option>
                    <option value="Nhiễm trùng">Nhiễm trùng</option>
                    <option value="Hồi sức">Hồi sức</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                    Trạng thái
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700
                             bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100
                             focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="DRAFT">Bản nháp</option>
                    <option value="PUBLISHED">Đã xuất bản</option>
                  </select>
                </div>

                <FormInput
                  label="Người tạo"
                  name="owner"
                  value={formData.owner}
                  onChange={handleInputChange}
                  placeholder="Vd: BS. Nguyễn Văn A"
                />

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                    Liên kết máy tính
                  </label>
                  <select
                    name="formId"
                    value={formData.formId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700
                             bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100
                             focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Không liên kết</option>
                    {forms.map((form) => (
                      <option key={form.formId} value={form.formId}>
                        {form.formName}
                      </option>
                    ))}
                  </select>
                </div>
              </TwoColumnFormLayout>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                    Tóm tắt
                  </label>
                  <textarea
                    name="summary"
                    value={formData.summary}
                    onChange={(e) => handleTextareaChange('summary', e.target.value)}
                    rows="3"
                    placeholder="Tóm tắt ngắn gọn về hướng dẫn"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700
                             bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100
                             focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                    Nội dung chi tiết
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={(e) => handleTextareaChange('content', e.target.value)}
                    rows="4"
                    placeholder="Nội dung đầy đủ của hướng dẫn lâm sàng"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700
                             bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100
                             focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                    Khuyến cáo (JSON array)
                  </label>
                  <textarea
                    name="recommendations"
                    value={formData.recommendations}
                    onChange={(e) => handleTextareaChange('recommendations', e.target.value)}
                    rows="3"
                    placeholder='["Khuyến cáo 1", "Khuyến cáo 2"]'
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700
                             bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100
                             focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                    Tài liệu tham khảo (JSON array)
                  </label>
                  <textarea
                    name="referenceList"
                    value={formData.referenceList}
                    onChange={(e) => handleTextareaChange('referenceList', e.target.value)}
                    rows="3"
                    placeholder='[{"title": "...", "authors": "...", "year": 2024}]'
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700
                             bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100
                             focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
                  />
                </div>
              </div>
            </Card.Content>

            <Card.Footer>
              <div className="flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleSave}
                  isLoading={submitting}
                >
                  {editingId ? 'Cập nhật' : 'Tạo'}
                </Button>
              </div>
            </Card.Footer>
          </Card>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        open={!!confirmDelete}
        title="Xóa hướng dẫn?"
        message="Bạn có chắc muốn xóa hướng dẫn này? Thao tác này không thể hoàn tác."
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        isLoading={submitting}
      />
    </div>
  );
};

export default AdminGuidelineManagement;
