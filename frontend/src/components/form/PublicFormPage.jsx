// components/form/PublicFormPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { DynamicFormRenderer } from './DynamicFormRenderer';
import { publicFormApi } from '../../api/formsApi';
import { 
  Heart, 
  Stethoscope, 
  User, 
  Mail, 
  Phone, 
  Home,
  CheckCircle,
  AlertCircle,
  Loader,
  ArrowLeft
} from 'lucide-react';

/**
 * Public form page - accessible without authentication
 * Modern medical-themed design with Tailwind CSS
 */
export const PublicFormPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);
  const [patientName, setPatientName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Anti-spam fields
  const [sessionToken, setSessionToken] = useState(null);
  const [formLoadTime, setFormLoadTime] = useState(null);
  const [honeypot, setHoneypot] = useState(''); // Should remain empty
  const [remainingSubmissions, setRemainingSubmissions] = useState(null);
  
  useEffect(() => {
    fetchPublicForm();
  }, [token]);
  
  const fetchPublicForm = async () => {
    try {
      setLoading(true);
      const data = await publicFormApi.getPublicForm(token);
      console.log('[PublicFormPage] Form data received from backend:', data);
      
      // Log all questions to check displayCondition
      if (data?.sections) {
        data.sections.forEach(section => {
          section.questions?.forEach(q => {
            console.log(`[PublicFormPage] Question ${q.questionCode}:`, {
              questionCode: q.questionCode,
              questionText: q.questionText,
              displayCondition: q.displayCondition
            });
          });
        });
      }
      
      setFormData(data);
      setSessionToken(data.sessionToken); // Get session token from backend
      setFormLoadTime(Date.now()); // Record load time
      setRemainingSubmissions(data.remainingSubmissions); // Track remaining submissions
      setError(null);
    } catch (err) {
      setError('Form not found or expired');
      console.error('Error loading form:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async (answers) => {
    // simple front‑end check for required contact fields
    const newErrors = {};
    if (!patientName || patientName.trim() === '') {
      newErrors.patientName = 'Vui lòng nhập họ tên';
    }
    if (!email || email.trim() === '') {
      newErrors.email = 'Vui lòng nhập email';
    }
    if (!phone || phone.trim() === '') {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    try {
      const payload = {
        patientName,
        email,
        phone,
        answers,
        sessionToken,        // Anti-spam: session token
        honeypot,            // Anti-spam: should be empty
        formLoadTime         // Anti-spam: when form was loaded
      };
      
      const response = await publicFormApi.submitPublicForm(token, payload);
      
      // Store submission data for thank you page
      setSubmissionData({
        submissionId: response.submissionId || response.id,
        patientName,
        phone,
        submittedAt: new Date().toISOString()
      });
      
      setSubmitted(true);
      
      // Redirect to thank you page after 2 seconds
      setTimeout(() => {
        const params = new URLSearchParams({
          submissionId: response.submissionId || response.id || 'N/A',
          patientName: patientName,
          patientPhone: phone,
          submittedAt: new Date().toISOString()
        });
        navigate(`/thank-you?${params.toString()}`);
      }, 2000);
      
    } catch (err) {
      // Display anti-spam error messages to user
      const errorMessage = err.response?.data?.message || err.message || 'Failed to submit form. Please try again.';
      setError(errorMessage);
      console.error('Error submitting form:', err);
      
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-blue-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-gray-800">Family Medicine</h1>
                  <p className="text-xs text-gray-500 hidden sm:block">Hệ thống khám bệnh từ xa</p>
                </div>
              </div>
              <Link 
                to="/" 
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Trang chủ</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Loading State */}
        <div className="flex items-center justify-center py-20 sm:py-32">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 animate-pulse">
              <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Đang tải biểu mẫu...</h3>
            <p className="text-sm text-gray-500">Vui lòng chờ trong giây lát</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-blue-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-gray-800">Family Medicine</h1>
                  <p className="text-xs text-gray-500 hidden sm:block">Hệ thống khám bệnh từ xa</p>
                </div>
              </div>
              <Link 
                to="/" 
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Trang chủ</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Error State */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-pink-500 px-6 py-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-4">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Không tìm thấy biểu mẫu</h3>
            </div>
            <div className="px-6 py-8 text-center">
              <p className="text-gray-600 mb-6">{error}</p>
              <p className="text-sm text-gray-500 mb-8">Biểu mẫu có thể đã hết hạn hoặc không tồn tại. Vui lòng liên hệ bác sĩ để được hỗ trợ.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link 
                  to="/" 
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Quay về trang chủ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-green-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-gray-800">Family Medicine</h1>
                  <p className="text-xs text-gray-500 hidden sm:block">Hệ thống khám bệnh từ xa</p>
                </div>
              </div>
              <Link 
                to="/" 
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Trang chủ</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Success State */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-4 animate-bounce">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">Gửi thành công!</h3>
              <p className="text-green-50 text-lg">Cảm ơn bạn đã hoàn thành biểu mẫu</p>
            </div>
            <div className="px-6 py-8 text-center">
              <p className="text-gray-700 mb-2 font-medium">
                {formData?.successMessage || 'Biểu mẫu của bạn đã được ghi nhận thành công.'}
              </p>
              <p className="text-sm text-gray-500 mb-8">
                Bác sĩ sẽ xem xét và phản hồi trong thời gian sớm nhất. 
                Vui lòng kiểm tra email hoặc tin nhắn Zalo để nhận kết quả.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
                <div className="flex items-center justify-center gap-2 text-blue-800 mb-2">
                  <Heart className="w-5 h-5" />
                  <span className="font-semibold">Đang chuyển hướng...</span>
                </div>
                <p className="text-sm text-blue-600">Bạn sẽ được chuyển đến trang cảm ơn</p>
              </div>
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <Home className="w-5 h-5" />
                Về trang chủ
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Medical Header */}
      <div className="bg-white shadow-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-800">Family Medicine</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Hệ thống khám bệnh từ xa</p>
              </div>
            </div>
            <Link 
              to="/" 
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Trang chủ</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden mb-8">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 sm:px-8 py-8 sm:py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-2xl mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">
              {formData?.title || formData?.formName || 'Biểu mẫu khám bệnh'}
            </h1>
            {formData?.description && (
              <p className="text-base sm:text-lg text-blue-50 max-w-2xl mx-auto leading-relaxed">
                {formData.description}
              </p>
            )}
          </div>
          
          {/* Error Banner - shows submission errors */}
          {error && !loading && (
            <div className="bg-red-50 border-l-4 border-red-500 px-6 py-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-800 mb-1">Không thể gửi biểu mẫu</h3>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Patient Info Section */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 px-6 sm:px-8 py-6 sm:py-8 border-b border-blue-100">
            <div className="flex items-center gap-2 mb-6">
              <User className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Thông tin cá nhân</h2>
            </div>
            
            {/* Rate Limit Warning */}
            {remainingSubmissions !== null && remainingSubmissions <= 3 && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-semibold">
                    Bạn còn {remainingSubmissions} lần gửi form hôm nay
                  </span>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Honeypot field - hidden from humans, visible to bots */}
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex="-1"
                autoComplete="off"
                style={{
                  position: 'absolute',
                  left: '-9999px',
                  width: '1px',
                  height: '1px',
                  opacity: 0
                }}
                aria-hidden="true"
              />
              
              {/* Name Input */}
              <div className="space-y-2">
                <label htmlFor="patientName" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <User className="w-4 h-4 text-blue-500" />
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="patientName"
                  value={patientName}
                  onChange={(e) => {
                    setPatientName(e.target.value);
                    setFieldErrors(prev => ({ ...prev, patientName: null }));
                  }}
                  placeholder="Nguyễn Văn A"
                  required
                  className="w-full px-4 py-3 sm:py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none text-base placeholder-gray-400"
                />
                {fieldErrors.patientName && <p className="text-red-500 text-sm mt-1">{fieldErrors.patientName}</p>}
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Mail className="w-4 h-4 text-blue-500" />
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFieldErrors(prev => ({ ...prev, email: null }));
                  }}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3 sm:py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none text-base placeholder-gray-400"
                />
                {fieldErrors.email && <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>}
              </div>

              {/* Phone Input */}
              <div className="space-y-2">
                <label htmlFor="phone" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Phone className="w-4 h-4 text-blue-500" />
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setFieldErrors(prev => ({ ...prev, phone: null }));
                  }}
                  placeholder="0912345678"
                  required
                  className="w-full px-4 py-3 sm:py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none text-base placeholder-gray-400"
                />
                {fieldErrors.phone && <p className="text-red-500 text-sm mt-1">{fieldErrors.phone}</p>}
              </div>
            </div>
          </div>
          
          {/* Dynamic Form Content */}
          <div className="px-6 sm:px-8 py-6 sm:py-8">
            <DynamicFormRenderer
              formSchema={formData}
              formId={token}
              onSubmit={handleSubmit}
            />
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-white rounded-xl shadow-md border border-blue-100 px-6 py-4 text-center">
          <p className="text-sm text-gray-600">
            Cần hỗ trợ? Liên hệ: <a href="tel:1900xxxx" className="text-blue-600 font-semibold hover:underline">1900 xxxx</a> hoặc{' '}
            <a href="mailto:support@familymed.vn" className="text-blue-600 font-semibold hover:underline">support@familymed.vn</a>
          </p>
        </div>
      </div>
    </div>
  );
};

