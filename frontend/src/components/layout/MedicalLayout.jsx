import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  ClipboardList, 
  Search, 
  Activity, 
  Menu, 
  X,
  Stethoscope,
  Heart,
  ChevronRight
} from 'lucide-react';
import './MedicalLayout.css';

/**
 * Medical Layout Component
 * Professional medical-themed layout with navigation
 */
export const MedicalLayout = ({ children }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { path: '/', label: 'Trang chủ', icon: <Home size={20} /> },
    { path: '/forms', label: 'Nhập thông tin', icon: <ClipboardList size={20} /> },
    { path: '/check-result', label: 'Tra cứu kết quả', icon: <Search size={20} /> },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="medical-layout">
      {/* Header */}
      <header className="medical-header">
        <div className="header-container">
          <Link to="/" className="logo-section">
            <div className="logo-icon">
              <Stethoscope size={28} />
            </div>
            <div className="logo-text">
              <h1>Family Medicine</h1>
              <p>Hệ thống quản lý sức khỏe</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="mobile-nav">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`mobile-nav-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Breadcrumb */}
      {location.pathname !== '/' && (
        <div className="breadcrumb-container">
          <div className="breadcrumb">
            <Link to="/" className="breadcrumb-item">
              <Home size={16} />
              <span>Trang chủ</span>
            </Link>
            {location.pathname.split('/').filter(Boolean).map((segment, index, arr) => {
              const path = '/' + arr.slice(0, index + 1).join('/');
              const isLast = index === arr.length - 1;
              const label = getBreadcrumbLabel(segment);
              
              return (
                <React.Fragment key={path}>
                  <ChevronRight size={16} className="breadcrumb-separator" />
                  {isLast ? (
                    <span className="breadcrumb-item breadcrumb-current">{label}</span>
                  ) : (
                    <Link to={path} className="breadcrumb-item">{label}</Link>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="medical-main">
        <div className="content-container">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="medical-footer">
        <div className="footer-container">
          <div className="footer-section">
            <div className="footer-logo">
              <Heart size={24} className="footer-icon" />
              <span>Family Medicine</span>
            </div>
            <p className="footer-description">
              Hệ thống quản lý sức khỏe chuyên nghiệp, 
              đồng hành cùng sức khỏe gia đình bạn
            </p>
          </div>

          <div className="footer-section">
            <h3>Liên kết nhanh</h3>
            <ul className="footer-links">
              <li><Link to="/">Trang chủ</Link></li>
              <li><Link to="/forms">Nhập thông tin</Link></li>
              <li><Link to="/check-result">Tra cứu kết quả</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Liên hệ</h3>
            <ul className="footer-info">
              <li>Email: support@familymed.vn</li>
              <li>Hotline: 1900 xxxx</li>
              <li>Thời gian: 7:00 - 22:00 hàng ngày</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 Family Medicine. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

// Helper function for breadcrumb labels
function getBreadcrumbLabel(segment) {
  const labels = {
    'forms': 'Nhập thông tin',
    'check-result': 'Tra cứu kết quả',
    'thank-you': 'Cảm ơn',
    'doctor': 'Bác sĩ',
    'submissions': 'Hồ sơ',
    'results': 'Kết quả'
  };
  return labels[segment] || segment;
}

export default MedicalLayout;
