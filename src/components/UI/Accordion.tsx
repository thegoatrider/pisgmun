import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionItem {
  title: React.ReactNode;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
}

export const Accordion: React.FC<AccordionProps> = ({ items, allowMultiple = false }) => {
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);

  const handleToggle = (index: number) => {
    if (allowMultiple) {
      if (openIndexes.includes(index)) {
        setOpenIndexes(openIndexes.filter((i) => i !== index));
      } else {
        setOpenIndexes([...openIndexes, index]);
      }
    } else {
      if (openIndexes.includes(index)) {
        setOpenIndexes([]);
      } else {
        setOpenIndexes([index]);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
      {items.map((item, idx) => {
        const isOpen = openIndexes.includes(idx);
        return (
          <div
            key={idx}
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
              boxShadow: isOpen ? 'var(--shadow-md)' : 'var(--shadow-sm)',
            }}
          >
            {/* Header / Click Trigger */}
            <button
              onClick={() => handleToggle(idx)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.1rem 1.4rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                color: 'var(--color-primary)',
                fontFamily: 'var(--font-sans)',
                fontWeight: 700,
                fontSize: '0.98rem',
                gap: '1rem',
              }}
            >
              <span>{item.title}</span>
              <ChevronDown
                size={18}
                style={{
                  color: 'var(--color-text-muted)',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform var(--transition-normal)',
                  flexShrink: 0,
                }}
              />
            </button>

            {/* Collapsible Content */}
            <div
              style={{
                maxHeight: isOpen ? '1000px' : '0px',
                overflow: 'hidden',
                transition: 'max-height var(--transition-slow) cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <div
                style={{
                  padding: '0 1.4rem 1.4rem 1.4rem',
                  borderTop: '1px solid var(--color-border)',
                  backgroundColor: 'rgba(248, 250, 252, 0.4)',
                  color: 'var(--color-text-main)',
                  fontSize: '0.92rem',
                  lineHeight: '1.65',
                }}
              >
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
