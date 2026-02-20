import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForms } from "../../hooks/forms/useForms";
import { usePatients } from "../../hooks/forms/usePatients";
import api from "../../service/api";
import FormsHeader from "./FormsHeader";
import FormSelector from "./FormSelector";
import PatientSelector from "./PatientSelector";
import StartAssessmentButton from "./StartAssessmentButton";
import RecentResultsTable from "./RecentResultsTable";
import MessageDialog from "../common/MessageDialog";

const FormsPage = () => {
  const navigate = useNavigate();
  const { forms, loading: formsLoading, error: formsError } = useForms();
  const { patients, loading: patientsLoading, error: patientsError } = usePatients();
  const [selectedForm, setSelectedForm] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [messageDialog, setMessageDialog] = useState({
    open: false,
    title: "",
    description: "",
  });

  const openMessage = (title, description) => {
    setMessageDialog({ open: true, title, description });
  };

  const loading = formsLoading || patientsLoading;
  const error = formsError || patientsError;

  const handleStartForm = () => {
    if (!selectedForm || !selectedPatient) {
      openMessage("Thiếu thông tin", "Vui lòng chọn biểu mẫu và bệnh nhân.");
      return;
    }

    navigate(`/system/diagnostic-form/${selectedPatient}/${selectedForm}`);
  };

  const handleExportForm = () => {
    if (!selectedForm) {
      openMessage("Thiếu thông tin", "Vui lòng chọn biểu mẫu để xuất Excel.");
      return;
    }
    const exportExcel = async () => {
      try {
        const response = await api.get(
          `/api/assessments/export/excel?formId=${selectedForm}`,
          { responseType: "blob" },
        );
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `assessment_${selectedForm}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        openMessage("Xuất Excel", "Tệp Excel đang được tải xuống.");
      } catch (error) {
        console.error("Export error:", error);
        openMessage("Không thể xuất Excel", "Vui lòng kiểm tra quyền truy cập và thử lại.");
      }
    };

    exportExcel();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-bold text-lg mb-2">Lỗi</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FormsHeader selectedFormId={selectedForm} onExport={handleExportForm} />

      {(forms.length === 0 || patients.length === 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 font-semibold">Thông tin:</p>
          {forms.length === 0 && <p className="text-yellow-700">Chưa có biểu mẫu nào trong hệ thống</p>}
          {patients.length === 0 && <p className="text-yellow-700">Chưa có bệnh nhân nào</p>}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FormSelector
          forms={forms}
          selectedFormId={selectedForm}
          onSelect={setSelectedForm}
        />
        <PatientSelector
          patients={patients}
          selectedPatientId={selectedPatient}
          onSelect={setSelectedPatient}
          onAddPatient={() => navigate("/system/patients/new")}
        />
      </div>

      <StartAssessmentButton
        onStart={handleStartForm}
        disabled={!selectedForm || !selectedPatient}
      />

      <RecentResultsTable selectedPatientId={selectedPatient} />

      <MessageDialog
        open={messageDialog.open}
        title={messageDialog.title}
        description={messageDialog.description}
        onClose={() => setMessageDialog({ open: false, title: "", description: "" })}
        actionLabel="Đóng"
      />
    </div>
  );
};

export default FormsPage;
