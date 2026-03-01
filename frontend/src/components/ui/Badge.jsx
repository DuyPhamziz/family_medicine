import React from 'react';

/**
 * Badge component for status/tags/labels
 */
const Badge = ({
  variant = 'neutral',
  size = 'md',
  children,
  icon: Icon,
  ...props
}) => {
  const variantStyles = {
    neutral: 'bg-slate-100 text-slate-800',
    success: 'bg-emerald-100 text-emerald-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-amber-100 text-amber-800',
    info: 'bg-blue-100 text-blue-800',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full font-medium
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        transition-opacity duration-200
      `}
      {...props}
    >
      {Icon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />}
      {children}
    </span>
  );
};

export default Badge;
