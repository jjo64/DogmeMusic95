import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { COLLECTIONS, Collection } from '../data/collections-data';
import { getArtistById } from '../data/artists-data';
import { GET_COLLECTIONS } from '../graphql/queries';

interface Props {
  onLoadCollection: (collection: Collection) => void;
  onSelectArtist: (id: string) => void;
}

export function CollectionsView({ onLoadCollection, onSelectArtist }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, loading } = useQuery(GET_COLLECTIONS);
  const collectionsSource = data?.collections && data.collections.length > 0 ? data.collections : COLLECTIONS;

  return (
    <div
      style={{
        height: '100%',
        overflowY: 'auto',
        background: '#111211',
        padding: '32px 24px',
      }}
    >
      {/* Header */}
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px', borderBottom: '1px solid rgba(227,224,213,0.08)', paddingBottom: '24px' }}>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#8B1E1E', letterSpacing: '0.22em', margin: '0 0 8px' }}>
            CURATED ARCHIVE
          </p>
          <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 'clamp(28px, 5vw, 56px)', color: '#E3E0D5', fontWeight: 400, lineHeight: 0.9, margin: '0 0 16px', letterSpacing: '-0.01em' }}>
            COLLECTIONS
          </h2>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: '#E3E0D5', opacity: 0.38, letterSpacing: '0.06em', lineHeight: 1.8, margin: 0, maxWidth: '500px' }}>
            PRE-MAPPED SUBGRAPHS AROUND SPECIFIC AESTHETIC SYSTEMS, GEOGRAPHIC CLUSTERS, OR SHARED INFLUENCES. CLICK A COLLECTION TO LOAD IT IN THE NETWORK VIEW.
          </p>
        </div>

        {/* Collections grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 400px), 1fr))', gap: '1px', background: 'rgba(227,224,213,0.06)' }}>
          {collectionsSource.map(col => {
            const isExp = expanded === col.id;
            return (
              <div
                key={col.id}
                style={{
                  background: '#111211',
                  padding: '24px',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#161817')}
                onMouseLeave={e => (e.currentTarget.style.background = '#111211')}
              >
                {/* Top */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: '#8B1E1E', letterSpacing: '0.18em', margin: '0 0 6px', opacity: 0.8 }}>
                      {col.subtitle}
                    </p>
                    <h3
                      style={{ fontFamily: "'Anton', sans-serif", fontSize: 'clamp(18px, 3vw, 26px)', color: '#E3E0D5', fontWeight: 400, margin: 0, lineHeight: 0.95, letterSpacing: '0.01em', cursor: 'pointer' }}
                      onClick={() => setExpanded(isExp ? null : col.id)}
                    >
                      {col.title || col.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => setExpanded(isExp ? null : col.id)}
                    style={{
                      background: 'transparent', border: 'none',
                      color: '#E3E0D5', opacity: 0.3, cursor: 'pointer',
                      fontFamily: "'Space Mono', monospace", fontSize: '14px',
                      flexShrink: 0, marginLeft: '12px', marginTop: '2px',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0.3'}
                  >
                    {isExp ? '−' : '+'}
                  </button>
                </div>

                {/* Artist pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '14px' }}>
                  {col.artistIds.map(id => {
                    const artist = getArtistById(id);
                    if (!artist) return null;
                    return (
                      <button
                        key={id}
                        onClick={e => { e.stopPropagation(); onSelectArtist(id); }}
                        style={{
                          background: 'transparent',
                          border: '1px solid rgba(227,224,213,0.18)',
                          padding: '3px 8px',
                          color: '#E3E0D5',
                          fontFamily: "'Space Mono', monospace",
                          fontSize: '7px', letterSpacing: '0.1em',
                          cursor: 'pointer', opacity: 0.6,
                          transition: 'opacity 0.12s, border-color 0.12s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.borderColor = 'rgba(139,30,30,0.7)'; }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.borderColor = 'rgba(227,224,213,0.18)'; }}
                      >
                        {artist.name}
                      </button>
                    );
                  })}
                </div>

                {/* Expanded description */}
                {isExp && (
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '9px', color: '#E3E0D5', opacity: 0.55,
                      lineHeight: 1.9, letterSpacing: '0.03em', margin: '0 0 16px',
                    }}>
                      {col.description}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '16px' }}>
                      {col.tags.map(tag => (
                        <span key={tag} style={{
                          fontFamily: "'Space Mono', monospace",
                          fontSize: '7px', color: '#8B1E1E', opacity: 0.7,
                          border: '1px solid rgba(139,30,30,0.3)', padding: '2px 7px',
                          letterSpacing: '0.1em',
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Load button */}
                <button
                  onClick={() => onLoadCollection(col)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(227,224,213,0.15)',
                    padding: '7px 16px',
                    color: '#E3E0D5',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '8px', letterSpacing: '0.15em',
                    cursor: 'pointer',
                    opacity: 0.5,
                    transition: 'all 0.15s',
                    width: '100%',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#8B1E1E';
                    e.currentTarget.style.borderColor = '#8B1E1E';
                    e.currentTarget.style.opacity = '1';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'rgba(227,224,213,0.15)';
                    e.currentTarget.style.opacity = '0.5';
                  }}
                >
                  LOAD IN NETWORK →
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
