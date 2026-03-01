import React, { useRef, useState } from 'react';
import { Upload, Download, FileJson } from 'lucide-react';
import Button from '../ui/Button';
import './TemplateImportExport.css';

/**
 * Component để import/export form templates từ JSON
 */
export const TemplateImportExport = ({ onImport, formData }) => {
  const fileInputRef = useRef(null);
  const [importing, setImporting] = useState(false);
  
  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      setImporting(true);
      const text = await file.text();
      const template = JSON.parse(text);
      
      if (onImport) {
        onImport(template);
      }
    } catch (error) {
      alert('Lỗi khi đọc file: ' + error.message);
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };
  
  const handleExport = () => {
    if (!formData) {
      alert('Không có dữ liệu để export');
      return;
    }
    
    const dataStr = JSON.stringify(formData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `form-${formData.formName?.replace(/\s+/g, '-')}-${new Date().getTime()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="template-import-export">
      <div className="ie-header">
        <h4><FileJson size={18} /> Import/Export Templates</h4>
      </div>
      
      <div className="ie-actions">
        <Button 
          variant="secondary" 
          size="small"
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
        >
          <Upload size={14} />
          {importing ? 'Đang import...' : 'Import từ JSON'}
        </Button>
        
        <Button 
          variant="secondary"
          size="small"
          onClick={handleExport}
          disabled={!formData}
        >
          <Download size={14} />
          Export JSON
        </Button>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      <div className="ie-help">
        <p>💡 <strong>Cách dùng:</strong></p>
        <ul>
          <li><strong>Export:</strong> Tải form hiện tại xuống dạng JSON để backup hoặc chia sẻ</li>
          <li><strong>Import:</strong> Tải file JSON để tạo form từ template có sẵn</li>
        </ul>
      </div>
    </div>
  );
};

export default TemplateImportExport;
