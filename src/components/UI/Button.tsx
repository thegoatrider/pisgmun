import React from 'react';
import { Spinner } from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  disabled,
  style,
  ...props
}) => {
  // Styles based on variant
  const getStyles = () => {
    let base = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-sans)',
      fontWeight: '700',
      textTransform: 'uppercase' as const,
      letterSpacing: '1px',
      border: '2px solid transparent',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      transition: 'background-color var(--transition-fast), border-color var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast)',
      gap: '8px',
    };

    let paddingSize = {
      sm: { padding: '0.4rem 1rem', fontSize: '0.75rem' },
      md: { padding: '0.75rem 1.75rem', fontSize: '0.85rem' },
      lg: { padding: '1rem 2.25rem', fontSize: '0.95rem' },
    }[size];

    let variants = {
      primary: {
        backgroundColor: 'var(--color-primary)',
        borderColor: 'var(--color-primary)',
        color: '#ffffff',
      },
      secondary: {
        backgroundColor: 'var(--color-secondary)',
        borderColor: 'var(--color-secondary)',
        color: '#ffffff',
      },
      outline: {
        backgroundColor: 'transparent',
        borderColor: 'var(--color-primary)',
        color: 'var(--color-primary)',
      },
      danger: {
        backgroundColor: 'var(--color-error)',
        borderColor: 'var(--color-error)',
        color: '#ffffff',
      },
      gold: {
        backgroundColor: 'var(--color-accent-gold)',
        borderColor: 'var(--color-accent-gold)',
        color: '#ffffff',
      }
    }[variant];

    // Disabled state
    if (disabled || loading) {
      variants = {
        ...variants,
        backgroundColor: 'var(--color-border)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-text-muted)',
      };
    }

    return { ...base, ...paddingSize, ...variants };
  };

  return (
    <button
      className={`btn-${variant} ${className}`}
      style={{ ...getStyles(), ...style }}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size="sm" light={variant !== 'outline'} />}
      {children}
    </button>
  );
};
