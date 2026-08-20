import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  glass?: boolean;
  elevation?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = true,
  glass = false,
  elevation = 'md',
  className = '',
  style,
  ...props
}) => {
  const getStyles = () => {
    const base: React.CSSProperties = {
      backgroundColor: glass ? 'rgba(255, 255, 255, 0.85)' : 'var(--color-bg-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-lg)',
      transition: 'transform var(--transition-normal), box-shadow var(--transition-normal), border-color var(--transition-normal)',
      position: 'relative',
      overflow: 'hidden',
    };

    const shadows = {
      none: { boxShadow: 'none' },
      sm: { boxShadow: 'var(--shadow-sm)' },
      md: { boxShadow: 'var(--shadow-md)' },
      lg: { boxShadow: 'var(--shadow-lg)' },
    }[elevation];

    const glassEffects: React.CSSProperties = glass
      ? {
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderColor: 'rgba(255, 255, 255, 0.4)',
        }
      : {};

    return { ...base, ...shadows, ...glassEffects };
  };

  return (
    <div
      className={`portal-card ${hoverable ? 'hoverable' : ''} ${className}`}
      style={{
        ...getStyles(),
        ...style,
      }}
      {...props}
    >
      {/* Subtle border accent top color bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          backgroundColor: 'transparent',
          transition: 'background-color var(--transition-fast)',
        }}
        className="card-top-accent"
      />
      {children}
    </div>
  );
};
