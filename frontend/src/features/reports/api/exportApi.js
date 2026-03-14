/**
 * Patient Report Export Service
 * Handles API calls for exporting patient reports.
 */
import api from '../../../service/api';

const exportApi = {
  exportPatientReportExcel: async ({ submissionId }) => {
    try {
      const response = await api.post(
        `/api/export/submission/${submissionId}`,
        {},
        {
          responseType: 'blob',
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error exporting submission:', error);
      throw error;
    }
  },

  downloadFile: (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  exportAndDownload: async (params) => {
    const blob = await exportApi.exportPatientReportExcel(params);
    const timestamp = new Date().toISOString().slice(0, 10);

    const safe = (s) => {
      if (!s) return '';
      return String(s)
        .replace(/[\\/:*?"<>|]/g, '')
        .trim()
        .replace(/\s+/g, '_');
    };

    const parts = [];
    if (params?.formName) parts.push(safe(params.formName));
    if (params?.patientCode) parts.push(safe(params.patientCode));
    if (params?.patientName) parts.push(safe(params.patientName));

    const filenameBase = parts.length > 0 ? parts.join('_') : 'BenhNhan_KetQua';
    const filename = `${filenameBase}_${timestamp}.xlsx`;
    exportApi.downloadFile(blob, filename);
  },

  getHospitalTemplate: async () => {
    try {
      const response = await api.get('/api/export/hospital-template');
      return response.data;
    } catch (error) {
      console.error('Error fetching hospital template:', error);
      throw error;
    }
  },
};

export default exportApi;
