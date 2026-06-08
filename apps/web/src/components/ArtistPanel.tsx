import { useState } from 'react';
import { motion } from 'motion/react';
import { getArtistById, getConnectionsForArtist } from '../data/artists-data';
import { ALBUMS } from '../data/albums-data';
import { UserList } from '../data/user-data';

interface Props {
  artistId: string;
  onClose: () => void;
  onExploreNetwork: (artistId: string) => void;
  userLists?: UserList[];
  onSaveToList?: (artistId: string, listId: string) => void;
  onCreateAndSave?: (artistId: string, listName: string) => void;
  node?: any;
  graphLinks?: any[];
  graphNodes?: any[];
}

function AlbumCover({ title, year }: { title: string; year: number }) {
  const hash = title.split('').reduce((acc, c, i) => acc + c.charCodeAt(0) * (i + 1), 0);
  const bgL = 10 + (hash % 14);
  const patterns: [string, string][] = [
    [`M0 22 L44 22 M22 0 L22 44`, 'lines'],
    [`M0 44 L44 0 M-10 44 L34 0 M10 44 L54 0`, 'diag'],
    [`M0 0 L44 44 M44 0 L0 44`, 'cross'],
    [`M6 6 L38 6 L38 38 L6 38 Z M14 14 L30 14 L30 30 L14 30 Z`, 'squares'],
  ];
  const [pathD] = patterns[hash % patterns.length];
  return (
    <div style={{ width: 44, height: 44, flexShrink: 0, background: `hsl(120,6%,${bgL}%)`, border: '1px solid rgba(227,224,213,0.12)', overflow: 'hidden', position: 'relative' }}>
      <svg width="44" height="44" style={{ position: 'absolute', inset: 0 }}>
        <path d={pathD} stroke="rgba(227,224,213,0.08)" strokeWidth="0.5" fill="none" />
        <text x="22" y="29" textAnchor="middle" fill="rgba(227,224,213,0.04)" fontFamily="Anton,sans-serif" fontSize="26">{title[0]}</text>
        <text x="40" y="40" textAnchor="end" fill="#8B1E1E" fillOpacity="0.65" fontFamily="'Space Mono',monospace" fontSize="6">{year}</text>
      </svg>
    </div>
  );
}

function StrengthBar({ value, red }: { value: number; red: boolean }) {
  return (
    <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          style={{
            width: '14px',
            height: '2px',
            background: i < Math.round(value * 10)
              ? (red ? '#8B1E1E' : '#E3E0D5')
              : 'rgba(227,224,213,0.12)',
          }}
        />
      ))}
    </div>
  );
}

export function ArtistPanel({
  artistId, onClose, onExploreNetwork, userLists = [], onSaveToList, onCreateAndSave,
  node, graphLinks, graphNodes
}: Props) {
  const [listPickerOpen, setListPickerOpen] = useState(false);
  const [newListName, setNewListName] = useState('');

  const isLive = !!node;
  const staticArtist = getArtistById(artistId);
  
  if (!isLive && !staticArtist) return null;

  const artist = isLive ? {
    id: node.id,
    name: node.label,
    era: node.type.toUpperCase(),
    origin: node.id.toUpperCase(),
    genres: [node.type.toUpperCase()],
    description: node.description,
    influence_score: 85
  } : staticArtist!;

  const connections = isLive ? graphLinks!.map((l: any) => {
    const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
    const targetId = typeof l.target === 'object' ? l.target.id : l.target;
    const otherId = sourceId === node.id ? targetId : sourceId;
    const otherNode = graphNodes!.find((n: any) => n.id === otherId);
    if (!otherNode) return null;
    return {
      artist: {
        id: otherNode.id,
        name: otherNode.label,
        era: otherNode.type.toUpperCase(),
        origin: otherNode.id.toUpperCase(),
      },
      type: l.type,
      strength: l.type === 'influence' ? 0.9 : 0.7,
      description: l.description,
    };
  }).filter((x: any): x is NonNullable<typeof x> => x !== null) : getConnectionsForArtist(artistId);

  const listsContaining = userLists.filter(l => l.artistIds.includes(isLive ? node.id : artistId));
  const strongConnections = connections.filter(c => c.strength > 0.82);

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'tween', duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        top: '50px',
        right: 0,
        bottom: 0,
        width: 'min(420px, 100vw)',
        background: '#000000',
        borderLeft: '1px solid rgba(227,224,213,0.25)',
        zIndex: 900,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {/* Panel header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(227,224,213,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <span style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '8px',
          color: '#8B1E1E',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}>
          ARTIST / ARCHIVE RECORD
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: '1px solid rgba(227,224,213,0.2)',
            color: '#E3E0D5',
            fontFamily: "'Space Mono', monospace",
            fontSize: '9px',
            padding: '4px 10px',
            cursor: 'pointer',
            letterSpacing: '0.1em',
            transition: 'border-color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#8B1E1E'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(227,224,213,0.2)'}
        >
          CLOSE ×
        </button>
      </div>

      {/* Artist name */}
      <div style={{ padding: '28px 20px 0' }}>
        <h1
          style={{
            fontFamily: "'Anton', sans-serif",
            fontSize: 'clamp(36px, 8vw, 58px)',
            color: '#E3E0D5',
            lineHeight: 0.9,
            letterSpacing: '-0.01em',
            margin: 0,
            fontWeight: 400,
          }}
        >
          {artist.name}
        </h1>

        <div style={{ marginTop: '14px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#E3E0D5', opacity: 0.45, letterSpacing: '0.12em' }}>
            {artist.era}
          </span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#E3E0D5', opacity: 0.3, letterSpacing: '0.1em' }}>
            {artist.origin}
          </span>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(227,224,213,0.1)', marginTop: '20px' }} />
      </div>

      {/* Influence score */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: '#E3E0D5', opacity: 0.4, letterSpacing: '0.18em' }}>
            INFLUENCE INDEX
          </span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: '#8B1E1E', letterSpacing: '0.08em' }}>
            {artist.influence_score} / 100
          </span>
        </div>
        <StrengthBar value={artist.influence_score / 100} red />
      </div>

      {/* Genres */}
      <div style={{ padding: '20px 20px 0' }}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: '#E3E0D5', opacity: 0.3, letterSpacing: '0.18em', display: 'block', marginBottom: '10px' }}>
          GENRE CLASSIFICATION
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {artist.genres.map(g => (
            <span
              key={g}
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '8px',
                color: '#E3E0D5',
                border: '1px solid rgba(227,224,213,0.25)',
                padding: '3px 8px',
                letterSpacing: '0.12em',
                opacity: 0.7,
              }}
            >
              {g}
            </span>
          ))}
        </div>
      </div>

      {/* Description */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ height: '1px', background: 'rgba(227,224,213,0.08)', marginBottom: '16px' }} />
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: '#E3E0D5', opacity: 0.3, letterSpacing: '0.18em', display: 'block', marginBottom: '12px' }}>
          CRITICAL ANNOTATION
        </span>
        <p style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '10px',
          color: '#E3E0D5',
          opacity: 0.7,
          lineHeight: '1.9',
          letterSpacing: '0.03em',
          margin: 0,
        }}>
          {artist.description}
        </p>
      </div>

      {/* Key recordings */}
      {ALBUMS[artistId] && ALBUMS[artistId].length > 0 && (
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{ height: '1px', background: 'rgba(227,224,213,0.08)', marginBottom: '16px' }} />
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: '#E3E0D5', opacity: 0.3, letterSpacing: '0.18em', display: 'block', marginBottom: '12px' }}>
            KEY RECORDINGS
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {ALBUMS[artistId].map((album, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <AlbumCover title={album.title} year={album.year} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '7px', marginBottom: '3px' }}>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: '#E3E0D5', opacity: 0.85, letterSpacing: '0.06em' }}>
                      {album.title}
                    </span>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '7px', color: '#8B1E1E', opacity: 0.7, letterSpacing: '0.1em', flexShrink: 0 }}>
                      {album.year}
                    </span>
                  </div>
                  <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: '#E3E0D5', opacity: 0.35, lineHeight: 1.7, letterSpacing: '0.03em', margin: 0 }}>
                    {album.note}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connection metrics */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ height: '1px', background: 'rgba(227,224,213,0.08)', marginBottom: '16px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '7px', color: '#E3E0D5', opacity: 0.3, letterSpacing: '0.15em', display: 'block', marginBottom: '4px' }}>
              TOTAL LINKS
            </span>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '18px', color: '#E3E0D5', opacity: 0.9 }}>
              {connections.length.toString().padStart(2, '0')}
            </span>
          </div>
          <div>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '7px', color: '#8B1E1E', opacity: 0.8, letterSpacing: '0.15em', display: 'block', marginBottom: '4px' }}>
              CRITICAL LINKS
            </span>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '18px', color: '#8B1E1E' }}>
              {strongConnections.length.toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Connection list */}
      <div style={{ padding: '0 20px', flex: 1 }}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: '#E3E0D5', opacity: 0.3, letterSpacing: '0.18em', display: 'block', marginBottom: '12px' }}>
          INFLUENCE MAP
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {connections.map(({ artist: connected, strength, type }) => (
            <div key={connected.id}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                <button
                  onClick={() => onExploreNetwork(connected.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    color: strength > 0.82 ? '#8B1E1E' : '#E3E0D5',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '9px',
                    letterSpacing: '0.1em',
                    cursor: 'pointer',
                    opacity: strength > 0.82 ? 1 : 0.65,
                    textAlign: 'left',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={e => e.currentTarget.style.opacity = strength > 0.82 ? '1' : '0.65'}
                >
                  {connected.name}
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {type === 'COLLABORATION' && (
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '7px', color: '#8B1E1E', opacity: 0.7, letterSpacing: '0.1em' }}>
                      COLLAB
                    </span>
                  )}
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: '#E3E0D5', opacity: 0.35, letterSpacing: '0.08em' }}>
                    {Math.round(strength * 100)}
                  </span>
                </div>
              </div>
              <StrengthBar value={strength} red={strength > 0.82} />
            </div>
          ))}
        </div>
      </div>

      {/* Save to archive */}
      <div style={{ padding: '0 20px 0' }}>
        <div style={{ height: '1px', background: 'rgba(227,224,213,0.08)', marginBottom: '16px' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: listPickerOpen ? '10px' : '0' }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: '#E3E0D5', opacity: 0.3, letterSpacing: '0.18em' }}>
            PERSONAL ARCHIVE
          </span>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {listsContaining.length > 0 && (
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '7px', color: '#8B1E1E', opacity: 0.8, letterSpacing: '0.08em' }}>
                {listsContaining.map(l => l.name).join(', ')}
              </span>
            )}
            <button
              onClick={() => setListPickerOpen(o => !o)}
              style={{
                background: listPickerOpen ? 'rgba(139,30,30,0.15)' : 'transparent',
                border: `1px solid ${listPickerOpen ? 'rgba(139,30,30,0.4)' : 'rgba(227,224,213,0.18)'}`,
                padding: '3px 8px', color: '#E3E0D5',
                fontFamily: "'Space Mono', monospace", fontSize: '7px', letterSpacing: '0.12em',
                cursor: 'pointer', transition: 'all 0.12s',
              }}
            >
              {listPickerOpen ? '× CLOSE' : '+ SAVE'}
            </button>
          </div>
        </div>
        {listPickerOpen && (
          <div style={{ background: 'rgba(227,224,213,0.04)', border: '1px solid rgba(227,224,213,0.1)', padding: '10px 12px', marginBottom: '12px' }}>
            {userLists.length === 0 ? (
              <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: '#E3E0D5', opacity: 0.3, margin: '0 0 10px', letterSpacing: '0.08em' }}>
                NO LISTS YET. CREATE ONE:
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px' }}>
                {userLists.map(list => {
                  const inList = list.artistIds.includes(artistId);
                  return (
                    <button key={list.id}
                      onClick={() => onSaveToList && onSaveToList(artistId, list.id)}
                      style={{
                        background: inList ? 'rgba(139,30,30,0.15)' : 'transparent',
                        border: `1px solid ${inList ? 'rgba(139,30,30,0.4)' : 'rgba(227,224,213,0.12)'}`,
                        padding: '5px 10px', color: '#E3E0D5', textAlign: 'left',
                        fontFamily: "'Space Mono', monospace", fontSize: '8px', letterSpacing: '0.08em',
                        cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
                        transition: 'all 0.12s',
                      }}
                    >
                      <span>{list.name}</span>
                      <span style={{ color: inList ? '#8B1E1E' : '#E3E0D5', opacity: inList ? 0.9 : 0.3 }}>
                        {inList ? '● SAVED' : '+ ADD'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                value={newListName}
                onChange={e => setNewListName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newListName.trim() && onCreateAndSave) {
                    onCreateAndSave(artistId, newListName.trim());
                    setNewListName('');
                  }
                }}
                placeholder="NEW LIST NAME…"
                style={{
                  flex: 1, background: 'transparent', border: 'none',
                  borderBottom: '1px solid rgba(227,224,213,0.2)', outline: 'none',
                  color: '#E3E0D5', fontFamily: "'Space Mono', monospace",
                  fontSize: '8px', letterSpacing: '0.08em', padding: '4px 0', caretColor: '#8B1E1E',
                }}
              />
              <button
                onClick={() => { if (newListName.trim() && onCreateAndSave) { onCreateAndSave(artistId, newListName.trim()); setNewListName(''); } }}
                style={{
                  background: '#8B1E1E', border: 'none', padding: '4px 8px',
                  color: '#E3E0D5', fontFamily: "'Space Mono', monospace",
                  fontSize: '7px', letterSpacing: '0.12em', cursor: 'pointer',
                }}
              >CREATE →</button>
            </div>
          </div>
        )}
      </div>

      {/* Explore button */}
      <div style={{ padding: '24px 20px', flexShrink: 0 }}>
        <div style={{ height: '1px', background: 'rgba(227,224,213,0.08)', marginBottom: '16px' }} />
        <button
          onClick={() => onExploreNetwork(artistId)}
          style={{
            width: '100%',
            background: '#8B1E1E',
            border: 'none',
            padding: '14px',
            color: '#E3E0D5',
            fontFamily: "'Space Mono', monospace",
            fontSize: '10px',
            letterSpacing: '0.2em',
            cursor: 'pointer',
            textTransform: 'uppercase',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#a02424'}
          onMouseLeave={e => e.currentTarget.style.background = '#8B1E1E'}
        >
          EXPLORE THIS NETWORK →
        </button>
        <p style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '8px',
          color: '#E3E0D5',
          opacity: 0.2,
          letterSpacing: '0.08em',
          textAlign: 'center',
          marginTop: '10px',
          margin: '10px 0 0',
        }}>
          RE-CENTER GRAPH ON {artist.name}
        </p>
      </div>
    </motion.div>
  );
}
