import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { assessmentAPI, indicatorAPI } from '../../../service/api-extended';

const PatientFormSubmission = ({ patientId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchSubmissions();
  }, [patientId]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const response = await assessmentAPI.getAssessmentsByPatient(patientId);
      setSubmissions(response.data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await assessmentAPI.deleteAssessment(id);
        setSubmissions(submissions.filter(s => s.assessmentId !== id));
      } catch (error) {
        console.error('Error deleting submission:', error);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Patient Form Submissions</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          New Submission
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No submissions found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Form ID</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Risk Level</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr key={submission.assessmentId} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-800">{submission.form?.formCode}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {new Date(submission.assessmentDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      submission.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      submission.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {submission.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      submission.riskLevel === 'HIGH' ? 'bg-red-100 text-red-800' :
                      submission.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {submission.riskLevel}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm space-x-2">
                    <button className="text-blue-600 hover:text-blue-800">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-800">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(submission.assessmentId)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PatientFormSubmission;
