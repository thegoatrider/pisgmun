import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children
}) => {
  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 32, 74, 0.45)', // Custom navy transparent mask
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
        onClick={onClose}
      />

      {/* Modal Card content */}
      <div
        className="fade-in"
        style={{
          position: 'relative',
          backgroundColor: 'var(--color-bg-surface)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          width: '100%',
          maxWidth: '550px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1001,
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Modal Top Accent line */}
        <div style={{ height: '4px', backgroundColor: 'var(--color-secondary)', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)' }} />

        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {title && (
            <h3
              style={{
                margin: 0,
                fontSize: '1.3rem',
                fontFamily: 'var(--font-display)',
                color: 'var(--color-primary)',
              }}
            >
              {title}
            </h3>
          )}
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              borderRadius: 'var(--radius-sm)',
              transition: 'background-color var(--transition-fast), color var(--transition-fast)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-bg-main)';
              e.currentTarget.style.color = 'var(--color-primary)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--color-text-muted)';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div
          style={{
            padding: '1.5rem',
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
