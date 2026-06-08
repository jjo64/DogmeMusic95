import { useEffect, useRef, useCallback, useState } from 'react';
import * as d3 from 'd3';
import {
  ARTISTS, CONNECTIONS, findCenterArtist, getArtistById,
  getArtistsWithDepth, findShortestPath, getFoundingYear,
} from '../data/artists-data';

interface NodeDatum extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  influence_score: number;
  isCentral: boolean;
  depth: number;
  nodeType: 'artist' | 'genre';
}

interface LinkDatum extends d3.SimulationLinkDatum<NodeDatum> {
  strength: number;
  type: string;
}

type EraFilter = 'ALL' | '≤70s' | '80s' | '90s';
type GraphMode = 'NORMAL' | 'HEATMAP' | 'DEPTH' | 'GENRES' | 'PATH' | '6DEG' | 'COMPARE' | 'DOC';

const ERA_TABS: EraFilter[] = ['ALL', '≤70s', '80s', '90s'];
const MODE_TABS: { id: GraphMode; label: string }[] = [
  { id: 'NORMAL', label: 'NORMAL' },
  { id: 'HEATMAP', label: 'HEATMAP' },
  { id: 'DEPTH', label: 'DEPTH' },
  { id: 'GENRES', label: 'GENRES' },
  { id: 'PATH', label: 'PATH' },
  { id: '6DEG', label: '6°' },
  { id: 'COMPARE', label: 'COMPARE' },
  { id: 'DOC', label: 'CHRONICLE' },
];

// Genre groupings
const GENRE_MAP: Record<string, string> = {
  'POST-PUNK': 'g_POSTPUNK', 'ART PUNK': 'g_POSTPUNK', 'FUNK PUNK': 'g_POSTPUNK', 'MINIMALIST': 'g_POSTPUNK',
  'GOTH ROCK': 'g_GOTH', 'GOTHIC ROCK': 'g_GOTH', 'DARKWAVE': 'g_GOTH', 'NEOCLASSICAL': 'g_GOTH', 'WORLD': 'g_GOTH',
  'ART ROCK': 'g_ARTROCK', 'ALTERNATIVE': 'g_ARTROCK', 'NEW WAVE': 'g_ARTROCK', 'CHAMBER POP': 'g_ARTROCK', 'ORCHESTRAL POP': 'g_ARTROCK', 'BLUES ROCK': 'g_ARTROCK',
  'ELECTRONIC': 'g_ELECTRONIC', 'TRIP-HOP': 'g_ELECTRONIC', 'INDUSTRIAL': 'g_ELECTRONIC',
  'EXPERIMENTAL': 'g_EXPERIMENTAL', 'AVANT-GARDE': 'g_EXPERIMENTAL', 'KRAUTROCK': 'g_EXPERIMENTAL', 'EXPERIMENTAL ROCK': 'g_EXPERIMENTAL',
  'SHOEGAZE': 'g_SHOEGAZE', 'DREAM POP': 'g_SHOEGAZE', 'NOISE ROCK': 'g_SHOEGAZE',
};
const GENRE_NODE_DEFS = [
  { id: 'g_POSTPUNK', name: 'POST-PUNK' },
  { id: 'g_GOTH', name: 'GOTH / DARKWAVE' },
  { id: 'g_ARTROCK', name: 'ART ROCK' },
  { id: 'g_ELECTRONIC', name: 'ELECTRONIC' },
  { id: 'g_EXPERIMENTAL', name: 'EXPERIMENTAL' },
  { id: 'g_SHOEGAZE', name: 'SHOEGAZE' },
];

function matchesEra(era: string, filter: EraFilter): boolean {
  if (filter === 'ALL') return true;
  const year = getFoundingYear(era);
  if (filter === '≤70s') return year <= 1979;
  if (filter === '80s') return year >= 1980 && year <= 1989;
  if (filter === '90s') return year >= 1990;
  return true;
}

interface Props {
  searchQuery: string;
  selectedArtistId: string | null;
  onSelectArtist: (id: string) => void;
  highlightedArtistIds?: string[];
  graphData?: any;
}

export function GraphCanvas({ searchQuery, selectedArtistId, onSelectArtist, highlightedArtistIds = [], graphData }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onSelectArtist);
  onSelectRef.current = onSelectArtist;

  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const svgSelRef = useRef<d3.Selection<SVGSVGElement, unknown, null, undefined> | null>(null);
  const nodeSvgMapRef = useRef<Map<string, SVGGElement>>(new Map());
  const sortedForDocRef = useRef<string[]>([]);
  const docIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sixDegIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentNodesRef = useRef<NodeDatum[]>([]);
  const currentLinksRef = useRef<LinkDatum[]>([]);
  const docStepRef = useRef(0);
  const sixDegStepRef = useRef(0);

  const [eraFilter, setEraFilter] = useState<EraFilter>('ALL');
  const [graphMode, setGraphMode] = useState<GraphMode>('NORMAL');
  const [depthLevel, setDepthLevel] = useState<1 | 2 | 3>(2);
  const [pathFrom, setPathFrom] = useState('');
  const [pathTo, setPathTo] = useState('');
  const [pathResult, setPathResult] = useState<string[] | null>(null);
  const [docStep, setDocStep] = useState(0);
  const [docPlaying, setDocPlaying] = useState(false);
  const [sixDegPath, setSixDegPath] = useState<string[] | null>(null);
  const [sixDegStep, setSixDegStep] = useState(0);
  const [sixDegPlaying, setSixDegPlaying] = useState(false);
  const [compareInput, setCompareInput] = useState('');
  const [compareTarget, setCompareTarget] = useState('');
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  docStepRef.current = docStep;
  sixDegStepRef.current = sixDegStep;

  // ── DOC mode interval ─────────────────────────────────────────────
  useEffect(() => {
    if (!docPlaying) { clearInterval(docIntervalRef.current!); return; }
    docIntervalRef.current = setInterval(() => {
      setDocStep(prev => {
        const next = prev + 1;
        if (next >= sortedForDocRef.current.length) { setDocPlaying(false); return prev; }
        return next;
      });
    }, 700);
    return () => clearInterval(docIntervalRef.current!);
  }, [docPlaying]);

  // ── DOC step → update opacity (no rebuild) ───────────────────────
  useEffect(() => {
    if (graphMode !== 'DOC') return;
    sortedForDocRef.current.forEach((id, index) => {
      const el = nodeSvgMapRef.current.get(id);
      if (el) d3.select(el).transition().duration(450).attr('opacity', index <= docStep ? 1 : 0);
    });
  }, [docStep, graphMode]);

  // ── 6DEG interval ─────────────────────────────────────────────────
  useEffect(() => {
    if (!sixDegPlaying) { clearInterval(sixDegIntervalRef.current!); return; }
    sixDegIntervalRef.current = setInterval(() => {
      setSixDegStep(prev => {
        const next = prev + 1;
        if (!sixDegPath || next >= sixDegPath.length) { setSixDegPlaying(false); return prev; }
        return next;
      });
    }, 1200);
    return () => clearInterval(sixDegIntervalRef.current!);
  }, [sixDegPlaying, sixDegPath]);

  // ── 6DEG step → update opacity (no rebuild) ─────────────────────
  useEffect(() => {
    if (graphMode !== '6DEG' || !sixDegPath) return;
    sixDegPath.forEach((id, index) => {
      const el = nodeSvgMapRef.current.get(id);
      if (!el) return;
      const isActive = index === sixDegStep;
      const isRevealed = index <= sixDegStep;
      d3.select(el).transition().duration(500)
        .attr('opacity', isRevealed ? 1 : 0.04)
        .select('.outer-ring')
        .attr('stroke', isActive ? '#E3E0D5' : 'transparent')
        .attr('r', isActive ? 32 : 22);
    });
    // Fade all non-path nodes
    nodeSvgMapRef.current.forEach((el, id) => {
      if (!sixDegPath.includes(id)) {
        d3.select(el).transition().duration(400).attr('opacity', 0.04);
      }
    });
  }, [sixDegStep, graphMode, sixDegPath]);

  const buildGraph = useCallback(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const centerArtist = findCenterArtist(searchQuery);

    let artistNodes: NodeDatum[] = [];
    let influenceLinks: LinkDatum[] = [];
    let genreNodes: NodeDatum[] = [];
    let genreLinks: LinkDatum[] = [];
    let allNodes: NodeDatum[] = [];
    let allLinks: LinkDatum[] = [];

    if (graphData) {
      const rootArtistName = graphData.metadata.rootArtist;
      allNodes = graphData.nodes.map((n: any) => ({
        id: n.id,
        name: n.label,
        influence_score: n.type === 'artist' ? (n.label.toLowerCase() === rootArtistName.toLowerCase() ? 99 : 85) : 50,
        isCentral: n.label.toLowerCase() === rootArtistName.toLowerCase() ||
                   n.id.toLowerCase() === rootArtistName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        depth: 0,
        nodeType: n.type === 'artist' ? 'artist' : 'genre',
        description: n.description,
      }));
      artistNodes = allNodes.filter(n => n.nodeType === 'artist');
      const nodeIds = new Set(allNodes.map(n => n.id));
      allLinks = graphData.links
        .filter((l: any) => {
          const sId = typeof l.source === 'object' ? l.source.id : l.source;
          const tId = typeof l.target === 'object' ? l.target.id : l.target;
          return nodeIds.has(sId) && nodeIds.has(tId);
        })
        .map((l: any) => ({
          source: typeof l.source === 'object' ? l.source.id : l.source,
          target: typeof l.target === 'object' ? l.target.id : l.target,
          strength: l.type === 'influence' ? 0.85 : 0.6,
          type: l.type,
          description: l.description,
        }));
      influenceLinks = allLinks;
    } else {
      // ── Determine visible artist set ─────────────────────────────────
      let nodeIds: Set<string>;
      if (graphMode === 'DEPTH' && centerArtist) {
        nodeIds = new Set(getArtistsWithDepth(centerArtist.id, depthLevel).keys());
      } else if (graphMode === 'COMPARE' && centerArtist && compareTarget) {
        const compareArtist = findCenterArtist(compareTarget);
        const netA = centerArtist ? new Set(getArtistsWithDepth(centerArtist.id, 2).keys()) : new Set<string>();
        const netB = compareArtist ? new Set(getArtistsWithDepth(compareArtist.id, 2).keys()) : new Set<string>();
        nodeIds = new Set([...netA, ...netB]);
      } else if (centerArtist) {
        const connected = CONNECTIONS
          .filter(c => c.source === centerArtist.id || c.target === centerArtist.id)
          .flatMap(c => [c.source as string, c.target as string]);
        nodeIds = new Set([centerArtist.id, ...connected]);
      } else {
        nodeIds = new Set(ARTISTS.map(a => a.id));
      }

      const depthMap = centerArtist ? getArtistsWithDepth(centerArtist.id, 99) : new Map(ARTISTS.map(a => [a.id, 0]));

      // Compare group map
      let compareGroupMap: Map<string, 'A' | 'B' | 'shared'> = new Map();
      if (graphMode === 'COMPARE' && centerArtist && compareTarget) {
        const compareArtist = findCenterArtist(compareTarget);
        const netA = centerArtist ? new Set(getArtistsWithDepth(centerArtist.id, 2).keys()) : new Set<string>();
        const netB = compareArtist ? new Set(getArtistsWithDepth(compareArtist.id, 2).keys()) : new Set<string>();
        nodeIds.forEach(id => {
          const inA = netA.has(id);
          const inB = netB.has(id);
          compareGroupMap.set(id, inA && inB ? 'shared' : inA ? 'A' : 'B');
        });
      }

      artistNodes = ARTISTS
        .filter(a => nodeIds.has(a.id) && matchesEra(a.era, eraFilter))
        .map(a => ({
          id: a.id, name: a.name, influence_score: a.influence_score,
          isCentral: centerArtist?.id === a.id,
          depth: depthMap.get(a.id) ?? 0,
          nodeType: 'artist' as const,
        }));

      const visibleArtistIds = new Set(artistNodes.map(n => n.id));
      influenceLinks = CONNECTIONS
        .filter(c => visibleArtistIds.has(c.source as string) && visibleArtistIds.has(c.target as string))
        .map(c => ({ source: c.source, target: c.target, strength: c.strength, type: c.type }));

      // ── Genre nodes (GENRES mode only) ───────────────────────────────
      if (graphMode === 'GENRES') {
        const usedGenreIds = new Set<string>();
        artistNodes.forEach(an => {
          const artist = getArtistById(an.id);
          if (!artist) return;
          artist.genres.forEach(g => {
            const gid = GENRE_MAP[g];
            if (gid) usedGenreIds.add(gid);
          });
        });
        genreNodes = GENRE_NODE_DEFS
          .filter(gn => usedGenreIds.has(gn.id))
          .map(gn => ({ id: gn.id, name: gn.name, influence_score: 50, isCentral: false, depth: 0, nodeType: 'genre' as const }));
        const genreIdSet = new Set(genreNodes.map(g => g.id));
        artistNodes.forEach(an => {
          const artist = getArtistById(an.id);
          if (!artist) return;
          artist.genres.forEach(g => {
            const gid = GENRE_MAP[g];
            if (gid && genreIdSet.has(gid)) {
              genreLinks.push({ source: an.id, target: gid, strength: 0.35, type: 'GENRE' });
            }
          });
        });
      }

      allNodes = [...artistNodes, ...genreNodes];
      allLinks = [...influenceLinks, ...genreLinks];
    }

    // DOC sort
    if (!graphData) {
      const sortedForDoc = [...artistNodes]
        .sort((a, b) => getFoundingYear(getArtistById(a.id)?.era || '') - getFoundingYear(getArtistById(b.id)?.era || ''))
        .map(n => n.id);
      sortedForDocRef.current = sortedForDoc;
    }

    currentNodesRef.current = allNodes;
    currentLinksRef.current = allLinks;

    // Heatmap
    if (!graphData) {
      const connectionCountMap = new Map<string, number>();
      artistNodes.forEach(n => connectionCountMap.set(n.id, CONNECTIONS.filter(c => c.source === n.id || c.target === n.id).length));
      const maxConn = Math.max(...Array.from(connectionCountMap.values()), 1);
      const heatColor = d3.scaleSequential().domain([0, maxConn]).interpolator(d3.interpolateRgb('#1c201d', '#8B1E1E'));
    }

    // Path set
    const pathSet = new Set(pathResult || []);
    const sixDegSet = new Set(sixDegPath || []);

    // ── SVG setup ────────────────────────────────────────────────────
    const svg = d3.select(svgRef.current) as d3.Selection<SVGSVGElement, unknown, null, undefined>;
    svgSelRef.current = svg;
    nodeSvgMapRef.current = new Map();
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    const defs = svg.append('defs');
    const vigGrad = defs.append('radialGradient').attr('id', 'dogme-vign').attr('cx', '50%').attr('cy', '50%').attr('r', '70%');
    vigGrad.append('stop').attr('offset', '30%').attr('stop-color', '#171c17').attr('stop-opacity', '0.5');
    vigGrad.append('stop').attr('offset', '100%').attr('stop-color', '#111211').attr('stop-opacity', '1');

    svg.append('rect').attr('width', width).attr('height', height).attr('fill', '#111211');
    svg.append('rect').attr('width', width).attr('height', height).attr('fill', 'url(#dogme-vign)');

    const gridG = svg.append('g').attr('opacity', 0.03).attr('pointer-events', 'none');
    for (let x = 0; x < width; x += 64) gridG.append('line').attr('x1', x).attr('y1', 0).attr('x2', x).attr('y2', height).attr('stroke', '#E3E0D5').attr('stroke-width', 0.5);
    for (let y = 0; y < height; y += 64) gridG.append('line').attr('x1', 0).attr('y1', y).attr('x2', width).attr('y2', y).attr('stroke', '#E3E0D5').attr('stroke-width', 0.5);

    const zoomable = svg.append('g').attr('class', 'zoomable');
    const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.15, 8]).on('zoom', event => zoomable.attr('transform', event.transform));
    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    // ── Simulation ───────────────────────────────────────────────────
    const simulation = d3.forceSimulation<NodeDatum>(allNodes)
      .force('link', d3.forceLink<NodeDatum, LinkDatum>(allLinks)
        .id(d => d.id)
        .distance(d => d.type === 'GENRE' ? 75 : 110 + (1 - d.strength) * 80)
        .strength(d => d.type === 'GENRE' ? 0.5 : d.strength * 0.4)
      )
      .force('charge', d3.forceManyBody<NodeDatum>().strength(d => d.nodeType === 'genre' ? -150 : -280))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.06))
      .force('collision', d3.forceCollide<NodeDatum>().radius(d => d.nodeType === 'genre' ? 60 : (d.influence_score / 100) * 22 + 32));

    // ── Links ────────────────────────────────────────────────────────
    const linkG = zoomable.append('g');

    function getLinkColor(d: LinkDatum): string {
      if (graphMode === 'GENRES' && d.type === 'GENRE') return 'rgba(139,30,30,0.25)';
      if (graphMode === 'PATH' && pathResult) {
        const sId = (d.source as NodeDatum).id; const tId = (d.target as NodeDatum).id;
        const inPath = pathResult.some((_, i) => i < pathResult.length - 1 && ((pathResult[i] === sId && pathResult[i + 1] === tId) || (pathResult[i] === tId && pathResult[i + 1] === sId)));
        return inPath ? '#E3E0D5' : '#222722';
      }
      if (graphMode === '6DEG' && sixDegPath) {
        const sId = (d.source as NodeDatum).id; const tId = (d.target as NodeDatum).id;
        const idx = sixDegPath.findIndex((_, i) => i < sixDegPath.length - 1 && ((sixDegPath[i] === sId && sixDegPath[i + 1] === tId) || (sixDegPath[i] === tId && sixDegPath[i + 1] === sId)));
        if (idx >= 0) return idx < sixDegStepRef.current ? '#8B1E1E' : '#222722';
        return '#161816';
      }
      if (graphMode === 'COMPARE') {
        const sGroup = compareGroupMap.get((d.source as NodeDatum).id);
        const tGroup = compareGroupMap.get((d.target as NodeDatum).id);
        if (sGroup === 'A' && tGroup === 'A') return 'rgba(139,30,30,0.5)';
        if (sGroup === 'B' && tGroup === 'B') return 'rgba(46,91,77,0.5)';
        return 'rgba(227,224,213,0.25)';
      }
      if (graphMode === 'HEATMAP') return '#8B1E1E';
      return d.strength > 0.82 ? '#8B1E1E' : '#353832';
    }

    function getLinkOpacity(d: LinkDatum): number {
      if (graphMode === 'GENRES' && d.type === 'GENRE') return 0.5;
      if (graphMode === 'PATH' && pathResult) {
        const sId = (d.source as NodeDatum).id; const tId = (d.target as NodeDatum).id;
        return pathResult.some((_, i) => i < pathResult.length - 1 && ((pathResult[i] === sId && pathResult[i + 1] === tId) || (pathResult[i] === tId && pathResult[i + 1] === sId))) ? 0.9 : 0.04;
      }
      if (graphMode === '6DEG') return 0; // handled per-step
      if (graphMode === 'HEATMAP') return 0.12 + d.strength * 0.6;
      return 0.18 + d.strength * 0.55;
    }

    const linkSel = linkG.selectAll<SVGLineElement, LinkDatum>('line')
      .data(allLinks).join('line')
      .attr('stroke', getLinkColor)
      .attr('stroke-width', d => d.type === 'GENRE' ? 0.5 : 0.5 + d.strength * 1.5)
      .attr('stroke-opacity', getLinkOpacity)
      .attr('stroke-dasharray', d => d.type === 'COLLABORATION' ? '5,4' : d.type === 'GENRE' ? '3,3' : 'none');

    // ── Artist nodes ─────────────────────────────────────────────────
    function getNodeFill(d: NodeDatum): string {
      if (graphMode === 'COMPARE') {
        const group = compareGroupMap.get(d.id);
        if (group === 'A') return '#5a1515';
        if (group === 'B') return '#1a3a2e';
        if (group === 'shared') return '#2a2a2a';
      }
      if (graphMode === 'PATH') { if (pathSet.has(d.id)) return '#8B1E1E'; return '#1a1e1a'; }
      if (graphMode === '6DEG') { if (sixDegSet.has(d.id)) return '#8B1E1E'; return '#161816'; }
      if (graphMode === 'HEATMAP') return heatColor(connectionCountMap.get(d.id) || 0);
      if (graphMode === 'DEPTH') {
        if (d.isCentral) return '#E3E0D5';
        if (d.depth === 1) return '#2a2f2a';
        if (d.depth === 2) return '#1e231e';
        return '#161a16';
      }
      if (highlightedArtistIds.length > 0 && highlightedArtistIds.includes(d.id)) return '#3a2020';
      if (selectedArtistId === d.id) return '#8B1E1E';
      if (d.isCentral) return '#E3E0D5';
      return '#1c201d';
    }

    function getNodeOpacity(d: NodeDatum): number {
      if (graphMode === 'DOC') {
        const idx = sortedForDocRef.current.indexOf(d.id);
        return idx <= docStepRef.current ? 1 : 0;
      }
      if (graphMode === 'PATH' && pathResult) return pathSet.has(d.id) ? 1 : 0.1;
      if (graphMode === '6DEG' && sixDegPath) return sixDegSet.has(d.id) ? 1 : 0.04;
      if (graphMode === 'DEPTH') { if (d.depth === 0) return 1; if (d.depth === 1) return 0.85; if (d.depth === 2) return 0.55; return 0.3; }
      return 1;
    }

    const nodeG = zoomable.append('g');
    const nodeSel = nodeG.selectAll<SVGGElement, NodeDatum>('g')
      .data(artistNodes).join('g')
      .attr('opacity', getNodeOpacity)
      .style('cursor', 'pointer')
      .on('click', (_, d) => onSelectRef.current(d.id));

    nodeSel.each(function (d) { nodeSvgMapRef.current.set(d.id, this); });

    nodeSel.append('circle').attr('class', 'outer-ring')
      .attr('r', d => (d.influence_score / 100) * 20 + 18)
      .attr('fill', 'none')
      .attr('stroke', d => {
        if (graphMode === 'COMPARE') {
          const g = compareGroupMap.get(d.id);
          return g === 'A' ? '#8B1E1E' : g === 'B' ? '#2E5B4D' : '#E3E0D5';
        }
        return selectedArtistId === d.id || pathSet.has(d.id) ? '#8B1E1E' : 'transparent';
      })
      .attr('stroke-width', 1).attr('stroke-opacity', 0.7);

    nodeSel.append('circle').attr('class', 'main-circle')
      .attr('r', d => {
        const base = (d.influence_score / 100) * 20 + 7;
        return graphMode === 'DEPTH' ? base * Math.max(0.5, 1 - d.depth * 0.15) : base;
      })
      .attr('fill', getNodeFill)
      .attr('stroke', d => {
        if (graphMode === 'COMPARE') {
          const g = compareGroupMap.get(d.id);
          return g === 'A' ? 'rgba(139,30,30,0.6)' : g === 'B' ? 'rgba(46,91,77,0.6)' : 'rgba(227,224,213,0.4)';
        }
        return highlightedArtistIds.includes(d.id) ? 'rgba(139,30,30,0.5)' : d.isCentral ? '#E3E0D5' : 'rgba(227,224,213,0.28)';
      })
      .attr('stroke-width', d => d.isCentral ? 1.5 : 0.5);

    nodeSel.append('circle').attr('r', 2.5).attr('fill', d => d.isCentral ? '#111211' : 'rgba(227,224,213,0.4)');

    nodeSel.append('text')
      .text(d => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', d => -((d.influence_score / 100) * 20 + 7) - 9)
      .attr('fill', '#E3E0D5')
      .attr('fill-opacity', d => {
        if (graphMode === 'COMPARE') return 0.75;
        if (graphMode === 'PATH' && pathResult) return pathSet.has(d.id) ? 1 : 0.15;
        if (graphMode === '6DEG' && sixDegPath) return sixDegSet.has(d.id) ? 1 : 0.15;
        return d.isCentral ? 1 : 0.58;
      })
      .attr('font-size', d => d.isCentral ? '10px' : '8px')
      .attr('font-family', "'Space Mono', monospace")
      .attr('letter-spacing', '0.06em')
      .attr('pointer-events', 'none');

    nodeSel
      .on('mouseenter', function (_, d) {
        d3.select(this).select('.main-circle').attr('fill', '#8B1E1E').attr('stroke', '#E3E0D5');
        d3.select(this).select('text').attr('fill-opacity', 1).attr('font-size', '10px');
      })
      .on('mouseleave', function (_, d) {
        d3.select(this).select('.main-circle').attr('fill', getNodeFill(d)).attr('stroke', d.isCentral ? '#E3E0D5' : 'rgba(227,224,213,0.28)');
        d3.select(this).select('text').attr('fill-opacity', d.isCentral ? 1 : 0.58).attr('font-size', d.isCentral ? '10px' : '8px');
      });

    // ── Genre nodes ──────────────────────────────────────────────────
    let genreSel: d3.Selection<SVGGElement, NodeDatum, SVGGElement, unknown> | null = null;
    if (graphMode === 'GENRES' && genreNodes.length > 0) {
      const genreG = zoomable.append('g');
      genreSel = genreG.selectAll<SVGGElement, NodeDatum>('g')
        .data(genreNodes).join('g')
        .style('cursor', 'default');

      genreSel.each(function (d) {
        const g = d3.select(this);
        const textW = d.name.length * 5.8 + 18;
        g.append('rect').attr('x', -textW / 2).attr('y', -11).attr('width', textW).attr('height', 22).attr('rx', 1)
          .attr('fill', 'rgba(20,30,22,0.95)').attr('stroke', 'rgba(139,30,30,0.4)').attr('stroke-width', 1);
        g.append('text').text(d.name)
          .attr('text-anchor', 'middle').attr('dy', '0.35em')
          .attr('fill', '#E3E0D5').attr('fill-opacity', 0.7)
          .attr('font-family', "'Space Mono', monospace").attr('font-size', '7px').attr('letter-spacing', '0.12em')
          .attr('pointer-events', 'none');
      });
    }

    // Depth rings
    if (graphMode === 'DEPTH' && centerArtist) {
      [1, 2, 3].slice(0, depthLevel).forEach(d => {
        zoomable.insert('circle', ':first-child').attr('cx', width / 2).attr('cy', height / 2)
          .attr('r', 100 + d * 110).attr('fill', 'none').attr('stroke', 'rgba(227,224,213,0.04)')
          .attr('stroke-width', 1).attr('stroke-dasharray', '4,4');
      });
    }

    // Drag
    const drag = d3.drag<SVGGElement, NodeDatum>()
      .on('start', (event, d) => { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
      .on('end', (event, d) => { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nodeSel.call(drag as any);

    simulation.on('tick', () => {
      linkSel
        .attr('x1', d => (d.source as NodeDatum).x!).attr('y1', d => (d.source as NodeDatum).y!)
        .attr('x2', d => (d.target as NodeDatum).x!).attr('y2', d => (d.target as NodeDatum).y!);
      nodeSel.attr('transform', d => `translate(${d.x},${d.y})`);
      if (genreSel) genreSel.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => simulation.stop();
  }, [searchQuery, selectedArtistId, eraFilter, graphMode, depthLevel, pathResult, sixDegPath, compareTarget, highlightedArtistIds]);

  useEffect(() => { const c = buildGraph(); return c; }, [buildGraph]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => buildGraph());
    observer.observe(container);
    return () => observer.disconnect();
  }, [buildGraph]);

  // ── Zoom handlers ─────────────────────────────────────────────────
  function handleZoomIn() { svgSelRef.current?.transition().duration(220).call(zoomBehaviorRef.current!.scaleBy, 1.5); }
  function handleZoomOut() { svgSelRef.current?.transition().duration(220).call(zoomBehaviorRef.current!.scaleBy, 1 / 1.5); }
  function handleZoomReset() { svgSelRef.current?.transition().duration(300).call(zoomBehaviorRef.current!.transform, d3.zoomIdentity); }

  // ── Path & 6DEG ─────────────────────────────────────────────────
  function handleFindPath() {
    if (!pathFrom.trim() || !pathTo.trim()) return;
    const fromArtist = findCenterArtist(pathFrom);
    const toArtist = findCenterArtist(pathTo);
    if (!fromArtist || !toArtist) { setPathResult([]); return; }
    setPathResult(findShortestPath(fromArtist.id, toArtist.id) || []);
  }

  function handleStart6Deg() {
    if (!pathFrom.trim() || !pathTo.trim()) return;
    const fromArtist = findCenterArtist(pathFrom);
    const toArtist = findCenterArtist(pathTo);
    if (!fromArtist || !toArtist) { setSixDegPath([]); return; }
    const path = findShortestPath(fromArtist.id, toArtist.id);
    setSixDegPath(path || []);
    setSixDegStep(0);
    setSixDegPlaying(true);
  }

  // ── Export ───────────────────────────────────────────────────────
  function handleExportPNG() {
    if (!svgRef.current) return;
    const svgEl = svgRef.current;
    const svgStr = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    const canvas = document.createElement('canvas');
    canvas.width = svgEl.clientWidth || 1200;
    canvas.height = svgEl.clientHeight || 800;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#111211';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `dogme-network-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    };
    img.src = url;
    setExportMenuOpen(false);
  }

  function handleExportJSON() {
    const data = {
      exported: new Date().toISOString(),
      nodes: currentNodesRef.current.filter(n => n.nodeType === 'artist').map(n => ({ id: n.id, name: n.name, influence_score: n.influence_score })),
      links: currentLinksRef.current.filter(l => l.type !== 'GENRE').map(l => ({
        source: typeof l.source === 'object' ? (l.source as NodeDatum).id : l.source,
        target: typeof l.target === 'object' ? (l.target as NodeDatum).id : l.target,
        strength: l.strength, type: l.type,
      })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `dogme-network-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
    setExportMenuOpen(false);
  }

  const centerArtist = findCenterArtist(searchQuery);

  const modeTabBtn = (tab: { id: GraphMode; label: string }) => (
    <button key={tab.id}
      onClick={() => {
        setGraphMode(tab.id);
        setPathResult(null);
        setSixDegPath(null);
        setSixDegStep(0);
        setSixDegPlaying(false);
        if (tab.id === 'DOC') { setDocStep(0); setDocPlaying(false); }
      }}
      style={{
        background: 'transparent', border: 'none',
        borderBottom: graphMode === tab.id ? '2px solid #8B1E1E' : '2px solid transparent',
        padding: '0 9px', height: '42px',
        color: '#E3E0D5', fontFamily: "'Space Mono', monospace",
        fontSize: '7px', letterSpacing: '0.13em',
        cursor: 'pointer', opacity: graphMode === tab.id ? 1 : 0.28,
        transition: 'opacity 0.15s', whiteSpace: 'nowrap', flexShrink: 0,
      }}
      onMouseEnter={e => { if (graphMode !== tab.id) e.currentTarget.style.opacity = '0.6'; }}
      onMouseLeave={e => { if (graphMode !== tab.id) e.currentTarget.style.opacity = '0.28'; }}
    >{tab.label}</button>
  );

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#111211', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

      {/* ── Row 1: Mode tabs + ERA + Export ─────────────────────────── */}
      <div style={{
        flexShrink: 0, height: '42px', display: 'flex', alignItems: 'stretch',
        borderBottom: '1px solid rgba(227,224,213,0.07)',
        background: 'rgba(17,18,17,0.94)', backdropFilter: 'blur(6px)',
        overflowX: 'auto',
      }}>
        {graphData ? (
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 15px', color: '#8B1E1E', fontFamily: "'Space Mono', monospace", fontSize: '8px', letterSpacing: '0.12em', flexShrink: 0, fontWeight: 'bold' }}>
            ● RED VIVA (LLM CLAUDE)
          </div>
        ) : (
          MODE_TABS.map(modeTabBtn)
        )}

        {!graphData && (
          <>
            <div style={{ width: '1px', height: '22px', background: 'rgba(227,224,213,0.1)', alignSelf: 'center', margin: '0 4px', flexShrink: 0 }} />
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '7px', color: '#E3E0D5', opacity: 0.22, letterSpacing: '0.12em', alignSelf: 'center', marginRight: '3px', flexShrink: 0 }}>ERA</span>
            {ERA_TABS.map(tab => (
              <button key={tab} onClick={() => setEraFilter(tab)} style={{
                background: 'transparent', border: 'none',
                borderBottom: eraFilter === tab ? '2px solid rgba(139,30,30,0.55)' : '2px solid transparent',
                padding: '0 8px', height: '42px', color: '#E3E0D5',
                fontFamily: "'Space Mono', monospace", fontSize: '7px', letterSpacing: '0.1em',
                cursor: 'pointer', opacity: eraFilter === tab ? 0.85 : 0.22, flexShrink: 0,
              }}
                onMouseEnter={e => { if (eraFilter !== tab) e.currentTarget.style.opacity = '0.5'; }}
                onMouseLeave={e => { if (eraFilter !== tab) e.currentTarget.style.opacity = '0.22'; }}
              >{tab}</button>
            ))}
          </>
        )}

        <div style={{ flex: 1 }} />

        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '7px', color: '#8B1E1E', opacity: 0.4, letterSpacing: '0.1em', alignSelf: 'center', marginRight: '8px', flexShrink: 0 }}>
          {graphData ? `● ${graphData.metadata.rootArtist.toUpperCase()} (IA)` : (centerArtist ? `● ${centerArtist.name}` : `${ARTISTS.length} NODES`)}
        </span>

        {/* Export button */}
        <div style={{ position: 'relative', alignSelf: 'center', marginRight: '10px', flexShrink: 0 }}>
          <button onClick={() => setExportMenuOpen(o => !o)} style={{
            background: exportMenuOpen ? 'rgba(139,30,30,0.15)' : 'transparent',
            border: '1px solid rgba(227,224,213,0.14)',
            padding: '3px 8px', color: '#E3E0D5',
            fontFamily: "'Space Mono', monospace", fontSize: '7px', letterSpacing: '0.1em',
            cursor: 'pointer', opacity: 0.6, transition: 'opacity 0.12s',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
          >↓ EXPORT</button>
          {exportMenuOpen && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, zIndex: 50, marginTop: '4px',
              background: '#0e110e', border: '1px solid rgba(227,224,213,0.14)',
              minWidth: '130px',
            }}>
              {[{ label: '↓ PNG IMAGE', fn: handleExportPNG }, { label: '↓ JSON DATA', fn: handleExportJSON }].map(item => (
                <button key={item.label} onClick={item.fn} style={{
                  display: 'block', width: '100%', background: 'transparent', border: 'none',
                  borderBottom: '1px solid rgba(227,224,213,0.07)', padding: '8px 12px',
                  color: '#E3E0D5', fontFamily: "'Space Mono', monospace",
                  fontSize: '7px', letterSpacing: '0.12em', cursor: 'pointer', textAlign: 'left',
                  opacity: 0.65, transition: 'background 0.12s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,30,30,0.15)'; e.currentTarget.style.opacity = '1'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.opacity = '0.65'; }}
                >{item.label}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Row 2: Mode-specific controls ────────────────────────────── */}
      {graphMode === 'DEPTH' && (
        <div style={{ flexShrink: 0, height: '36px', background: 'rgba(17,18,17,0.88)', backdropFilter: 'blur(4px)', borderBottom: '1px solid rgba(227,224,213,0.05)', display: 'flex', alignItems: 'center', padding: '0 14px', gap: '10px' }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '7px', color: '#E3E0D5', opacity: 0.28, letterSpacing: '0.15em', flexShrink: 0 }}>DEPTH</span>
          {([1, 2, 3] as const).map(d => (
            <button key={d} onClick={() => setDepthLevel(d)} style={{
              background: depthLevel === d ? 'rgba(139,30,30,0.2)' : 'transparent',
              border: `1px solid ${depthLevel === d ? 'rgba(139,30,30,0.5)' : 'rgba(227,224,213,0.14)'}`,
              padding: '2px 10px', color: depthLevel === d ? '#8B1E1E' : '#E3E0D5',
              fontFamily: "'Space Mono', monospace", fontSize: '8px', letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 0.12s',
            }}>{d}°</button>
          ))}
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '7px', color: '#E3E0D5', opacity: 0.18, letterSpacing: '0.08em' }}>
            {depthLevel === 1 ? 'DIRECT LINKS ONLY' : depthLevel === 2 ? 'CONNECTIONS OF CONNECTIONS' : 'THREE DEGREES'}
          </span>
        </div>
      )}

      {(graphMode === 'PATH' || graphMode === '6DEG') && (
        <div style={{ flexShrink: 0, height: '36px', background: 'rgba(17,18,17,0.88)', backdropFilter: 'blur(4px)', borderBottom: '1px solid rgba(227,224,213,0.05)', display: 'flex', alignItems: 'center', padding: '0 14px', gap: '8px', overflowX: 'auto' }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '7px', color: '#E3E0D5', opacity: 0.28, letterSpacing: '0.12em', flexShrink: 0 }}>
            {graphMode === '6DEG' ? '6° FROM' : 'FROM'}
          </span>
          {[{ val: pathFrom, set: setPathFrom, ph: 'ARTIST A…' }, { val: pathTo, set: setPathTo, ph: 'ARTIST B…' }].map((f, i) => (
            <input key={i} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
              list="artist-opts-path"
              style={{ flex: '0 1 130px', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(227,224,213,0.2)', outline: 'none', color: '#E3E0D5', fontFamily: "'Space Mono', monospace", fontSize: '8px', letterSpacing: '0.07em', padding: '4px 0', caretColor: '#8B1E1E' }}
            />
          ))}
          <datalist id="artist-opts-path">{ARTISTS.map(a => <option key={a.id} value={a.name} />)}</datalist>

          {graphMode === 'PATH' && (
            <button onClick={handleFindPath} style={{ background: '#8B1E1E', border: 'none', padding: '4px 10px', color: '#E3E0D5', fontFamily: "'Space Mono', monospace", fontSize: '7px', letterSpacing: '0.15em', cursor: 'pointer', flexShrink: 0 }}>FIND →</button>
          )}
          {graphMode === '6DEG' && (
            <>
              <button onClick={handleStart6Deg} style={{ background: '#8B1E1E', border: 'none', padding: '4px 10px', color: '#E3E0D5', fontFamily: "'Space Mono', monospace", fontSize: '7px', letterSpacing: '0.15em', cursor: 'pointer', flexShrink: 0 }}>TRACE →</button>
              {sixDegPath && sixDegPath.length > 0 && (
                <>
                  <button onClick={() => setSixDegPlaying(p => !p)} style={{ background: 'transparent', border: '1px solid rgba(227,224,213,0.18)', padding: '3px 8px', color: '#E3E0D5', fontFamily: "'Space Mono', monospace", fontSize: '7px', letterSpacing: '0.1em', cursor: 'pointer', flexShrink: 0 }}>
                    {sixDegPlaying ? '■ PAUSE' : '▶ PLAY'}
                  </button>
                  <button onClick={() => { setSixDegStep(0); setSixDegPlaying(false); }} style={{ background: 'transparent', border: 'none', padding: '3px 6px', color: '#E3E0D5', fontFamily: "'Space Mono', monospace", fontSize: '7px', cursor: 'pointer', opacity: 0.4, flexShrink: 0 }}>↺</button>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '7px', color: '#8B1E1E', opacity: 0.8, letterSpacing: '0.08em', flexShrink: 0 }}>
                    HOP {sixDegStep}/{sixDegPath.length - 1}
                  </span>
                </>
              )}
            </>
          )}

          {pathResult !== null && graphMode === 'PATH' && (
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '7px', color: '#E3E0D5', opacity: 0.4, letterSpacing: '0.07em' }}>
              {pathResult.length === 0 ? 'NO PATH FOUND' : `${pathResult.length - 1}° — ${pathResult.map(id => getArtistById(id)?.name || id).join(' → ')}`}
            </span>
          )}
          {sixDegPath !== null && sixDegPath.length === 0 && graphMode === '6DEG' && (
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '7px', color: '#E3E0D5', opacity: 0.4, letterSpacing: '0.07em' }}>NO PATH FOUND</span>
          )}
        </div>
      )}

      {graphMode === 'COMPARE' && (
        <div style={{ flexShrink: 0, height: '36px', background: 'rgba(17,18,17,0.88)', backdropFilter: 'blur(4px)', borderBottom: '1px solid rgba(227,224,213,0.05)', display: 'flex', alignItems: 'center', padding: '0 14px', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '8px', height: '8px', background: '#8B1E1E', borderRadius: '1px', flexShrink: 0 }} />
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '7px', color: '#E3E0D5', opacity: 0.4, letterSpacing: '0.1em', flexShrink: 0 }}>
              {centerArtist ? centerArtist.name : 'ARTIST A (search)'}
            </span>
          </div>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: '#E3E0D5', opacity: 0.25 }}>VS</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '8px', height: '8px', background: '#2E5B4D', borderRadius: '1px', flexShrink: 0 }} />
            <input value={compareInput} onChange={e => setCompareInput(e.target.value)}
              placeholder="ARTIST B…"
              list="artist-opts-compare"
              style={{ flex: '0 1 140px', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(227,224,213,0.2)', outline: 'none', color: '#E3E0D5', fontFamily: "'Space Mono', monospace", fontSize: '8px', letterSpacing: '0.07em', padding: '4px 0', caretColor: '#8B1E1E' }}
            />
          </div>
          <datalist id="artist-opts-compare">{ARTISTS.map(a => <option key={a.id} value={a.name} />)}</datalist>
          <button onClick={() => setCompareTarget(compareInput)} style={{ background: '#8B1E1E', border: 'none', padding: '4px 10px', color: '#E3E0D5', fontFamily: "'Space Mono', monospace", fontSize: '7px', letterSpacing: '0.15em', cursor: 'pointer', flexShrink: 0 }}>OVERLAY →</button>
          {compareTarget && (
            <>
              <div style={{ width: '8px', height: '8px', background: '#E3E0D5', borderRadius: '1px', flexShrink: 0, opacity: 0.7 }} />
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '7px', color: '#E3E0D5', opacity: 0.38, letterSpacing: '0.08em', flexShrink: 0 }}>SHARED</span>
            </>
          )}
        </div>
      )}

      {graphMode === 'DOC' && (
        <div style={{ flexShrink: 0, height: '36px', background: 'rgba(17,18,17,0.88)', backdropFilter: 'blur(4px)', borderBottom: '1px solid rgba(227,224,213,0.05)', display: 'flex', alignItems: 'center', padding: '0 14px', gap: '10px' }}>
          <button onClick={() => setDocPlaying(p => !p)} style={{ background: docPlaying ? 'rgba(139,30,30,0.2)' : 'transparent', border: `1px solid ${docPlaying ? 'rgba(139,30,30,0.5)' : 'rgba(227,224,213,0.18)'}`, padding: '3px 10px', color: '#E3E0D5', fontFamily: "'Space Mono', monospace", fontSize: '7px', letterSpacing: '0.12em', cursor: 'pointer', flexShrink: 0 }}>
            {docPlaying ? '■ PAUSE' : '▶ PLAY'}
          </button>
          <button onClick={() => { setDocPlaying(false); setDocStep(0); }} style={{ background: 'transparent', border: '1px solid rgba(227,224,213,0.1)', padding: '3px 8px', color: '#E3E0D5', fontFamily: "'Space Mono', monospace", fontSize: '7px', letterSpacing: '0.1em', cursor: 'pointer', opacity: 0.45, flexShrink: 0 }}>↺ RESET</button>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '7px', color: '#8B1E1E', opacity: 0.7, letterSpacing: '0.08em', flexShrink: 0 }}>
            {docStep + 1} / {sortedForDocRef.current.length || '—'}
          </span>
          {sortedForDocRef.current[docStep] && (
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '7px', color: '#E3E0D5', opacity: 0.38, letterSpacing: '0.07em' }}>
              — {getArtistById(sortedForDocRef.current[docStep])?.name} ({getArtistById(sortedForDocRef.current[docStep])?.era.split('–')[0]})
            </span>
          )}
          <div style={{ flex: 1 }} />
          <div style={{ height: '2px', width: '100px', background: 'rgba(227,224,213,0.1)', position: 'relative', flexShrink: 0 }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, background: '#8B1E1E', width: `${((docStep + 1) / Math.max(sortedForDocRef.current.length, 1)) * 100}%`, transition: 'width 0.3s' }} />
          </div>
        </div>
      )}

      {/* ── D3 canvas ─────────────────────────────────────────────────── */}
      <div ref={containerRef} style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <svg ref={svgRef} style={{ width: '100%', height: '100%', display: 'block', position: 'absolute', inset: 0 }} />

        {/* Zoom controls */}
        <div style={{ position: 'absolute', right: '14px', bottom: '52px', display: 'flex', flexDirection: 'column', gap: '2px', zIndex: 10 }}>
          {[{ l: '+', fn: handleZoomIn }, { l: '−', fn: handleZoomOut }, { l: '⊡', fn: handleZoomReset }].map(b => (
            <button key={b.l} onClick={b.fn} style={{ width: '24px', height: '24px', background: 'rgba(17,18,17,0.85)', border: '1px solid rgba(227,224,213,0.1)', color: '#E3E0D5', fontFamily: "'Space Mono', monospace", fontSize: '11px', cursor: 'pointer', opacity: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.12s', lineHeight: 1 }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.borderColor = 'rgba(139,30,30,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.borderColor = 'rgba(227,224,213,0.1)'; }}
            >{b.l}</button>
          ))}
        </div>

        {/* Legend */}
        <div style={{ position: 'absolute', bottom: '12px', left: '12px', display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 10 }}>
          {graphMode === 'COMPARE' && compareTarget ? (
            <>
              {[{ color: '#8B1E1E', label: centerArtist?.name || 'ARTIST A' }, { color: '#2E5B4D', label: compareTarget.toUpperCase() }, { color: 'rgba(227,224,213,0.55)', label: 'SHARED' }].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', background: item.color, borderRadius: '1px', flexShrink: 0 }} />
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '7px', color: '#E3E0D5', opacity: 0.4, letterSpacing: '0.1em' }}>{item.label}</span>
                </div>
              ))}
            </>
          ) : graphMode === 'HEATMAP' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '36px', height: '5px', background: 'linear-gradient(to right, #1c201d, #8B1E1E)' }} />
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '7px', color: '#E3E0D5', opacity: 0.3, letterSpacing: '0.08em' }}>CONNECTION DENSITY</span>
            </div>
          ) : graphMode === 'GENRES' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '16px', height: '9px', border: '1px solid rgba(139,30,30,0.4)', background: 'rgba(20,30,22,0.95)' }} />
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '7px', color: '#E3E0D5', opacity: 0.3, letterSpacing: '0.08em' }}>GENRE NODE</span>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '18px', height: '1px', background: '#8B1E1E' }} />
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '7px', color: '#E3E0D5', opacity: 0.28, letterSpacing: '0.08em' }}>STRONG INFLUENCE</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '18px', height: '0', borderTop: '1px dashed rgba(227,224,213,0.2)' }} />
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '7px', color: '#E3E0D5', opacity: 0.28, letterSpacing: '0.08em' }}>COLLABORATION</span>
              </div>
            </>
          )}
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '7px', color: '#E3E0D5', opacity: 0.12, letterSpacing: '0.06em', marginTop: '2px' }}>
            SCROLL TO ZOOM · DRAG TO PAN
          </span>
        </div>
      </div>
    </div>
  );
}
