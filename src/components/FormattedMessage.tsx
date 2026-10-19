import React from 'react';

function renderInline(text: string): React.ReactNode[] {
  // Regex pattern matching:
  // 1. **bold** or __bold__
  // 2. *italic* or _italic_
  // 3. URLs
  const regex = /(\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|https?:\/\/[^\s]+)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;
    if (
      (part.startsWith('**') && part.endsWith('**') && part.length >= 4) ||
      (part.startsWith('__') && part.endsWith('__') && part.length >= 4)
    ) {
      return (
        <strong key={index} style={{ fontWeight: 700, color: 'inherit' }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (
      (part.startsWith('*') && part.endsWith('*') && part.length >= 2) ||
      (part.startsWith('_') && part.endsWith('_') && part.length >= 2)
    ) {
      return (
        <em key={index} style={{ fontStyle: 'italic' }}>
          {part.slice(1, -1)}
        </em>
      );
    }
    if (/^https?:\/\/[^\s]+$/.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#2563eb', textDecoration: 'underline', wordBreak: 'break-all' }}
        >
          {part}
        </a>
      );
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

export interface FormattedMessageProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
}

export const FormattedMessage: React.FC<FormattedMessageProps> = ({ content, className, style }) => {
  if (!content) return null;

  const lines = content.split(/\r?\n/);

  return (
    <div
      className={className}
      style={{
        lineHeight: 1.65,
        wordBreak: 'break-word',
        whiteSpace: 'pre-wrap',
        fontFamily: 'inherit',
        ...style
      }}
    >
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        // Empty line -> letter paragraph separator
        if (!trimmed) {
          return <div key={idx} style={{ height: '0.65rem' }} />;
        }

        // Bullet point: - text or * text or • text
        const bulletMatch = line.match(/^(\s*)(?:[\*\-•])\s+(.+)$/);
        if (bulletMatch) {
          const indent = bulletMatch[1].length * 8;
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                marginLeft: `${indent + 6}px`,
                margin: '2px 0'
              }}
            >
              <span style={{ color: 'var(--color-secondary, #2563eb)', fontWeight: 700, userSelect: 'none' }}>
                •
              </span>
              <div style={{ flex: 1 }}>{renderInline(bulletMatch[2])}</div>
            </div>
          );
        }

        // Numbered list: 1. text or 1) text
        const numMatch = line.match(/^(\s*)(\d+[\.\)])\s+(.+)$/);
        if (numMatch) {
          const indent = numMatch[1].length * 8;
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                marginLeft: `${indent + 6}px`,
                margin: '2px 0'
              }}
            >
              <span
                style={{
                  color: 'var(--color-secondary, #2563eb)',
                  fontWeight: 700,
                  minWidth: '1.25rem',
                  userSelect: 'none'
                }}
              >
                {numMatch[2]}
              </span>
              <div style={{ flex: 1 }}>{renderInline(numMatch[3])}</div>
            </div>
          );
        }

        // Standard line
        return (
          <div key={idx} style={{ margin: '1px 0' }}>
            {renderInline(line)}
          </div>
        );
      })}
    </div>
  );
};

export default FormattedMessage;
