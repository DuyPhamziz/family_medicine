import React from 'react';
import { 
  Eye, 
  Copy, 
  FileJson, 
  Sparkles, 
  TestTube,
  RefreshCw 
} from 'lucide-react';
import Button from '../ui/Button';
import './QuickActions.css';

/**
 * Quick action menu cho admin - các thao tác nhanh khi quản lý form
 */
export const QuickActions = ({ 
  formId, 
  onPreview, 
  onDuplicate, 
  onExportJSON, 
  onAutoFill, 
  onTestForm,
  onRefresh 
}) => {
  return (
    <div className="quick-actions">
      <div className="actions-header">
        <Sparkles size={16} />
        <span>Thao tác nhanh</span>
      </div>
      <div className="actions-grid">
        {onPreview && (
          <button className="action-btn preview" onClick={onPreview} title="Xem trước form">
            <Eye size={18} />
            <span>Xem trước</span>
          </button>
        )}
        
        {onDuplicate && (
          <button className="action-btn duplicate" onClick={onDuplicate} title="Nhân bản form">
            <Copy size={18} />
            <span>Nhân bản</span>
          </button>
        )}
        
        {onExportJSON && (
          <button className="action-btn export" onClick={onExportJSON} title="Xuất ra JSON">
            <FileJson size={18} />
            <span>Xuất JSON</span>
          </button>
        )}
        
        {onAutoFill && (
          <button className="action-btn autofill" onClick={onAutoFill} title="Tự động điền dữ liệu mẫu">
            <Sparkles size={18} />
            <span>Tự động điền</span>
          </button>
        )}
        
        {onTestForm && (
          <button className="action-btn test" onClick={onTestForm} title="Test form validation">
            <TestTube size={18} />
            <span>Test</span>
          </button>
        )}
        
        {onRefresh && (
          <button className="action-btn refresh" onClick={onRefresh} title="Làm mới dữ liệu">
            <RefreshCw size={18} />
            <span>Làm mới</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default QuickActions;
