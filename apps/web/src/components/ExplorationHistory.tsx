import { motion } from 'motion/react';
import { getArtistById } from '../data/artists-data';

interface HistoryArtist {
  id: string;
  name: string;
  era?: string;
}

interface Props {
  history: HistoryArtist[];
  onSelectArtist: (id: string) => void;
  onClear: () => void;
  onClose: () => void;
}

export function ExplorationHistory({ history, onSelectArtist, onClear, onClose }: Props) {
  return (
    <motion.div
      initial={{ x: '-100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '-100%', opacity: 0 }}
      transition={{ type: 'tween', duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      style={{
        width: '220px',
        flexShrink: 0,
        height: '100%',
        background: '#0a0b0a',
        borderRight: '1px solid rgba(227,224,213,0.08)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid rgba(227,224,213,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: '#8B1E1E', letterSpacing: '0.2em', marginBottom: '2px' }}>
            EXPLORATION TRAIL
          </div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '7px', color: '#E3E0D5', opacity: 0.25, letterSpacing: '0.1em' }}>
            {history.length} ARTIST{history.length !== 1 ? 'S' : ''} VISITED
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent', border: 'none',
            color: '#E3E0D5', opacity: 0.35, cursor: 'pointer',
            fontFamily: "'Space Mono', monospace", fontSize: '10px',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0.35'}
        >
          ×
        </button>
      </div>

      {/* History list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {history.length === 0 ? (
          <div style={{
            padding: '24px 16px',
            fontFamily: "'Space Mono', monospace",
            fontSize: '8px', color: '#E3E0D5', opacity: 0.2,
            letterSpacing: '0.1em', lineHeight: '1.8',
          }}>
            NO ARTISTS VISITED YET.<br />CLICK A NODE IN THE<br />NETWORK TO BEGIN.
          </div>
        ) : (
          history.map((artist, index) => {
            return (
              <button
                key={`${artist.id}-${index}`}
                onClick={() => onSelectArtist(artist.id)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  borderLeft: index === 0 ? '2px solid #8B1E1E' : '2px solid transparent',
                  padding: '10px 14px 10px 14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(227,224,213,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Step number */}
                <span style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '7px', color: index === 0 ? '#8B1E1E' : '#E3E0D5',
                  opacity: index === 0 ? 0.8 : 0.2, letterSpacing: '0.1em',
                  flexShrink: 0, width: '16px',
                }}>
                  {String(history.length - index).padStart(2, '0')}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '8px', color: '#E3E0D5',
                    opacity: index === 0 ? 1 : 0.55,
                    letterSpacing: '0.08em',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {artist.name}
                  </div>
                  <div style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '7px', color: '#E3E0D5',
                    opacity: 0.2, letterSpacing: '0.06em', marginTop: '2px',
                  }}>
                    {artist.era}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Footer */}
      {history.length > 0 && (
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid rgba(227,224,213,0.07)',
          flexShrink: 0,
        }}>
          <button
            onClick={onClear}
            style={{
              background: 'transparent',
              border: '1px solid rgba(227,224,213,0.12)',
              width: '100%',
              padding: '6px',
              color: '#E3E0D5',
              fontFamily: "'Space Mono', monospace",
              fontSize: '7px',
              letterSpacing: '0.15em',
              cursor: 'pointer',
              opacity: 0.4,
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.4'}
          >
            CLEAR TRAIL
          </button>
        </div>
      )}
    </motion.div>
  );
}
