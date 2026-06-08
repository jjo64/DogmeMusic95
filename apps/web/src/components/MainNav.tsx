import { useState } from 'react';

export type TabId = 'network' | 'timeline' | 'collections' | 'discover' | 'community' | 'archive';

const TABS: { id: TabId; label: string }[] = [
  { id: 'network', label: 'NETWORK' },
  { id: 'timeline', label: 'TIMELINE' },
  { id: 'collections', label: 'COLLECTIONS' },
  { id: 'discover', label: 'DISCOVER' },
  { id: 'community', label: 'COMMUNITY' },
  { id: 'archive', label: 'ARCHIVE' },
];

interface Props {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  searchQuery: string;
  onSearch: (q: string) => void;
  onBack: () => void;
  historyCount: number;
  historyOpen: boolean;
  onToggleHistory: () => void;
}

export function MainNav({ activeTab, onTabChange, searchQuery, onSearch, onBack, historyCount, historyOpen, onToggleHistory }: Props) {
  const [inputVal, setInputVal] = useState(searchQuery);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch(inputVal.trim());
    if (activeTab !== 'network') onTabChange('network');
  }

  return (
    <header
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        height: '50px',
        background: 'rgba(10,11,10,0.96)',
        borderBottom: '1px solid rgba(227,224,213,0.08)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: '0',
        zIndex: 1000,
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Logo */}
      <button
        onClick={onBack}
        style={{
          background: 'transparent', border: 'none',
          display: 'flex', alignItems: 'baseline', gap: '4px',
          cursor: 'pointer', flexShrink: 0, marginRight: '20px', padding: '0',
        }}
      >
        <span style={{ fontFamily: "'Anton', sans-serif", color: '#E3E0D5', fontSize: '15px', letterSpacing: '0.18em', fontWeight: 400 }}>
          DOGME
        </span>
        <span style={{ fontFamily: "'Anton', sans-serif", color: '#E3E0D5', opacity: 0.38, fontSize: '8px', letterSpacing: '0.3em', fontWeight: 400 }}>
          MUSIC
        </span>
        <span style={{ fontFamily: "'Space Mono', monospace", color: '#E3E0D5', opacity: 0.22, fontSize: '9px', letterSpacing: '0.1em' }}>
          95
        </span>
      </button>

      {/* Separator */}
      <div style={{ width: '1px', height: '20px', background: 'rgba(227,224,213,0.1)', marginRight: '16px', flexShrink: 0 }} />

      {/* Tabs */}
      <nav style={{ display: 'flex', height: '100%', gap: '0', flex: '0 0 auto' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #8B1E1E' : '2px solid transparent',
              height: '100%',
              padding: '0 10px',
              color: '#E3E0D5',
              fontFamily: "'Space Mono', monospace",
              fontSize: '8px',
              letterSpacing: '0.14em',
              cursor: 'pointer',
              opacity: activeTab === tab.id ? 1 : 0.35,
              transition: 'opacity 0.15s, border-color 0.15s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { if (activeTab !== tab.id) e.currentTarget.style.opacity = '0.7'; }}
            onMouseLeave={e => { if (activeTab !== tab.id) e.currentTarget.style.opacity = '0.35'; }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div style={{ flex: 1 }} />

      {/* Search */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex', alignItems: 'center', gap: '0',
          borderBottom: '1px solid rgba(227,224,213,0.18)',
          marginRight: '12px',
          flex: '0 1 180px',
        }}
      >
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#8B1E1E', opacity: 0.7, marginRight: '5px', flexShrink: 0 }}>
          ⌕
        </span>
        <input
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          placeholder="SEARCH ARTIST..."
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: '#E3E0D5', fontFamily: "'Space Mono', monospace",
            fontSize: '8px', letterSpacing: '0.1em',
            padding: '4px 0', caretColor: '#8B1E1E', minWidth: 0,
          }}
        />
      </form>

      {/* History toggle */}
      <button
        onClick={onToggleHistory}
        style={{
          background: historyOpen ? 'rgba(139,30,30,0.15)' : 'transparent',
          border: '1px solid rgba(227,224,213,0.14)',
          padding: '4px 10px',
          color: '#E3E0D5',
          fontFamily: "'Space Mono', monospace",
          fontSize: '8px',
          letterSpacing: '0.1em',
          cursor: 'pointer',
          opacity: historyOpen ? 1 : 0.45,
          transition: 'opacity 0.15s, border-color 0.15s, background 0.15s',
          flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: '5px',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
        onMouseLeave={e => { if (!historyOpen) e.currentTarget.style.opacity = '0.45'; }}
        title="Exploration History"
      >
        <span>TRAIL</span>
        {historyCount > 0 && (
          <span style={{ color: '#8B1E1E', opacity: 0.9 }}>{historyCount}</span>
        )}
      </button>
    </header>
  );
}
