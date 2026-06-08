import { useState } from 'react';
import { PROPOSED_CONNECTIONS, ProposedConnection } from '../data/collections-data';
import { ARTISTS } from '../data/artists-data';

interface Props {
  onSelectArtist: (id: string) => void;
}

export function CommunityView({ onSelectArtist }: Props) {
  const [votes, setVotes] = useState<Record<string, 1 | -1 | 0>>({});
  const [proposals, setProposals] = useState<ProposedConnection[]>(PROPOSED_CONNECTIONS);
  const [form, setForm] = useState({ source: '', target: '', reason: '' });
  const [submitted, setSubmitted] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED'>('ALL');

  function handleVote(id: string, dir: 1 | -1) {
    const current = votes[id] ?? 0;
    const newDir = current === dir ? 0 : dir;
    setVotes(prev => ({ ...prev, [id]: newDir }));
    setProposals(prev => prev.map(p => {
      if (p.id !== id) return p;
      const delta = newDir - (current ?? 0);
      return { ...p, votes: p.votes + delta };
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.source.trim() || !form.target.trim() || !form.reason.trim()) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setForm({ source: '', target: '', reason: '' });
  }

  const filtered = proposals.filter(p =>
    filter === 'ALL' ? true : p.status === filter
  );

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#111211', padding: '32px 24px' }}>
      <div style={{ maxWidth: '820px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px', borderBottom: '1px solid rgba(227,224,213,0.08)', paddingBottom: '24px' }}>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#8B1E1E', letterSpacing: '0.22em', margin: '0 0 8px' }}>
            LIVING ARCHIVE
          </p>
          <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 'clamp(28px, 5vw, 56px)', color: '#E3E0D5', fontWeight: 400, lineHeight: 0.9, margin: '0 0 16px', letterSpacing: '-0.01em' }}>
            COMMUNITY
          </h2>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: '#E3E0D5', opacity: 0.38, letterSpacing: '0.06em', lineHeight: 1.8, margin: 0, maxWidth: '500px' }}>
            PROPOSE NEW CONNECTIONS. VOTE ON EXISTING PROPOSALS. THE MOST SUPPORTED LINKS WILL BE ADDED TO THE ARCHIVE.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: '32px' }}>

          {/* Proposals list */}
          <div>
            {/* Filter */}
            <div style={{ display: 'flex', gap: '0', marginBottom: '16px', borderBottom: '1px solid rgba(227,224,213,0.08)' }}>
              {(['ALL', 'PENDING', 'APPROVED'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    background: 'transparent', border: 'none',
                    borderBottom: filter === f ? '2px solid #8B1E1E' : '2px solid transparent',
                    padding: '6px 12px',
                    color: '#E3E0D5',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '8px', letterSpacing: '0.12em',
                    cursor: 'pointer',
                    opacity: filter === f ? 1 : 0.32,
                    transition: 'opacity 0.12s',
                  }}
                  onMouseEnter={e => { if (filter !== f) e.currentTarget.style.opacity = '0.65'; }}
                  onMouseLeave={e => { if (filter !== f) e.currentTarget.style.opacity = '0.32'; }}
                >
                  {f}
                </button>
              ))}
              <span style={{ marginLeft: 'auto', fontFamily: "'Space Mono', monospace", fontSize: '7px', color: '#E3E0D5', opacity: 0.2, alignSelf: 'center', letterSpacing: '0.1em' }}>
                {filtered.length} PROPOSALS
              </span>
            </div>

            {/* Proposal cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(227,224,213,0.06)' }}>
              {filtered.map(p => {
                const myVote = votes[p.id] ?? 0;
                return (
                  <div key={p.id} style={{ background: '#111211', padding: '16px' }}>
                    {/* Connection line */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => onSelectArtist(p.sourceId)}
                        style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#E3E0D5', letterSpacing: '0.08em', opacity: 0.8 }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}
                      >
                        {p.sourceName}
                      </button>
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: '#8B1E1E', opacity: 0.6 }}>→</span>
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#E3E0D5', opacity: 0.5, letterSpacing: '0.08em' }}>
                        {p.targetName}
                      </span>
                      <span style={{
                        marginLeft: 'auto',
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '7px',
                        color: p.status === 'APPROVED' ? '#8B1E1E' : '#E3E0D5',
                        opacity: p.status === 'APPROVED' ? 0.9 : 0.2,
                        letterSpacing: '0.12em',
                        flexShrink: 0,
                      }}>
                        {p.status}
                      </span>
                    </div>

                    <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: '#E3E0D5', opacity: 0.45, lineHeight: 1.8, letterSpacing: '0.03em', margin: '0 0 12px' }}>
                      {p.reason}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => handleVote(p.id, 1)}
                          style={{
                            background: myVote === 1 ? 'rgba(139,30,30,0.2)' : 'transparent',
                            border: `1px solid ${myVote === 1 ? 'rgba(139,30,30,0.6)' : 'rgba(227,224,213,0.15)'}`,
                            padding: '3px 8px',
                            color: myVote === 1 ? '#8B1E1E' : '#E3E0D5',
                            fontFamily: "'Space Mono', monospace",
                            fontSize: '8px', cursor: 'pointer', letterSpacing: '0.08em',
                            opacity: myVote === -1 ? 0.3 : 1,
                            transition: 'all 0.12s',
                          }}
                        >
                          ▲ {p.votes + (myVote === 1 ? 0 : 0)}
                        </button>
                        <button
                          onClick={() => handleVote(p.id, -1)}
                          style={{
                            background: myVote === -1 ? 'rgba(50,50,50,0.3)' : 'transparent',
                            border: `1px solid ${myVote === -1 ? 'rgba(227,224,213,0.3)' : 'rgba(227,224,213,0.1)'}`,
                            padding: '3px 8px',
                            color: '#E3E0D5',
                            fontFamily: "'Space Mono', monospace",
                            fontSize: '8px', cursor: 'pointer', letterSpacing: '0.08em',
                            opacity: myVote === 1 ? 0.3 : 0.5,
                            transition: 'all 0.12s',
                          }}
                        >
                          ▼
                        </button>
                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '7px', color: '#E3E0D5', opacity: 0.2, letterSpacing: '0.08em' }}>
                          BY {p.proposedBy} · {p.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Propose form */}
          <div>
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: '#E3E0D5', opacity: 0.3, letterSpacing: '0.18em', margin: '0 0 20px' }}>
              PROPOSE A CONNECTION
            </p>
            {submitted ? (
              <div style={{
                border: '1px solid rgba(139,30,30,0.4)',
                padding: '24px',
                fontFamily: "'Space Mono', monospace",
                fontSize: '9px', color: '#8B1E1E',
                letterSpacing: '0.1em', lineHeight: 1.8,
              }}>
                PROPOSAL SUBMITTED.<br />PENDING COMMUNITY REVIEW.
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { key: 'source', label: 'SOURCE ARTIST', placeholder: 'E.G. NICK CAVE' },
                  { key: 'target', label: 'TARGET ARTIST', placeholder: 'E.G. CHELSEA WOLFE' },
                ].map(field => (
                  <div key={field.key}>
                    <label style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: '#E3E0D5', opacity: 0.35, letterSpacing: '0.15em', display: 'block', marginBottom: '6px' }}>
                      {field.label}
                    </label>
                    <input
                      value={form[field.key as 'source' | 'target']}
                      onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      list={field.key === 'source' || field.key === 'target' ? 'artist-options' : undefined}
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: '1px solid rgba(227,224,213,0.2)',
                        outline: 'none',
                        color: '#E3E0D5',
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '9px', letterSpacing: '0.08em',
                        padding: '8px 0',
                        caretColor: '#8B1E1E',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                ))}
                <datalist id="artist-options">
                  {ARTISTS.map(a => <option key={a.id} value={a.name} />)}
                </datalist>

                <div>
                  <label style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: '#E3E0D5', opacity: 0.35, letterSpacing: '0.15em', display: 'block', marginBottom: '6px' }}>
                    REASONING
                  </label>
                  <textarea
                    value={form.reason}
                    onChange={e => setForm(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="EXPLAIN THE INFLUENCE CONNECTION..."
                    rows={4}
                    style={{
                      width: '100%',
                      background: 'rgba(227,224,213,0.03)',
                      border: '1px solid rgba(227,224,213,0.12)',
                      outline: 'none',
                      color: '#E3E0D5',
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '9px', letterSpacing: '0.06em', lineHeight: 1.8,
                      padding: '10px 12px',
                      caretColor: '#8B1E1E',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    background: '#8B1E1E',
                    border: 'none',
                    padding: '12px',
                    color: '#E3E0D5',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '9px', letterSpacing: '0.2em',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#a02424'}
                  onMouseLeave={e => e.currentTarget.style.background = '#8B1E1E'}
                >
                  SUBMIT PROPOSAL →
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
