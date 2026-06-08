import { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { useQuery } from '@apollo/client';
import { ARTISTS, CONNECTIONS, getFoundingYear, getArtistById } from '../data/artists-data';
import { GET_TIMELINE_ARTISTS } from '../graphql/queries';

interface Props {
  onSelectArtist: (id: string) => void;
  selectedArtistId: string | null;
}

interface ArtistPoint {
  id: string;
  name: string;
  year: number;
  influence_score: number;
  x: number;
  y: number;
}

export function TimelineView({ onSelectArtist, selectedArtistId }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onSelectArtist);
  onSelectRef.current = onSelectArtist;

  const { data, loading } = useQuery(GET_TIMELINE_ARTISTS);
  const dbArtists = data?.timelineArtists;

  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const svgSelRef = useRef<d3.Selection<SVGSVGElement, unknown, null, undefined> | null>(null);

  const buildTimeline = useCallback(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const axisY = height * 0.62;

    const artistsSource = dbArtists && dbArtists.length > 0 ? dbArtists : ARTISTS;

    const artistsWithYear = artistsSource
      .map(a => ({
        id: a.id,
        name: a.name,
        era: a.era || '',
        year: getFoundingYear(a.era || ''),
        influence_score: 'influenceScore' in a ? (a.influenceScore as number) : (a as any).influence_score
      }))
      .filter(a => a.year > 0)
      .sort((a, b) => a.year - b.year);

    const minYear = 1963;
    const maxYear = 1997;
    const xScale = d3.scaleLinear().domain([minYear, maxYear]).range([60, width - 60]);

    // Group by year and assign staggered x positions
    const byYear = new Map<number, typeof artistsWithYear>();
    artistsWithYear.forEach(a => {
      if (!byYear.has(a.year)) byYear.set(a.year, []);
      byYear.get(a.year)!.push(a);
    });

    const positions: Record<string, ArtistPoint> = {};
    byYear.forEach((group, year) => {
      const count = group.length;
      const spread = (count - 1) * 18;
      group.forEach((a, i) => {
        const xOffset = -spread / 2 + i * 18;
        positions[a.id] = { id: a.id, name: a.name, year, influence_score: a.influence_score, x: xScale(year) + xOffset, y: axisY };
      });
    });

    const svg = d3.select(svgRef.current) as d3.Selection<SVGSVGElement, unknown, null, undefined>;
    svgSelRef.current = svg;
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    svg.append('rect').attr('width', width).attr('height', height).attr('fill', '#111211');

    // Zoom
    const zoomable = svg.append('g').attr('class', 'zoomable');
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.4, 5])
      .on('zoom', event => zoomable.attr('transform', event.transform));
    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    // Subtle grid
    const gridG = zoomable.append('g').attr('pointer-events', 'none');
    for (let y2 = 0; y2 < height; y2 += 60) {
      gridG.append('line')
        .attr('x1', 0).attr('y1', y2).attr('x2', width).attr('y2', y2)
        .attr('stroke', '#E3E0D5').attr('stroke-opacity', 0.02).attr('stroke-width', 0.5);
    }

    // ── Axis ─────────────────────────────────────────────────────────
    const axisG = zoomable.append('g');

    // Main axis line
    axisG.append('line')
      .attr('x1', xScale(minYear - 1)).attr('x2', xScale(maxYear + 1))
      .attr('y1', axisY).attr('y2', axisY)
      .attr('stroke', 'rgba(227,224,213,0.18)').attr('stroke-width', 1);

    // Decade markers + labels
    for (let decade = 1965; decade <= 1995; decade += 5) {
      const x = xScale(decade);
      const isMajor = decade % 10 === 0;
      axisG.append('line')
        .attr('x1', x).attr('x2', x)
        .attr('y1', axisY - (isMajor ? 8 : 4)).attr('y2', axisY + (isMajor ? 8 : 4))
        .attr('stroke', 'rgba(227,224,213,0.25)').attr('stroke-width', isMajor ? 1 : 0.5);
      if (isMajor) {
        axisG.append('text')
          .text(decade.toString())
          .attr('x', x).attr('y', axisY + 22)
          .attr('text-anchor', 'middle')
          .attr('fill', '#E3E0D5').attr('fill-opacity', 0.18)
          .attr('font-family', "'Space Mono', monospace")
          .attr('font-size', '9px').attr('letter-spacing', '0.1em');
      }
    }

    // ── Arcs ─────────────────────────────────────────────────────────
    const arcG = zoomable.append('g').attr('pointer-events', 'none');

    CONNECTIONS.forEach(conn => {
      const p1 = positions[conn.source as string];
      const p2 = positions[conn.target as string];
      if (!p1 || !p2) return;

      const x1 = p1.x;
      const x2 = p2.x;
      const midX = (x1 + x2) / 2;
      const span = Math.abs(x2 - x1);
      const arcH = span * 0.45 + 15;

      const isStrong = conn.strength > 0.82;
      const isCollab = conn.type === 'COLLABORATION';

      arcG.append('path')
        .attr('d', `M ${x1} ${axisY} Q ${midX} ${axisY - arcH} ${x2} ${axisY}`)
        .attr('fill', 'none')
        .attr('stroke', isStrong ? '#8B1E1E' : 'rgba(227,224,213,0.15)')
        .attr('stroke-width', 0.4 + conn.strength * 1.4)
        .attr('stroke-dasharray', isCollab ? '4,3' : 'none')
        .attr('stroke-opacity', 0.25 + conn.strength * 0.45);
    });

    // ── Nodes ─────────────────────────────────────────────────────────
    const nodeG = zoomable.append('g');

    Object.values(positions).forEach(pt => {
      const artist = getArtistById(pt.id);
      if (!artist) return;
      const isSelected = selectedArtistId === pt.id;
      const r = 4 + (pt.influence_score / 100) * 5;

      const g = nodeG.append('g')
        .attr('data-id', pt.id)
        .style('cursor', 'pointer')
        .on('click', () => onSelectRef.current(pt.id));

      if (isSelected) {
        g.append('circle')
          .attr('cx', pt.x).attr('cy', pt.y).attr('r', r + 7)
          .attr('fill', 'rgba(139,30,30,0.12)')
          .attr('stroke', '#8B1E1E').attr('stroke-width', 1).attr('stroke-opacity', 0.6);
      }

      g.append('circle')
        .attr('class', 'node-circle')
        .attr('cx', pt.x).attr('cy', pt.y).attr('r', r)
        .attr('fill', isSelected ? '#8B1E1E' : '#1a201b')
        .attr('stroke', isSelected ? '#8B1E1E' : 'rgba(227,224,213,0.38)')
        .attr('stroke-width', 1);

      // Determine label direction: alternate above/below based on index in same-year group
      const yearGroup = byYear.get(pt.year) || [];
      const indexInGroup = yearGroup.findIndex(a => a.id === pt.id);
      const labelBelow = indexInGroup % 2 === 1;
      const labelDy = labelBelow ? r + 14 : -(r + 8);

      // Name label
      g.append('text')
        .text(pt.name)
        .attr('x', pt.x).attr('y', pt.y + labelDy)
        .attr('text-anchor', 'middle')
        .attr('fill', '#E3E0D5').attr('fill-opacity', isSelected ? 1 : 0.5)
        .attr('font-family', "'Space Mono', monospace")
        .attr('font-size', isSelected ? '8px' : '7px')
        .attr('letter-spacing', '0.05em')
        .attr('pointer-events', 'none');

      g.on('mouseenter', function () {
        d3.select(this).select('.node-circle')
          .attr('fill', '#8B1E1E')
          .attr('stroke', '#E3E0D5');
        d3.select(this).selectAll('text')
          .attr('fill-opacity', 1)
          .attr('font-size', '8px');
      }).on('mouseleave', function () {
        d3.select(this).select('.node-circle')
          .attr('fill', isSelected ? '#8B1E1E' : '#1a201b')
          .attr('stroke', isSelected ? '#8B1E1E' : 'rgba(227,224,213,0.38)');
        d3.select(this).selectAll('text')
          .attr('fill-opacity', isSelected ? 1 : 0.5)
          .attr('font-size', isSelected ? '8px' : '7px');
      });
    });

    // ── LABEL: Era sections ────────────────────────────────────────────
    const eraLabelG = zoomable.append('g').attr('pointer-events', 'none');
    const erasLabels = [
      { label: '60S', x: xScale(1966) },
      { label: '70S', x: xScale(1975) },
      { label: '80S', x: xScale(1984) },
      { label: '90S', x: xScale(1992) },
    ];
    erasLabels.forEach(({ label, x }) => {
      eraLabelG.append('text')
        .text(label)
        .attr('x', x).attr('y', height - 20)
        .attr('fill', '#E3E0D5').attr('fill-opacity', 0.06)
        .attr('font-family', "'Anton', sans-serif")
        .attr('font-size', '32px').attr('letter-spacing', '0.15em');
    });

  }, [selectedArtistId, dbArtists]);

  useEffect(() => { buildTimeline(); }, [buildTimeline]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => buildTimeline());
    observer.observe(container);
    return () => observer.disconnect();
  }, [buildTimeline]);

  function handleZoomIn() {
    if (svgSelRef.current && zoomBehaviorRef.current)
      svgSelRef.current.transition().duration(220).call(zoomBehaviorRef.current.scaleBy, 1.5);
  }
  function handleZoomOut() {
    if (svgSelRef.current && zoomBehaviorRef.current)
      svgSelRef.current.transition().duration(220).call(zoomBehaviorRef.current.scaleBy, 1 / 1.5);
  }
  function handleZoomReset() {
    if (svgSelRef.current && zoomBehaviorRef.current)
      svgSelRef.current.transition().duration(300).call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
  }

  const artistsSource = dbArtists && dbArtists.length > 0 ? dbArtists : ARTISTS;

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', position: 'relative', background: '#111211', overflow: 'hidden' }}
    >
      {/* Toolbar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, height: '40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px',
        background: 'rgba(17,18,17,0.9)', backdropFilter: 'blur(4px)',
        borderBottom: '1px solid rgba(227,224,213,0.07)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '7px', color: '#8B1E1E', letterSpacing: '0.2em', opacity: 0.9 }}>
            INFLUENCE CHRONOLOGY
          </span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '7px', color: '#E3E0D5', opacity: 0.2, letterSpacing: '0.1em' }}>
            — {artistsSource.length} ARTISTS · 1965–1994
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '7px', color: '#E3E0D5', opacity: 0.2, letterSpacing: '0.08em', marginRight: '6px' }}>
            SCROLL TO ZOOM · DRAG TO PAN
          </span>
          {[{ label: '+', fn: handleZoomIn }, { label: '−', fn: handleZoomOut }, { label: '⊡', fn: handleZoomReset }].map(b => (
            <button key={b.label} onClick={b.fn} style={{
              width: '22px', height: '22px', background: 'transparent',
              border: '1px solid rgba(227,224,213,0.12)', color: '#E3E0D5',
              fontFamily: "'Space Mono', monospace", fontSize: '11px',
              cursor: 'pointer', opacity: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.12s',
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
            >{b.label}</button>
          ))}
        </div>
      </div>

      <svg ref={svgRef} style={{ width: '100%', height: '100%', display: 'block' }} />

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: '14px', left: '16px',
        display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <div style={{ width: '20px', height: '1px', background: '#8B1E1E' }} />
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '7px', color: '#E3E0D5', opacity: 0.3, letterSpacing: '0.1em' }}>STRONG INFLUENCE</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <div style={{ width: '20px', height: '0', borderTop: '1px dashed rgba(227,224,213,0.2)' }} />
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '7px', color: '#E3E0D5', opacity: 0.3, letterSpacing: '0.1em' }}>COLLABORATION</span>
        </div>
      </div>
    </div>
  );
}
