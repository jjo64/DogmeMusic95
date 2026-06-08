import { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { ARTISTS } from '../data/artists-data';
import { SOUND_PROFILES, SoundProfile } from '../data/sound-profiles';
import { DISCOVER_ARTISTS } from '../graphql/queries';

interface Props {
  onSelectArtist: (id: string) => void;
}

const PARAMS: { key: keyof SoundProfile; label: string; description: string }[] = [
  { key: 'energy', label: 'ENERGY', description: 'Intensity and activity level' },
  { key: 'darkness', label: 'DARKNESS', description: 'Tonal weight and emotional severity' },
  { key: 'acousticness', label: 'ACOUSTIC', description: 'Organic vs. electronic ratio' },
  { key: 'experimentalism', label: 'EXPERIMENT', description: 'Structural unconventionality' },
  { key: 'danceability', label: 'DANCEABILITY', description: 'Rhythmic drive and body movement' },
];

export function SoundSearch({ onSelectArtist }: Props) {
  const [filters, setFilters] = useState<Record<keyof SoundProfile, number>>({
    energy: -1,
    acousticness: -1,
    darkness: -1,
    experimentalism: -1,
    danceability: -1,
  });

  const activeCount = Object.values(filters).filter(v => v >= 0).length;

  const { data, loading } = useQuery(DISCOVER_ARTISTS, {
    variables: {
      darkness: filters.darkness >= 0 ? filters.darkness : 50.0,
      energy: filters.energy >= 0 ? filters.energy : 50.0,
      experimental: filters.experimentalism >= 0 ? filters.experimentalism : 50.0,
      acousticness: filters.acousticness >= 0 ? filters.acousticness : 50.0,
      danceability: filters.danceability >= 0 ? filters.danceability : 50.0,
    },
    skip: activeCount === 0,
  });

  const results = useMemo(() => {
    if (activeCount === 0) return [];
    if (!data?.discoverArtists) return [];

    return data.discoverArtists.map((a: any) => {
      const profile = {
        energy: a.energy,
        acousticness: a.acousticness,
        darkness: a.darkness,
        experimentalism: a.experimental,
        danceability: a.danceability,
      };

      // Calculate distance score local for Δ display
      const activeFilters: any = {};
      for (const [k, v] of Object.entries(filters)) {
        if (v >= 0) activeFilters[k] = v;
      }
      
      const calcDist = (prof: typeof profile, filt: any) => {
        let total = 0;
        let count = 0;
        for (const [k, v] of Object.entries(filt) as [string, number][]) {
          total += Math.abs((prof as any)[k] - v);
          count++;
        }
        return count === 0 ? 0 : total / count;
      };

      return {
        artist: { id: a.id, name: a.name },
        profile,
        score: calcDist(profile, activeFilters),
      };
    });
  }, [data, filters, activeCount]);

  function setParam(key: keyof SoundProfile, val: number) {
    setFilters(prev => ({ ...prev, [key]: val }));
  }
  function resetParam(key: keyof SoundProfile) {
    setFilters(prev => ({ ...prev, [key]: -1 }));
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#111211', padding: '32px 24px' }}>
      <div style={{ maxWidth: '820px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px', borderBottom: '1px solid rgba(227,224,213,0.08)', paddingBottom: '24px' }}>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#8B1E1E', letterSpacing: '0.22em', margin: '0 0 8px' }}>
            SONIC CARTOGRAPHY
          </p>
          <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 'clamp(28px, 5vw, 56px)', color: '#E3E0D5', fontWeight: 400, lineHeight: 0.9, margin: '0 0 16px', letterSpacing: '-0.01em' }}>
            DISCOVER
          </h2>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: '#E3E0D5', opacity: 0.38, letterSpacing: '0.06em', lineHeight: 1.8, margin: 0 }}>
            SEARCH BY SONIC CHARACTERISTICS. SET PARAMETERS BELOW TO FIND ARTISTS MATCHING YOUR DESIRED SOUND PROFILE.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '32px' }}>

          {/* Sliders */}
          <div>
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: '#E3E0D5', opacity: 0.3, letterSpacing: '0.18em', margin: '0 0 20px' }}>
              SONIC PARAMETERS — {activeCount > 0 ? `${activeCount} ACTIVE` : 'NONE ACTIVE'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {PARAMS.map(({ key, label, description }) => {
                const val = filters[key];
                const active = val >= 0;
                return (
                  <div key={key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div>
                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: active ? '#E3E0D5' : '#E3E0D5', opacity: active ? 1 : 0.35, letterSpacing: '0.15em' }}>
                          {label}
                        </span>
                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '7px', color: '#E3E0D5', opacity: 0.22, letterSpacing: '0.08em', marginLeft: '8px' }}>
                          {description}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: active ? '#8B1E1E' : '#E3E0D5', opacity: active ? 1 : 0.25, letterSpacing: '0.08em', minWidth: '28px', textAlign: 'right' }}>
                          {active ? val : '—'}
                        </span>
                        {active && (
                          <button
                            onClick={() => resetParam(key)}
                            style={{
                              background: 'transparent', border: 'none',
                              color: '#E3E0D5', opacity: 0.3, cursor: 'pointer',
                              fontFamily: "'Space Mono', monospace", fontSize: '10px',
                            }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '0.3'}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={active ? val : 50}
                      onChange={e => setParam(key, parseInt(e.target.value))}
                      onMouseDown={() => { if (!active) setParam(key, 50); }}
                      style={{
                        width: '100%',
                        height: '2px',
                        appearance: 'none',
                        background: active
                          ? `linear-gradient(to right, #8B1E1E ${val}%, rgba(227,224,213,0.15) ${val}%)`
                          : 'rgba(227,224,213,0.1)',
                        outline: 'none',
                        cursor: 'pointer',
                        accentColor: '#8B1E1E',
                        opacity: active ? 1 : 0.4,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Results */}
          <div>
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: '#E3E0D5', opacity: 0.3, letterSpacing: '0.18em', margin: '0 0 20px' }}>
              {activeCount > 0 ? `CLOSEST MATCHES — ${results.length} RESULTS` : 'RESULTS'}
            </p>

            {activeCount === 0 ? (
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#E3E0D5', opacity: 0.2, letterSpacing: '0.1em', lineHeight: 1.8 }}>
                ACTIVATE AT LEAST ONE<br />PARAMETER TO SEE RESULTS.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(227,224,213,0.06)' }}>
                {results.map(({ artist, profile, score }, i) => (
                  <button
                    key={artist.id}
                    onClick={() => onSelectArtist(artist.id)}
                    style={{
                      background: '#111211',
                      border: 'none',
                      padding: '12px 14px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#161817'}
                    onMouseLeave={e => e.currentTarget.style.background = '#111211'}
                  >
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '7px', color: i === 0 ? '#8B1E1E' : '#E3E0D5', opacity: i === 0 ? 0.9 : 0.2, width: '18px', flexShrink: 0 }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#E3E0D5', letterSpacing: '0.08em', marginBottom: '6px', opacity: i === 0 ? 1 : 0.7 }}>
                        {artist.name}
                      </div>
                      {/* Mini profile bars */}
                      <div style={{ display: 'flex', gap: '3px' }}>
                        {PARAMS.map(({ key }) => {
                          const active = filters[key] >= 0;
                          return (
                            <div key={key} style={{ flex: 1, height: '2px', background: 'rgba(227,224,213,0.08)', position: 'relative' }}>
                              <div style={{
                                position: 'absolute', left: 0, top: 0, bottom: 0,
                                width: `${profile[key]}%`,
                                background: active ? '#8B1E1E' : 'rgba(227,224,213,0.3)',
                              }} />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '7px', color: '#E3E0D5', opacity: 0.2, flexShrink: 0 }}>
                      Δ{Math.round(score)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
