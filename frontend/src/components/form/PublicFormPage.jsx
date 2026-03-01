// components/form/PublicFormPage.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DynamicFormRenderer } from './DynamicFormRenderer';
import { publicFormApi } from '../../api/formsApi';
import './PublicFormPage.css';

/**
 * Public form page - accessible without authentication
 * Users can view and submit forms via token-based access
 */
export const PublicFormPage = () => {
  const { token } = useParams();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  useEffect(() => {
    fetchPublicForm();
  }, [token]);
  
  const fetchPublicForm = async () => {
    try {
      setLoading(true);
      const data = await publicFormApi.getPublicForm(token);
      setFormData(data);
      setError(null);
    } catch (err) {
      setError('Form not found or expired');
      console.error('Error loading form:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (answers) => {
    try {
      const payload = {
        patientName,
        email,
        phone,
        answers
      };
      
      await publicFormApi.submitPublicForm(token, payload);
      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit form. Please try again.');
      console.error('Error submitting form:', err);
    }
  };
  
  if (loading) {
    return <div className="public-form-container"><div className="spinner">Loading form...</div></div>;
  }
  
  if (error) {
    return (
      <div className="public-form-container">
        <div className="form-error">
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  if (submitted) {
    return (
      <div className="public-form-container">
        <div className="success-message">
          <h3>✓ Thank you!</h3>
          <p>{formData?.successMessage || 'Your form has been successfully submitted.'}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div
      className="public-form-container"
      style={formData?.customCss ? { backgroundColor: formData.customCss } : {}}
    >
      <div className="public-form-wrapper">
        <div className="public-form-header">
          <h1>{formData?.title}</h1>
          {formData?.description && <p>{formData.description}</p>}
        </div>

        <div className="contact-info-section">
          <div className="form-group">
            <label htmlFor="patientName">Họ tên</label>
            <input
              type="text"
              id="patientName"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+84..."
              className="form-input"
            />
          </div>
        </div>
        
        <DynamicFormRenderer
          formSchema={formData}
          formId={token}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};
