/**
 * Patient Report Export Service
 * Handles API calls for exporting patient reports
 * Now uses new dynamic Excel endpoint
 */
import api from '../service/api';

const exportApi = {
  /**
   * Export patient report as Excel file - NEW DYNAMIC ENDPOINT
   * @param {Object} params - Export parameters
   * @param {string} params.submissionId - Form submission UUID
   * @returns {Promise<Blob>} Excel file as Blob
   */
  exportPatientReportExcel: async ({ submissionId }) => {
    try {
      // Use new dynamic Excel export endpoint
      const response = await api.post(
        `/api/export/submission/${submissionId}`,
        {},
        {
          responseType: 'blob', // Important: get response as blob
        }
      );
      return response.data; // Return the blob
    } catch (error) {
      console.error('Error exporting submission:', error);
      throw error;
    }
  },

  /**
   * Download a blob as a file
   * @param {Blob} blob - File blob to download
   * @param {string} filename - Name of the file to save
   */
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

  /**
   * Export patient report and auto-download
   * @param {Object} params - Export parameters
   * @returns {Promise<void>}
   */
  exportAndDownload: async (params) => {
    const blob = await exportApi.exportPatientReportExcel(params);
    const timestamp = new Date().toISOString().slice(0, 10);

    // Build filename: formName + patientCode + patientName + date
    const safe = (s) => {
      if (!s) return '';
      return String(s)
        .replace(/[\\/:*?"<>|]/g, '') // remove invalid file chars
        .trim()
        .replace(/\s+/g, '_');
    };

    const parts = [];
    if (params?.formName) parts.push(safe(params.formName));
    if (params?.patientCode) parts.push(safe(params.patientCode));
    if (params?.patientName) parts.push(safe(params.patientName));

    const filenameBase = parts.length > 0 ? parts.join('_') : `BenhNhan_KetQua`;
    const filename = `${filenameBase}_${timestamp}.xlsx`;
    exportApi.downloadFile(blob, filename);
  },

  /**
   * Get hospital template configuration
   * @returns {Promise<Object>} Hospital template config
   */
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
