import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LogOut, Settings, User, BarChart3, Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/auth/useAuth';
import Button from '../ui/Button';
import { ROLES } from '../../constants/roles';
import { Icons } from '../../constants/index';

const CATEGORIES = [
  { id: 'cardiology', label: '❤️ Tim mạch', code: 'CARDIOLOGY' },
  { id: 'endocrinology', label: '🩺 Nội tiết', code: 'ENDOCRINOLOGY' },
  { id: 'respiratory', label: '🫁 Hô hấp', code: 'RESPIRATORY' },
  { id: 'neurology', label: '🧠 Thần kinh', code: 'NEUROLOGY' },
  { id: 'general', label: '📋 Tổng quát', code: 'GENERAL' },
];

const TopNavigation = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef(null);
  const categoryMenuRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target)) {
        setShowCategoryMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
    setShowUserMenu(false);
  };

  const isAdmin = user?.role === ROLES.ADMIN;
  const displayName = user?.fullName || user?.name || user?.email;
  const userInitial = displayName?.charAt(0).toUpperCase() || 'U';

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-6">
        {/* Logo */}
        <button
          type="button"
          onClick={() => navigate('/system/dashboard')}
          className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity"
        >
          <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
            <Icons.Risk />
          </div>
          <span className="font-bold text-lg text-slate-900 hidden sm:inline">
            FamilyMed
          </span>
        </button>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="flex-1 max-w-md hidden sm:block"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>
        </form>

        {/* Categories Dropdown */}
        <div ref={categoryMenuRef} className="relative hidden md:block">
          <button
            type="button"
            onClick={() => setShowCategoryMenu(!showCategoryMenu)}
            className="px-3 py-2 rounded-lg hover:bg-slate-100 text-sm font-medium text-slate-700 transition-colors"
          >
            Danh mục
          </button>
          {showCategoryMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    navigate(`/?category=${cat.code}`);
                    setShowCategoryMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm text-slate-700 transition-colors"
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Admin Link */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => navigate('/system/admin')}
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-amber-50 text-sm font-medium text-amber-700 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Admin
          </button>
        )}

        {/* User Menu */}
        <div ref={userMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-700">
              {userInitial}
            </div>
            <span className="hidden sm:inline text-sm font-medium text-slate-700">
              {displayName?.split(' ')[0]}
            </span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs text-slate-500">Đã đăng nhập thành</p>
                <p className="font-semibold text-slate-900 text-sm">{displayName}</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/system/profile')}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm text-slate-700 transition-colors flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Hồ sơ cá nhân
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm text-red-700 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default TopNavigation;
