import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const formService = {
    getAllForms: async () => {
        const response = await axios.get(`${API_URL}/api/forms`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    getFormById: async (id: string) => {
        const response = await axios.get(`${API_URL}/api/forms/${id}`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    createForm: async (form: any) => {
        const response = await axios.post(`${API_URL}/api/forms`, form, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    updateForm: async (id: string, form: any) => {
        const response = await axios.put(`${API_URL}/api/forms/${id}`, form, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    deleteForm: async (id: string) => {
        await axios.delete(`${API_URL}/api/forms/${id}`, {
            headers: getAuthHeader()
        });
    },

    submitForm: async (submission: any) => {
        const response = await axios.post(`${API_URL}/api/submissions`, submission, {
            headers: getAuthHeader()
        });
        return response.data;
    },
    
    getPatientSubmissions: async (patientId: string) => {
        const response = await axios.get(`${API_URL}/api/submissions/patient/${patientId}`, {
             headers: getAuthHeader()
        });
        return response.data;
    },

    exportSubmission: (submissionId: string) => {
        window.open(`${API_URL}/api/submissions/${submissionId}/export`, '_blank');
    }
};
