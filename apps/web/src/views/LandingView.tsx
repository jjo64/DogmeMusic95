import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';

interface Props {
  onSearch: (query: string) => void;
}

const SUGGESTED = ['BAUHAUS', 'JOY DIVISION', 'THE CURE', 'NICK CAVE', 'RADIOHEAD', 'SWANS', 'WIRE', 'CAN'];

export function LandingView({ onSearch }: Props) {
  const [query, setQuery] = useState('');
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setSuggestionIndex(i => (i + 1) % SUGGESTED.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch(query.trim());
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') onSearch(query.trim());
  }

  function handleSuggestionClick(s: string) {
    setQuery(s);
    onSearch(s);
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#111211',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top credits bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 1.2 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '20px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(227,224,213,0.08)',
        }}
      >
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#E3E0D5', opacity: 0.35, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          DOGME / MUSIC INFLUENCE EXPLORER
        </span>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#E3E0D5', opacity: 0.25, letterSpacing: '0.12em' }}>
          v1.0 — {new Date().getFullYear()}
        </span>
      </motion.div>

      {/* Decorative vertical text */}
      <div
        style={{
          position: 'absolute',
          left: '20px',
          top: '50%',
          transform: 'translateY(-50%) rotate(-90deg)',
          transformOrigin: 'center center',
          fontFamily: "'Space Mono', monospace",
          fontSize: '8px',
          color: '#E3E0D5',
          opacity: 0.12,
          letterSpacing: '0.25em',
          whiteSpace: 'nowrap',
          userSelect: 'none',
        }}
      >
        NETWORK / GRAPH / ARCHIVE / TOPOLOGY / INFLUENCE
      </div>

      {/* Main content */}
      <div
        style={{
          width: '100%',
          maxWidth: '900px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '0',
        }}
      >
        {/* Eyebrow text */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '10px',
            color: '#8B1E1E',
            letterSpacing: '0.22em',
            marginBottom: '12px',
            textTransform: 'uppercase',
          }}
        >
          MUSIC INFLUENCE NETWORK — INTERACTIVE ARCHIVE
        </motion.p>

        {/* DOGME MUSIC 95 title block */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ userSelect: 'none' }}
        >
          <h1
            style={{
              fontFamily: "'Anton', sans-serif",
              fontSize: 'clamp(88px, 19vw, 280px)',
              color: '#E3E0D5',
              lineHeight: 0.88,
              letterSpacing: '-0.02em',
              margin: 0,
              padding: 0,
              fontWeight: 400,
            }}
          >
            DOGME
          </h1>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '7px', marginTop: '6px', paddingLeft: '3px' }}>
            <span
              style={{
                fontFamily: "'Anton', sans-serif",
                fontSize: 'clamp(16px, 2.8vw, 36px)',
                color: '#E3E0D5',
                opacity: 0.48,
                letterSpacing: '0.32em',
                fontWeight: 400,
              }}
            >
              MUSIC
            </span>
            <span
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 'clamp(10px, 1.4vw, 14px)',
                color: '#E3E0D5',
                opacity: 0.26,
                letterSpacing: '0.12em',
              }}
            >
              95
            </span>
          </div>
        </motion.div>

        {/* Subtitle line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.9 }}
          style={{
            width: '100%',
            height: '1px',
            background: 'linear-gradient(to right, rgba(139,30,30,0.8), rgba(227,224,213,0.15), transparent)',
            marginTop: '16px',
            marginBottom: '16px',
          }}
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '11px',
            color: '#E3E0D5',
            opacity: 0.45,
            letterSpacing: '0.1em',
            marginBottom: '48px',
            lineHeight: '1.8',
            maxWidth: '520px',
          }}
        >
          MAP THE INVISIBLE THREADS BETWEEN ARTISTS.<br />
          TRACE INFLUENCE ACROSS FOUR DECADES OF<br />
          POST-PUNK, DARKWAVE, AND ART ROCK.
        </motion.p>

        {/* Search row */}
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.7 }}
          onSubmit={handleSubmit}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'stretch',
            gap: '0',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              flex: '1 1 260px',
              borderBottom: '1px solid #E3E0D5',
              display: 'flex',
              alignItems: 'center',
              minWidth: '0',
            }}
          >
            <span
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '10px',
                color: '#8B1E1E',
                letterSpacing: '0.15em',
                marginRight: '12px',
                flexShrink: 0,
                paddingBottom: '2px',
              }}
            >
              ⌕
            </span>
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={SUGGESTED[suggestionIndex]}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#E3E0D5',
                fontFamily: "'Space Mono', monospace",
                fontSize: '13px',
                letterSpacing: '0.08em',
                padding: '14px 0',
                caretColor: '#8B1E1E',
                minWidth: '0',
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              background: '#8B1E1E',
              border: 'none',
              padding: '14px 32px',
              color: '#E3E0D5',
              fontFamily: "'Space Mono', monospace",
              fontSize: '11px',
              letterSpacing: '0.18em',
              cursor: 'pointer',
              textTransform: 'uppercase',
              flexShrink: 0,
              transition: 'background 0.15s',
              marginTop: '0',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#a02424')}
            onMouseLeave={e => (e.currentTarget.style.background = '#8B1E1E')}
          >
            EXPLORE →
          </button>
        </motion.form>

        {/* Suggested artists */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          style={{
            marginTop: '24px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#E3E0D5', opacity: 0.3, letterSpacing: '0.12em', alignSelf: 'center' }}>
            TRY:
          </span>
          {SUGGESTED.map(s => (
            <button
              key={s}
              onClick={() => handleSuggestionClick(s)}
              style={{
                background: 'transparent',
                border: '1px solid rgba(227,224,213,0.18)',
                padding: '4px 10px',
                color: '#E3E0D5',
                fontFamily: "'Space Mono', monospace",
                fontSize: '9px',
                letterSpacing: '0.12em',
                cursor: 'pointer',
                opacity: 0.5,
                transition: 'opacity 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.borderColor = 'rgba(139,30,30,0.8)'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.borderColor = 'rgba(227,224,213,0.18)'; }}
            >
              {s}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Bottom info bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 1 }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          borderTop: '1px solid rgba(227,224,213,0.06)',
        }}
      >
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: '#E3E0D5', opacity: 0.2, letterSpacing: '0.12em' }}>
          {ARTISTS_COUNT} ARTISTS / {CONNECTIONS_COUNT} CONNECTIONS / ARCHIVE
        </span>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: '#8B1E1E', opacity: 0.5, letterSpacing: '0.1em' }}>
          POST-PUNK · DARKWAVE · ART ROCK · SHOEGAZE · TRIP-HOP
        </span>
      </motion.div>
    </div>
  );
}

const ARTISTS_COUNT = 20;
const CONNECTIONS_COUNT = 62;
