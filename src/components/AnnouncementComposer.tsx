import React, { useRef, useState } from 'react';
import { Bold, Italic, List, ListOrdered, Eye, Edit3, Send, CornerDownLeft } from 'lucide-react';
import { Button } from './UI/Button';
import FormattedMessage from './FormattedMessage';

export interface AnnouncementComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
  isLoading?: boolean;
  placeholder?: string;
  submitLabel?: string;
  targetLabel?: string;
}

export const AnnouncementComposer: React.FC<AnnouncementComposerProps> = ({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  placeholder = "Write your official announcement here...\n\nDear Delegates,\n\nPress Enter to start a new line or paragraph. Select text and press Ctrl+B (or Cmd+B) to make it bold.",
  submitLabel = 'Publish Announcement',
  targetLabel
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isPreview, setIsPreview] = useState(false);

  const wrapSelection = (before: string, after: string, defaultPlaceholder = 'bold text') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    if (start !== end) {
      const selected = text.substring(start, end);
      const replacement = `${before}${selected}${after}`;
      const newText = text.substring(0, start) + replacement + text.substring(end);
      onChange(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + before.length, end + before.length);
      }, 10);
    } else {
      const replacement = `${before}${defaultPlaceholder}${after}`;
      const newText = text.substring(0, start) + replacement + text.substring(end);
      onChange(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + before.length, start + before.length + defaultPlaceholder.length);
      }, 10);
    }
  };

  const insertAtCursor = (insertion: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const newText = text.substring(0, start) + insertion + text.substring(end);
    onChange(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + insertion.length, start + insertion.length);
    }, 10);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Keyboard shortcut for bold: Ctrl+B or Cmd+B
    if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
      e.preventDefault();
      wrapSelection('**', '**', 'bold text');
    }
    // Keyboard shortcut for italic: Ctrl+I or Cmd+I
    else if ((e.ctrlKey || e.metaKey) && (e.key === 'i' || e.key === 'I')) {
      e.preventDefault();
      wrapSelection('*', '*', 'italic text');
    }
    // Ctrl+Enter or Cmd+Enter to submit
    else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (value.trim() && !isLoading) {
        onSubmit();
      }
    }
    // NOTE: Regular Enter is NOT intercepted!
    // It creates a new line like in a letter / Word document, exactly as required.
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || isLoading) return;
    onSubmit(e);
  };

  return (
    <form
      onSubmit={handleSubmitForm}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '0.85rem',
        backgroundColor: '#ffffff',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      {/* Target scope header if provided */}
      {targetLabel && (
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>Sending to:</span>
          <span style={{ color: 'var(--color-secondary)', backgroundColor: 'var(--color-secondary-bg)', padding: '2px 8px', borderRadius: '4px' }}>
            {targetLabel}
          </span>
        </div>
      )}

      {/* Formatting & Controls Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
          paddingBottom: '0.5rem',
          borderBottom: '1px solid rgba(0,0,0,0.06)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
          <button
            type="button"
            title="Bold (Ctrl+B / Cmd+B from keyboard)"
            onClick={() => wrapSelection('**', '**', 'bold text')}
            style={{
              padding: '0.35rem 0.6rem',
              borderRadius: '4px',
              border: '1px solid var(--color-border)',
              backgroundColor: '#f8fafc',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: 'var(--color-primary)'
            }}
          >
            <Bold size={13} />
            <span>Bold</span>
          </button>

          <button
            type="button"
            title="Italic (Ctrl+I / Cmd+I from keyboard)"
            onClick={() => wrapSelection('*', '*', 'italic text')}
            style={{
              padding: '0.35rem 0.6rem',
              borderRadius: '4px',
              border: '1px solid var(--color-border)',
              backgroundColor: '#f8fafc',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.78rem',
              color: 'var(--color-text-main)'
            }}
          >
            <Italic size={13} />
            <span>Italic</span>
          </button>

          <button
            type="button"
            title="Insert bullet point"
            onClick={() => insertAtCursor('\n• ')}
            style={{
              padding: '0.35rem 0.6rem',
              borderRadius: '4px',
              border: '1px solid var(--color-border)',
              backgroundColor: '#f8fafc',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.78rem',
              color: 'var(--color-text-main)'
            }}
          >
            <List size={13} />
            <span>Bullet</span>
          </button>

          <button
            type="button"
            title="Insert numbered item"
            onClick={() => insertAtCursor('\n1. ')}
            style={{
              padding: '0.35rem 0.6rem',
              borderRadius: '4px',
              border: '1px solid var(--color-border)',
              backgroundColor: '#f8fafc',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.78rem',
              color: 'var(--color-text-main)'
            }}
          >
            <ListOrdered size={13} />
            <span>Number</span>
          </button>

          <button
            type="button"
            title="Insert blank paragraph gap (Letter formatting)"
            onClick={() => insertAtCursor('\n\n')}
            style={{
              padding: '0.35rem 0.6rem',
              borderRadius: '4px',
              border: '1px solid var(--color-border)',
              backgroundColor: '#f8fafc',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.78rem',
              color: 'var(--color-text-main)'
            }}
          >
            <CornerDownLeft size={13} />
            <span>Paragraph</span>
          </button>
        </div>

        {/* Live Preview Toggle */}
        <button
          type="button"
          onClick={() => setIsPreview(!isPreview)}
          style={{
            padding: '0.35rem 0.65rem',
            borderRadius: '4px',
            border: '1px solid var(--color-secondary)',
            backgroundColor: isPreview ? 'var(--color-secondary)' : '#ffffff',
            color: isPreview ? '#ffffff' : 'var(--color-secondary)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '0.75rem',
            fontWeight: 700,
            transition: 'all 0.15s ease'
          }}
        >
          {isPreview ? <Edit3 size={13} /> : <Eye size={13} />}
          <span>{isPreview ? 'Back to Editor' : 'Letter Preview'}</span>
        </button>
      </div>

      {/* Editor or Preview Mode */}
      {isPreview ? (
        <div
          style={{
            minHeight: '140px',
            maxHeight: '260px',
            overflowY: 'auto',
            padding: '1rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px dashed var(--color-secondary)',
            backgroundColor: 'rgba(59, 130, 246, 0.03)',
            fontSize: '0.88rem'
          }}
        >
          <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-secondary)', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>
            📄 Live Letter Preview (How delegates will see it)
          </div>
          {value.trim() ? (
            <FormattedMessage content={value} />
          ) : (
            <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.82rem' }}>
              No content typed yet. Switch back to Editor and type your message.
            </span>
          )}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={6}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '0.75rem 0.85rem',
            fontSize: '0.88rem',
            lineHeight: 1.6,
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            fontFamily: 'inherit',
            resize: 'vertical',
            outline: 'none',
            color: 'var(--color-primary)',
            boxSizing: 'border-box'
          }}
        />
      )}

      {/* Bottom controls and tips */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>💡 <strong>Enter</strong> = new line/paragraph like in a letter.</span>
          <span>• <strong>Ctrl+B / Cmd+B</strong> = bold.</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {value.trim() && (
            <button
              type="button"
              onClick={() => onChange('')}
              disabled={isLoading}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Clear
            </button>
          )}

          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            disabled={!value.trim() || isLoading}
            style={{
              padding: '0.55rem 1.4rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              fontWeight: 700
            }}
          >
            <Send size={14} />
            <span>{submitLabel}</span>
          </Button>
        </div>
      </div>
    </form>
  );
};

export default AnnouncementComposer;
