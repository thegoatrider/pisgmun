import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  light?: boolean;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', light = false }) => {
  const dimensions = {
    sm: '16px',
    md: '24px',
    lg: '36px',
  }[size];

  const borderThickness = size === 'sm' ? '2px' : '3px';

  return (
    <div
      className="spin"
      style={{
        width: dimensions,
        height: dimensions,
        borderRadius: '50%',
        border: `${borderThickness} solid ${light ? 'rgba(255, 255, 255, 0.2)' : 'rgba(12, 86, 179, 0.15)'}`,
        borderTopColor: light ? '#ffffff' : 'var(--color-secondary)',
        display: 'inline-block',
      }}
      aria-label="Loading"
      role="status"
    />
  );
};
