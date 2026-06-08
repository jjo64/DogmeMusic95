import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useQuery, useMutation } from '@apollo/client';
import { GrainOverlay } from './components/GrainOverlay';
import { MainNav, TabId } from './components/MainNav';
import { GraphCanvas } from './components/GraphCanvas';
import { ArtistPanel } from './components/ArtistPanel';
import { ExplorationHistory } from './components/ExplorationHistory';

import { LandingView } from './views/LandingView';
import { TimelineView } from './views/TimelineView';
import { CollectionsView } from './views/CollectionsView';
import { SoundSearch } from './views/SoundSearchView';
import { CommunityView } from './views/CommunityView';
import { MyArchiveView } from './views/MyArchiveView';

import { Collection } from './data/collections-data';
import { UserList } from './data/user-data';

import {
  GET_ARTIST_GRAPH, GET_MY_LISTS, GET_EXPLORATION_HISTORY,
  GET_COLLECTIONS, GET_TIMELINE_ARTISTS, DISCOVER_ARTISTS
} from './graphql/queries';
import {
  ADD_HISTORY_ENTRY, CLEAR_HISTORY, CREATE_LIST, DELETE_LIST,
  RENAME_LIST, SAVE_ARTIST_TO_LIST, REMOVE_ARTIST_FROM_LIST
} from './graphql/mutations';

type Page = 'landing' | 'app';

export default function App() {
  const [page, setPage] = useState<Page>('landing');
  const [activeTab, setActiveTab] = useState<TabId>('network');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [highlightedArtistIds, setHighlightedArtistIds] = useState<string[]>([]);

  // Apollo Queries
  const { data, loading, error, startPolling, stopPolling, refetch } = useQuery(GET_ARTIST_GRAPH, {
    variables: { name: searchQuery },
    skip: !searchQuery || page !== 'app' || activeTab !== 'network',
    fetchPolicy: 'network-only',
  });

  const { data: listsData, refetch: refetchLists } = useQuery(GET_MY_LISTS, {
    skip: page !== 'app',
  });

  const { data: historyData, refetch: refetchHistory } = useQuery(GET_EXPLORATION_HISTORY, {
    skip: page !== 'app',
  });

  // Apollo Mutations
  const [createListMutation] = useMutation(CREATE_LIST, { onCompleted: () => refetchLists() });
  const [deleteListMutation] = useMutation(DELETE_LIST, { onCompleted: () => refetchLists() });
  const [renameListMutation] = useMutation(RENAME_LIST, { onCompleted: () => refetchLists() });
  const [saveArtistToListMutation] = useMutation(SAVE_ARTIST_TO_LIST, { onCompleted: () => refetchLists() });
  const [removeArtistFromListMutation] = useMutation(REMOVE_ARTIST_FROM_LIST, { onCompleted: () => refetchLists() });
  const [addHistoryEntryMutation] = useMutation(ADD_HISTORY_ENTRY, { onCompleted: () => refetchHistory() });
  const [clearHistoryMutation] = useMutation(CLEAR_HISTORY, { onCompleted: () => refetchHistory() });

  const graphResult = data?.artistGraph;
  const jobStatus = graphResult?.status; // PENDING | COMPLETED | FAILED
  const graphData = graphResult?.graph;
  const queryError = error?.message || graphResult?.error;

  const userLists = (listsData?.myLists || []).map((l: any) => ({
    id: l.id,
    name: l.name,
    artistIds: l.artistIds,
    createdAt: parseInt(l.createdAt) || Date.now(),
  }));

  const history = (historyData?.explorationHistory || []).map((h: any) => ({
    id: h.artist.id,
    name: h.artist.name,
    era: h.artist.era,
  }));

  // Poll every 2 seconds if the job is generating in the background
  useEffect(() => {
    if (jobStatus === 'PENDING') {
      console.log('[App] Job is pending. Starting polling...');
      startPolling(2000);
    } else {
      stopPolling();
    }
    return () => {
      stopPolling();
    };
  }, [jobStatus, startPolling, stopPolling]);

  const addToHistory = useCallback(async (id: string) => {
    try {
      await addHistoryEntryMutation({ variables: { artistId: id } });
    } catch (err) {
      console.error('Error logging history entry:', err);
    }
  }, [addHistoryEntryMutation]);

  const handleClearHistory = useCallback(async () => {
    try {
      await clearHistoryMutation();
    } catch (err) {
      console.error('Error clearing history:', err);
    }
  }, [clearHistoryMutation]);

  // Log root artist to history when LLM graph completes successfully
  useEffect(() => {
    if (jobStatus === 'COMPLETED' && graphData && searchQuery) {
      const rootArtistName = graphData.metadata.rootArtist;
      const rootNode = graphData.nodes.find(
        (n: any) => n.label.toLowerCase() === rootArtistName.toLowerCase() ||
                    n.id.toLowerCase() === rootArtistName.toLowerCase().replace(/[^a-z0-9]/g, '-')
      );
      if (rootNode) {
        addToHistory(rootNode.id);
      }
    }
  }, [jobStatus, graphData, searchQuery, addToHistory]);

  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) return;
    setSearchQuery(query);
    setSelectedArtistId(null);
    setPanelOpen(false);
    setActiveTab('network');
    setPage('app');
  }, []);

  const handleSelectArtist = useCallback((id: string) => {
    setSelectedArtistId(id);
    setPanelOpen(true);
    addToHistory(id);
  }, [addToHistory]);

  const handleClosePanel = useCallback(() => {
    setPanelOpen(false);
    setSelectedArtistId(null);
  }, []);

  const handleExploreNetwork = useCallback((artistId: string) => {
    setSelectedArtistId(null);
    setPanelOpen(false);
    setSearchQuery(artistId);
    setActiveTab('network');
  }, []);

  const handleBack = useCallback(() => {
    setPage('landing');
    setPanelOpen(false);
    setSelectedArtistId(null);
  }, []);

  const handleLoadCollection = useCallback((collection: Collection) => {
    setSelectedArtistId(null);
    setPanelOpen(false);
    setHighlightedArtistIds(collection.artistIds);
    setSearchQuery('');
    setActiveTab('network');
  }, []);

  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab);
    setPanelOpen(false);
    setSelectedArtistId(null);
  }, []);

  const handleHistorySelect = useCallback((id: string) => {
    setSelectedArtistId(id);
    setPanelOpen(true);
    addToHistory(id);
    setActiveTab('network');
  }, [addToHistory]);

  // --- User Lists callbacks ---

  const handleCreateList = useCallback(async (name: string) => {
    try {
      await createListMutation({ variables: { name } });
    } catch (err) {
      console.error('Error creating list:', err);
    }
  }, [createListMutation]);

  const handleDeleteList = useCallback(async (listId: string) => {
    try {
      await deleteListMutation({ variables: { id: listId } });
    } catch (err) {
      console.error('Error deleting list:', err);
    }
  }, [deleteListMutation]);

  const handleRenameList = useCallback(async (listId: string, name: string) => {
    try {
      await renameListMutation({ variables: { id: listId, name } });
    } catch (err) {
      console.error('Error renaming list:', err);
    }
  }, [renameListMutation]);

  const handleSaveToList = useCallback(async (artistId: string, listId: string) => {
    try {
      await saveArtistToListMutation({ variables: { artistId, listId } });
    } catch (err) {
      console.error('Error saving artist to list:', err);
    }
  }, [saveArtistToListMutation]);

  const handleCreateAndSave = useCallback(async (artistId: string, listName: string) => {
    try {
      const res = await createListMutation({ variables: { name: listName } });
      const newListId = res.data?.createList?.id;
      if (newListId) {
        await saveArtistToListMutation({ variables: { artistId, listId: newListId } });
      }
    } catch (err) {
      console.error('Error creating and saving to list:', err);
    }
  }, [createListMutation, saveArtistToListMutation]);

  const handleRemoveFromList = useCallback(async (artistId: string, listId: string) => {
    try {
      await removeArtistFromListMutation({ variables: { artistId, listId } });
    } catch (err) {
      console.error('Error removing artist from list:', err);
    }
  }, [removeArtistFromListMutation]);

  const handleLoadList = useCallback((list: UserList) => {
    setHighlightedArtistIds(list.artistIds);
    setActiveTab('network');
    setSearchQuery('');
    setPanelOpen(false);
    setSelectedArtistId(null);
  }, []);

  // Determine if we are rendering a live dynamic graph node or static node
  const isLiveGraph = activeTab === 'network' && !!graphData && !!searchQuery;
  const selectedNode = isLiveGraph ? graphData.nodes.find((n: any) => n.id === selectedArtistId) : null;
  const relatedLinks = isLiveGraph ? graphData.links.filter(
    (l: any) => l.source === selectedArtistId || l.target === selectedArtistId || 
                 (typeof l.source === 'object' && (l.source.id === selectedArtistId || l.target.id === selectedArtistId))
  ) : [];

  if (page === 'landing') {
    return (
      <div style={{ width: '100%', minHeight: '100vh', background: '#111211', position: 'relative' }}>
        <GrainOverlay />
        <LandingView onSearch={handleSearch} />
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100vh', background: '#111211', position: 'relative', overflow: 'hidden' }}>
      <GrainOverlay />

      <MainNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        searchQuery={searchQuery}
        onSearch={handleSearch}
        onBack={handleBack}
        historyCount={history.length}
        historyOpen={historyOpen}
        onToggleHistory={() => setHistoryOpen(o => !o)}
      />

      {/* Content area: fills space below fixed 50px nav */}
      <div style={{ position: 'absolute', top: '50px', left: 0, right: 0, bottom: 0, display: 'flex', overflow: 'hidden' }}>

        {/* Exploration history sidebar */}
        <AnimatePresence>
          {historyOpen && (
            <ExplorationHistory
              key="history"
              history={history}
              onSelectArtist={handleHistorySelect}
              onClear={handleClearHistory}
              onClose={() => setHistoryOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Main content */}
        <div style={{ flex: 1, overflow: 'hidden', height: '100%' }}>

          {activeTab === 'network' && (
            <>
              {/* a. Loading state (when GraphQL request starts) */}
              {loading && !graphResult && (
                <div style={loadingContainerStyle}>
                  <div style={spinnerStyle} />
                  <span style={loadingTextStyle}>CONECTANDO CON EL ARCHIVO…</span>
                </div>
              )}

              {/* b. Generating/Pending State */}
              {jobStatus === 'PENDING' && (
                <div style={loadingContainerStyle}>
                  <div style={pulseCircleStyle} />
                  <span style={loadingTextStyle}>
                    ANALIZANDO INFLUENCIAS DE {searchQuery.toUpperCase()}…
                  </span>
                  <span style={subloadingTextStyle}>
                    CONSTRUYENDO GRAFO CON CLAUDE LLM (ESTO PUEDE TOMAR 10 SEGUNDOS)
                  </span>
                </div>
              )}

              {/* c. Failed State */}
              {jobStatus === 'FAILED' && (
                <div style={loadingContainerStyle}>
                  <span style={errorIconStyle}>⚠</span>
                  <span style={errorTextStyle}>FALLÓ LA GENERACIÓN DEL ECO-SISTEMA</span>
                  <p style={errorSubTextStyle}>{queryError}</p>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button onClick={() => refetch()} style={buttonStyle}>
                      REINTENTAR
                    </button>
                    <button onClick={() => setSearchQuery('')} style={secondaryButtonStyle}>
                      VER BASE ESTÁTICA
                    </button>
                  </div>
                </div>
              )}

              {/* d. Success State or Offline State */}
              {(!searchQuery || (jobStatus === 'COMPLETED' && graphData)) && (
                <GraphCanvas
                  searchQuery={searchQuery}
                  selectedArtistId={selectedArtistId}
                  onSelectArtist={handleSelectArtist}
                  highlightedArtistIds={highlightedArtistIds}
                  graphData={graphData} // passed dynamically
                />
              )}
            </>
          )}

          {activeTab === 'timeline' && (
            <TimelineView
              onSelectArtist={handleSelectArtist}
              selectedArtistId={selectedArtistId}
            />
          )}

          {activeTab === 'collections' && (
            <CollectionsView
              onLoadCollection={handleLoadCollection}
              onSelectArtist={handleSelectArtist}
            />
          )}

          {activeTab === 'discover' && (
            <SoundSearch
              onSelectArtist={handleSelectArtist}
            />
          )}

          {activeTab === 'community' && (
            <CommunityView
              onSelectArtist={handleSelectArtist}
            />
          )}

          {activeTab === 'archive' && (
            <MyArchiveView
              userLists={userLists}
              onSelectArtist={handleSelectArtist}
              onLoadList={handleLoadList}
              onDeleteList={handleDeleteList}
              onCreateList={handleCreateList}
              onRemoveFromList={handleRemoveFromList}
              onRenameList={handleRenameList}
            />
          )}
        </div>
      </div>

      {/* Artist detail panel */}
      <AnimatePresence>
        {panelOpen && selectedArtistId && (
          <ArtistPanel
            key={selectedArtistId}
            artistId={selectedArtistId}
            onClose={handleClosePanel}
            onExploreNetwork={handleExploreNetwork}
            userLists={userLists}
            onSaveToList={handleSaveToList}
            onCreateAndSave={handleCreateAndSave}
            // Dynamic/live properties
            node={selectedNode}
            graphLinks={relatedLinks}
            graphNodes={graphData?.nodes}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Styles (Premium Dogme 95 Theme) ──────────────────────────────────────────

const loadingContainerStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#111211',
  padding: '20px',
  textAlign: 'center',
};

const spinnerStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  border: '1px solid rgba(227, 224, 213, 0.1)',
  borderTop: '1px solid #8B1E1E',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  marginBottom: '20px',
};

const pulseCircleStyle: React.CSSProperties = {
  width: '18px',
  height: '18px',
  background: '#8B1E1E',
  borderRadius: '50%',
  animation: 'pulse 1.6s ease-in-out infinite',
  marginBottom: '24px',
};

const loadingTextStyle: React.CSSProperties = {
  fontFamily: "'Space Mono', monospace",
  fontSize: '11px',
  color: '#E3E0D5',
  letterSpacing: '0.22em',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  margin: '8px 0',
};

const subloadingTextStyle: React.CSSProperties = {
  fontFamily: "'Space Mono', monospace",
  fontSize: '8px',
  color: '#E3E0D5',
  opacity: 0.35,
  letterSpacing: '0.12em',
  marginTop: '4px',
};

const errorIconStyle: React.CSSProperties = {
  fontSize: '28px',
  color: '#8B1E1E',
  marginBottom: '16px',
};

const errorTextStyle: React.CSSProperties = {
  fontFamily: "'Space Mono', monospace",
  fontSize: '11px',
  color: '#8B1E1E',
  letterSpacing: '0.22em',
  fontWeight: 'bold',
};

const errorSubTextStyle: React.CSSProperties = {
  fontFamily: "'Space Mono', monospace",
  fontSize: '8px',
  color: '#E3E0D5',
  opacity: 0.5,
  maxWidth: '400px',
  lineHeight: 1.5,
  marginTop: '8px',
};

const buttonStyle: React.CSSProperties = {
  background: '#8B1E1E',
  border: 'none',
  padding: '8px 20px',
  color: '#E3E0D5',
  fontFamily: "'Space Mono', monospace",
  fontSize: '8px',
  letterSpacing: '0.15em',
  cursor: 'pointer',
  transition: 'background 0.2s',
};

const secondaryButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid rgba(227, 224, 213, 0.2)',
  padding: '8px 20px',
  color: '#E3E0D5',
  fontFamily: "'Space Mono', monospace",
  fontSize: '8px',
  letterSpacing: '0.15em',
  cursor: 'pointer',
  transition: 'border-color 0.2s',
};
