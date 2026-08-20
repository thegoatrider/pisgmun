import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  as?: 'input' | 'textarea' | 'select';
  options?: { value: string; label: string }[];
  rows?: number;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  as = 'input',
  options = [],
  rows = 3,
  className = '',
  id,
  children,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      
      {as === 'input' && (
        <input
          id={inputId}
          className="form-control"
          style={{ borderColor: error ? 'var(--color-error)' : undefined }}
          {...props}
        />
      )}

      {as === 'textarea' && (
        <textarea
          id={inputId}
          className="form-control"
          rows={rows}
          style={{
            borderColor: error ? 'var(--color-error)' : undefined,
            resize: 'vertical',
          }}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      )}

      {as === 'select' && (
        <select
          id={inputId}
          className="form-control"
          style={{ borderColor: error ? 'var(--color-error)' : undefined }}
          {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
        >
          {children || (
            <>
              <option value="">Select option</option>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </>
          )}
        </select>
      )}

      {error && (
        <span
          className="text-error"
          style={{ fontSize: '0.8rem', fontWeight: 600, marginTop: '2px' }}
        >
          {error}
        </span>
      )}

      {helperText && !error && (
        <span
          className="text-muted"
          style={{ fontSize: '0.78rem', marginTop: '2px' }}
        >
          {helperText}
        </span>
      )}
    </div>
  );
};
