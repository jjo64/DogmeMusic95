import { useState } from 'react';
import { UserList } from '../data/user-data';
import { getArtistById } from '../data/artists-data';

interface Props {
  userLists: UserList[];
  onSelectArtist: (id: string) => void;
  onLoadList: (list: UserList) => void;
  onDeleteList: (listId: string) => void;
  onCreateList: (name: string) => void;
  onRemoveFromList: (artistId: string, listId: string) => void;
  onRenameList: (listId: string, name: string) => void;
}

export function MyArchiveView({
  userLists, onSelectArtist, onLoadList, onDeleteList, onCreateList, onRemoveFromList, onRenameList,
}: Props) {
  const [newListName, setNewListName] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState('');

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newListName.trim()) return;
    onCreateList(newListName.trim());
    setNewListName('');
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#111211', padding: '32px 24px' }}>
      <div style={{ maxWidth: '820px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px', borderBottom: '1px solid rgba(227,224,213,0.08)', paddingBottom: '24px' }}>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#8B1E1E', letterSpacing: '0.22em', margin: '0 0 8px' }}>
            PERSONAL ARCHIVE
          </p>
          <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 'clamp(28px, 5vw, 56px)', color: '#E3E0D5', fontWeight: 400, lineHeight: 0.9, margin: '0 0 16px', letterSpacing: '-0.01em' }}>
            MY LISTS
          </h2>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: '#E3E0D5', opacity: 0.38, letterSpacing: '0.06em', lineHeight: 1.8, margin: 0, maxWidth: '500px' }}>
            CURATE YOUR OWN SUBSETS OF THE ARCHIVE. SAVE ARTISTS FROM THE DETAIL PANEL TO BUILD YOUR COLLECTIONS.
          </p>
        </div>

        {/* Create new list form */}
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '8px', marginBottom: '32px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: '#E3E0D5', opacity: 0.3, letterSpacing: '0.15em', display: 'block', marginBottom: '6px' }}>
              NEW LIST
            </label>
            <input
              value={newListName}
              onChange={e => setNewListName(e.target.value)}
              placeholder="NAME YOUR LIST…"
              style={{
                width: '100%', background: 'transparent', border: 'none',
                borderBottom: '1px solid rgba(227,224,213,0.25)', outline: 'none',
                color: '#E3E0D5', fontFamily: "'Space Mono', monospace",
                fontSize: '10px', letterSpacing: '0.08em', padding: '8px 0',
                caretColor: '#8B1E1E', boxSizing: 'border-box',
              }}
            />
          </div>
          <button type="submit" style={{
            background: '#8B1E1E', border: 'none', padding: '10px 16px',
            color: '#E3E0D5', fontFamily: "'Space Mono', monospace",
            fontSize: '8px', letterSpacing: '0.2em', cursor: 'pointer',
            flexShrink: 0, transition: 'background 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#a02424'}
            onMouseLeave={e => e.currentTarget.style.background = '#8B1E1E'}
          >
            + CREATE
          </button>
        </form>

        {/* Empty state */}
        {userLists.length === 0 && (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#E3E0D5', opacity: 0.2, letterSpacing: '0.12em', lineHeight: 2, margin: 0 }}>
              NO LISTS YET.<br />
              CREATE ONE ABOVE, THEN SAVE ARTISTS<br />
              FROM THEIR DETAIL PANELS.
            </p>
          </div>
        )}

        {/* Lists */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: userLists.length > 0 ? 'rgba(227,224,213,0.06)' : 'transparent' }}>
          {userLists.map(list => {
            const isDeleting = deletingId === list.id;
            const isRenaming = renamingId === list.id;

            return (
              <div key={list.id} style={{ background: '#111211', padding: '20px' }}>
                {/* List header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {isRenaming ? (
                      <form onSubmit={e => { e.preventDefault(); if (renameVal.trim()) { onRenameList(list.id, renameVal.trim()); } setRenamingId(null); }} style={{ display: 'flex', gap: '6px' }}>
                        <input
                          autoFocus
                          value={renameVal}
                          onChange={e => setRenameVal(e.target.value)}
                          style={{
                            flex: 1, background: 'transparent', border: 'none',
                            borderBottom: '1px solid rgba(227,224,213,0.3)', outline: 'none',
                            color: '#E3E0D5', fontFamily: "'Anton', sans-serif",
                            fontSize: '18px', letterSpacing: '0.03em', padding: '2px 0',
                            caretColor: '#8B1E1E',
                          }}
                        />
                        <button type="submit" style={{ background: 'transparent', border: 'none', color: '#8B1E1E', fontFamily: "'Space Mono', monospace", fontSize: '8px', cursor: 'pointer', opacity: 0.8 }}>✓</button>
                        <button type="button" onClick={() => setRenamingId(null)} style={{ background: 'transparent', border: 'none', color: '#E3E0D5', fontFamily: "'Space Mono', monospace", fontSize: '8px', cursor: 'pointer', opacity: 0.4 }}>✕</button>
                      </form>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                        <h3 style={{ fontFamily: "'Anton', sans-serif", fontSize: 'clamp(16px, 2.5vw, 22px)', color: '#E3E0D5', fontWeight: 400, margin: 0, letterSpacing: '0.02em' }}>
                          {list.name}
                        </h3>
                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: '#E3E0D5', opacity: 0.25, letterSpacing: '0.1em' }}>
                          {list.artistIds.length} ARTIST{list.artistIds.length !== 1 ? 'S' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Controls */}
                  {!isRenaming && (
                    <div style={{ display: 'flex', gap: '4px', marginLeft: '12px', flexShrink: 0 }}>
                      <button
                        onClick={() => { setRenamingId(list.id); setRenameVal(list.name); }}
                        style={{ background: 'transparent', border: '1px solid rgba(227,224,213,0.1)', padding: '3px 7px', color: '#E3E0D5', fontFamily: "'Space Mono', monospace", fontSize: '7px', letterSpacing: '0.1em', cursor: 'pointer', opacity: 0.4, transition: 'opacity 0.12s' }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '0.4'}
                      >
                        RENAME
                      </button>
                      {isDeleting ? (
                        <>
                          <button onClick={() => { onDeleteList(list.id); setDeletingId(null); }} style={{ background: '#8B1E1E', border: 'none', padding: '3px 7px', color: '#E3E0D5', fontFamily: "'Space Mono', monospace", fontSize: '7px', letterSpacing: '0.1em', cursor: 'pointer' }}>CONFIRM</button>
                          <button onClick={() => setDeletingId(null)} style={{ background: 'transparent', border: '1px solid rgba(227,224,213,0.1)', padding: '3px 7px', color: '#E3E0D5', fontFamily: "'Space Mono', monospace", fontSize: '7px', cursor: 'pointer', opacity: 0.4 }}>CANCEL</button>
                        </>
                      ) : (
                        <button
                          onClick={() => setDeletingId(list.id)}
                          style={{ background: 'transparent', border: '1px solid rgba(227,224,213,0.1)', padding: '3px 7px', color: '#E3E0D5', fontFamily: "'Space Mono', monospace", fontSize: '7px', letterSpacing: '0.1em', cursor: 'pointer', opacity: 0.3, transition: 'opacity 0.12s' }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '0.3'}
                        >
                          × DELETE
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Artist pills */}
                {list.artistIds.length === 0 ? (
                  <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: '#E3E0D5', opacity: 0.2, letterSpacing: '0.1em', margin: '0 0 14px' }}>
                    EMPTY — SAVE ARTISTS FROM THEIR DETAIL PANELS
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '14px' }}>
                    {list.artistIds.map(id => {
                      const artist = getArtistById(id);
                      if (!artist) return null;
                      return (
                        <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                          <button
                            onClick={() => onSelectArtist(id)}
                            style={{
                              background: 'transparent',
                              border: '1px solid rgba(227,224,213,0.18)',
                              borderRight: 'none',
                              padding: '3px 9px',
                              color: '#E3E0D5', fontFamily: "'Space Mono', monospace",
                              fontSize: '7px', letterSpacing: '0.1em',
                              cursor: 'pointer', opacity: 0.65, transition: 'opacity 0.12s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.borderColor = 'rgba(139,30,30,0.6)'; }}
                            onMouseLeave={e => { e.currentTarget.style.opacity = '0.65'; e.currentTarget.style.borderColor = 'rgba(227,224,213,0.18)'; }}
                          >
                            {artist.name}
                          </button>
                          <button
                            onClick={() => onRemoveFromList(id, list.id)}
                            title={`Remove ${artist.name}`}
                            style={{
                              background: 'transparent',
                              border: '1px solid rgba(227,224,213,0.18)',
                              padding: '3px 6px',
                              color: '#E3E0D5', fontFamily: "'Space Mono', monospace",
                              fontSize: '8px', cursor: 'pointer', opacity: 0.3, transition: 'opacity 0.12s, background 0.12s',
                              lineHeight: 1,
                            }}
                            onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(139,30,30,0.2)'; }}
                            onMouseLeave={e => { e.currentTarget.style.opacity = '0.3'; e.currentTarget.style.background = 'transparent'; }}
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => onLoadList(list)}
                    disabled={list.artistIds.length === 0}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: '1px solid rgba(227,224,213,0.15)',
                      padding: '8px',
                      color: '#E3E0D5', fontFamily: "'Space Mono', monospace",
                      fontSize: '8px', letterSpacing: '0.15em',
                      cursor: list.artistIds.length === 0 ? 'default' : 'pointer',
                      opacity: list.artistIds.length === 0 ? 0.2 : 0.5,
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (list.artistIds.length > 0) { e.currentTarget.style.background = '#8B1E1E'; e.currentTarget.style.borderColor = '#8B1E1E'; e.currentTarget.style.opacity = '1'; } }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(227,224,213,0.15)'; e.currentTarget.style.opacity = list.artistIds.length === 0 ? '0.2' : '0.5'; }}
                  >
                    OPEN IN NETWORK →
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
