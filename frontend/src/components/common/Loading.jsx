import React from 'react';
import './Loading.css';

/**
 * Loading spinner component
 * Used for inline loading states, buttons, and small sections
 */
export const Loading = ({ size = 'medium', color = 'primary', className = '' }) => {
  const sizeClasses = {
    small: 'loading-spinner-sm',
    medium: 'loading-spinner-md',
    large: 'loading-spinner-lg'
  };

  const colorClasses = {
    primary: 'border-blue-600',
    white: 'border-white',
    gray: 'border-gray-600',
    medical: 'border-[#0ea5e9]'
  };

  return (
    <div className={`loading-spinner ${sizeClasses[size]} ${colorClasses[color]} ${className}`} />
  );
};

/**
 * Centered loading component for full sections
 */
export const LoadingCenter = ({ message = 'Đang tải...', size = 'large' }) => {
  return (
    <div className="loading-center">
      <Loading size={size} color="medical" />
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

/**
 * Skeleton loader for text content
 */
export const SkeletonText = ({ lines = 3, className = '' }) => {
  return (
    <div className={`skeleton-container ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="skeleton-line"
          style={{
            width: index === lines - 1 ? '70%' : '100%'
          }}
        />
      ))}
    </div>
  );
};

/**
 * Skeleton loader for card/box content
 */
export const SkeletonCard = ({ className = '' }) => {
  return (
    <div className={`skeleton-card ${className}`}>
      <div className="skeleton-header" />
      <div className="skeleton-body">
        <SkeletonText lines={4} />
      </div>
    </div>
  );
};

/**
 * Button with loading state
 */
export const LoadingButton = ({ 
  loading = false, 
  children, 
  onClick, 
  disabled = false,
  className = '',
  ...props 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`loading-button ${loading ? 'loading' : ''} ${className}`}
      {...props}
    >
      {loading && <Loading size="small" color="white" className="mr-2" />}
      {children}
    </button>
  );
};

export default Loading;
