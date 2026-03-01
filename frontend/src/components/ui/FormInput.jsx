import React from 'react';

/**
 * FormInput component for consistent text input styling
 */
const FormInput = React.forwardRef(
  (
    {
      label,
      error,
      helperText,
      fullWidth = true,
      size = 'md',
      icon: Icon,
      ...props
    },
    ref
  ) => {
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-5 py-3 text-lg',
    };

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          )}
          <input
            ref={ref}
            className={`
              ${sizeStyles[size]}
              w-full rounded-lg border
              ${
                error
                  ? 'border-red-500 bg-red-50'
                  : 'border-slate-2 00 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
              }
              transition-colors duration-200
              focus:outline-none
              disabled:bg-slate-100 disabled:cursor-not-allowed
              ${Icon ? 'pl-9' : ''}
            `}
            {...props}
          />
        </div>

        {(error || helperText) && (
          <p
            className={`mt-1 text-xs ${
              error ? 'text-red-600' : 'text-slate-500'
            }`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

export default FormInput;
