import React from 'react';

interface TabItem {
  id: string;
  label: string | React.ReactNode;
  content: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  activeTabId: string;
  onChange: (id: string) => void;
  variant?: 'underline' | 'pills';
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeTabId,
  onChange,
  variant = 'underline'
}) => {
  const getTabStyles = (isActive: boolean) => {
    const base: React.CSSProperties = {
      padding: '0.85rem 1.5rem',
      fontWeight: 700,
      fontSize: '0.85rem',
      fontFamily: 'var(--font-sans)',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      cursor: 'pointer',
      background: 'none',
      border: 'none',
      outline: 'none',
      transition: 'all var(--transition-fast)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    };

    if (variant === 'underline') {
      return {
        ...base,
        borderBottom: `3px solid ${isActive ? 'var(--color-secondary)' : 'transparent'}`,
        color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
      };
    } else {
      // Pills
      return {
        ...base,
        borderRadius: 'var(--radius-md)',
        backgroundColor: isActive ? 'var(--color-secondary)' : 'transparent',
        color: isActive ? '#ffffff' : 'var(--color-text-muted)',
      };
    }
  };

  const activeContent = items.find((item) => item.id === activeTabId)?.content || null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '1.5rem' }}>
      {/* Tab Navigation header */}
      <div
        style={{
          display: 'flex',
          borderBottom: variant === 'underline' ? '1px solid var(--color-border)' : 'none',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: variant === 'pills' ? '0.5rem' : 0,
        }}
      >
        {items.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={getTabStyles(tab.id === activeTabId)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content viewport */}
      <div className="fade-in">{activeContent}</div>
    </div>
  );
};
