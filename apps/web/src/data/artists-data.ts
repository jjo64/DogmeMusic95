export interface Artist {
  id: string;
  name: string;
  era: string;
  origin: string;
  genres: string[];
  description: string;
  influence_score: number;
}

export interface Connection {
  source: string;
  target: string;
  strength: number;
  type: 'INFLUENCE' | 'COLLABORATION' | 'SHARED_MEMBERS';
}

export const ARTISTS: Artist[] = [
  {
    id: 'bauhaus',
    name: 'BAUHAUS',
    era: '1978–1983',
    origin: 'NORTHAMPTON, UK',
    genres: ['POST-PUNK', 'GOTH ROCK', 'ART ROCK'],
    description: 'Architects of gothic rock. Their debut "Bela Lugosi\'s Dead" — nine minutes of distilled dread — crystallized the entire darkwave movement into a single transmission from the void. Peter Murphy\'s theatrics and Daniel Ash\'s knife-edge guitar remain unreplicated.',
    influence_score: 96,
  },
  {
    id: 'joy_division',
    name: 'JOY DIVISION',
    era: '1976–1980',
    origin: 'SALFORD, UK',
    genres: ['POST-PUNK', 'DARKWAVE', 'INDUSTRIAL'],
    description: 'Ian Curtis distilled urban dread and neurological fragility into pure sound. "Unknown Pleasures" is the blueprint every band that followed in the dark has studied. Bernard Sumner\'s fractured guitar and Peter Hook\'s melodic bass created a grammar that still hasn\'t been exhausted.',
    influence_score: 99,
  },
  {
    id: 'the_cure',
    name: 'THE CURE',
    era: '1976–PRESENT',
    origin: 'CRAWLEY, UK',
    genres: ['POST-PUNK', 'GOTH ROCK', 'NEW WAVE'],
    description: 'Robert Smith built cathedrals of delay and reverb over three decades of contradictions — pop sensibility buried under existential weight. From "Three Imaginary Boys" to "Disintegration", a complete emotional atlas of the dark side of desire.',
    influence_score: 97,
  },
  {
    id: 'siouxsie',
    name: 'SIOUXSIE AND THE BANSHEES',
    era: '1976–1996',
    origin: 'LONDON, UK',
    genres: ['POST-PUNK', 'GOTH ROCK', 'ALTERNATIVE'],
    description: 'Siouxsie Sioux weaponized texture and image into a decade-spanning aesthetic empire. The Banshees pioneered a feminine darkness that was confrontational, not decorative. Their influence traces directly through every dark art act that followed.',
    influence_score: 94,
  },
  {
    id: 'nick_cave',
    name: 'NICK CAVE & THE BAD SEEDS',
    era: '1983–PRESENT',
    origin: 'MELBOURNE, AU',
    genres: ['POST-PUNK', 'GOTHIC ROCK', 'BLUES ROCK'],
    description: 'Australia\'s preacher-poet has catalogued the full spectrum of human cruelty and grace across four decades. "Murder Ballads" is an act of operatic violence; "Skeleton Tree" is the aftermath. Between them: everything.',
    influence_score: 95,
  },
  {
    id: 'pj_harvey',
    name: 'PJ HARVEY',
    era: '1991–PRESENT',
    origin: 'BRIDPORT, UK',
    genres: ['ART ROCK', 'ALTERNATIVE', 'BLUES ROCK'],
    description: 'Polly Jean Harvey reinvents herself completely on every record. From the raw power of "Dry" to the orchestral grandeur of "Let England Shake" — each album is an act of total artistic self-immolation followed by immediate reinvention.',
    influence_score: 93,
  },
  {
    id: 'portishead',
    name: 'PORTISHEAD',
    era: '1991–PRESENT',
    origin: 'BRISTOL, UK',
    genres: ['TRIP-HOP', 'DARKWAVE', 'ELECTRONIC'],
    description: 'Beth Gibbons\' voice — damaged, aching, spectral — over Geoff Barrow\'s paranoid cinematic collages. "Dummy" invented trip-hop as emotional wreckage; "Third" dismantled it entirely and rebuilt it as something colder and more industrial.',
    influence_score: 92,
  },
  {
    id: 'massive_attack',
    name: 'MASSIVE ATTACK',
    era: '1988–PRESENT',
    origin: 'BRISTOL, UK',
    genres: ['TRIP-HOP', 'ELECTRONIC', 'DARKWAVE'],
    description: 'The Bristol collective invented a subterranean grammar of bass frequencies, film noir samples, and slow-motion dread. "Mezzanine" is the sound of the city eating itself alive — paranoid, claustrophobic, and entirely seductive.',
    influence_score: 94,
  },
  {
    id: 'radiohead',
    name: 'RADIOHEAD',
    era: '1985–PRESENT',
    origin: 'ABINGDON, UK',
    genres: ['ART ROCK', 'ALTERNATIVE', 'ELECTRONIC'],
    description: 'Thom Yorke\'s paranoid dispatches from the post-industrial collapse. "OK Computer" is the defining document of late 20th-century anxiety; "Kid A" is what happens when that anxiety completes its metamorphosis into pure abstraction.',
    influence_score: 98,
  },
  {
    id: 'scott_walker',
    name: 'SCOTT WALKER',
    era: '1965–2019',
    origin: 'HAMILTON, US',
    genres: ['ORCHESTRAL POP', 'ART ROCK', 'AVANT-GARDE'],
    description: 'From teen idol to avant-garde extremist: the most radical transformation in pop history. Walker\'s late works — "Tilt", "The Drift", "Bisch Bosch" — are dispatches from beyond language, scored for orchestra and absolute silence.',
    influence_score: 91,
  },
  {
    id: 'wire',
    name: 'WIRE',
    era: '1976–PRESENT',
    origin: 'LONDON, UK',
    genres: ['POST-PUNK', 'ART PUNK', 'MINIMALIST'],
    description: 'The most cerebral band of the post-punk vanguard. Wire stripped rock to its conceptual skeleton — "Pink Flag" compresses 21 songs into 35 minutes — then rebuilt it as pure information and architecture. Still unmatched for structural elegance.',
    influence_score: 88,
  },
  {
    id: 'gang_of_four',
    name: 'GANG OF FOUR',
    era: '1976–1997',
    origin: 'LEEDS, UK',
    genres: ['POST-PUNK', 'ART PUNK', 'FUNK PUNK'],
    description: 'Political economy set to angular dance rhythms. "Entertainment!" dismantled every myth rock ever told itself while remaining viscerally physical. Andy Gill\'s stop-start guitar technique remains the most influential dry riff in post-punk history.',
    influence_score: 90,
  },
  {
    id: 'my_bloody_valentine',
    name: 'MY BLOODY VALENTINE',
    era: '1983–PRESENT',
    origin: 'DUBLIN, IE',
    genres: ['SHOEGAZE', 'DREAM POP', 'NOISE ROCK'],
    description: 'Kevin Shields built a wall of guitar texture so dense it collapsed the distinction between noise and melody. "Loveless" remains a singular object — simultaneously beautiful and violent, intimate and overwhelming.',
    influence_score: 96,
  },
  {
    id: 'cocteau_twins',
    name: 'COCTEAU TWINS',
    era: '1979–1997',
    origin: 'GRANGEMOUTH, UK',
    genres: ['DREAM POP', 'SHOEGAZE', 'POST-PUNK'],
    description: 'Elizabeth Fraser\'s voice as pure texture — a private glossolalia that communicated emotion without language. The Cocteau Twins created a sealed aesthetic world: aquatic, luminous, mourning something that was never named.',
    influence_score: 89,
  },
  {
    id: 'dead_can_dance',
    name: 'DEAD CAN DANCE',
    era: '1981–PRESENT',
    origin: 'MELBOURNE, AU',
    genres: ['NEOCLASSICAL', 'DARKWAVE', 'WORLD'],
    description: 'Lisa Gerrard and Brendan Perry traversed every ancient musical tradition — Byzantine chant, mediaeval folk, Middle Eastern modal scales — to arrive somewhere entirely their own. Sacred music with no specific god. Ritual without a named rite.',
    influence_score: 87,
  },
  {
    id: 'sisters_mercy',
    name: 'THE SISTERS OF MERCY',
    era: '1980–PRESENT',
    origin: 'LEEDS, UK',
    genres: ['GOTH ROCK', 'POST-PUNK', 'DARKWAVE'],
    description: 'Andrew Eldritch\'s gothic grandeur at maximum density. The drum machine — "Doktor Avalanche" — as monument, the bass as architecture. "Floodland" is the ur-text of goth maximalism, simultaneously overwrought and devastating.',
    influence_score: 88,
  },
  {
    id: 'tindersticks',
    name: 'TINDERSTICKS',
    era: '1991–PRESENT',
    origin: 'NOTTINGHAM, UK',
    genres: ['CHAMBER POP', 'ART ROCK', 'DARKWAVE'],
    description: 'Stuart Staples\' baritone over orchestral arrangements of crushing intimacy. Tindersticks make music that sounds like the interior of a film no one else can see: late-night bars, slow dissolves, the specific gravity of accumulated regret.',
    influence_score: 85,
  },
  {
    id: 'swans',
    name: 'SWANS',
    era: '1982–PRESENT',
    origin: 'NEW YORK, US',
    genres: ['NOISE ROCK', 'POST-PUNK', 'EXPERIMENTAL'],
    description: 'Michael Gira\'s confrontation with transcendence and brutality across four decades of reinvention. "The Seer" and "To Be Kind" are long-form rituals rather than albums — endurance tests that deliver something close to grace, if you last long enough.',
    influence_score: 92,
  },
  {
    id: 'the_fall',
    name: 'THE FALL',
    era: '1976–2018',
    origin: 'MANCHESTER, UK',
    genres: ['POST-PUNK', 'EXPERIMENTAL ROCK', 'KRAUTROCK'],
    description: 'Mark E. Smith\'s relentless, decade-spanning machine. The Fall released 32 studio albums, never compromised, and never repeated themselves. Smith\'s rhythmic, ranting delivery created a entirely new relationship between voice and context.',
    influence_score: 91,
  },
  {
    id: 'can',
    name: 'CAN',
    era: '1968–1979',
    origin: 'COLOGNE, DE',
    genres: ['KRAUTROCK', 'EXPERIMENTAL', 'AVANT-GARDE'],
    description: 'Holger Czukay, Michael Karoli, Jaki Liebezeit and company invented a new grammar of collective improvisation. Damo Suzuki\'s stream-of-consciousness vocals over motorik rhythms created the template for everything post-punk ever attempted.',
    influence_score: 93,
  },
];

export const CONNECTIONS: Connection[] = [
  // Joy Division is the root of most things
  { source: 'joy_division', target: 'bauhaus', strength: 0.85, type: 'INFLUENCE' },
  { source: 'joy_division', target: 'the_cure', strength: 0.9, type: 'INFLUENCE' },
  { source: 'joy_division', target: 'siouxsie', strength: 0.8, type: 'INFLUENCE' },
  { source: 'joy_division', target: 'sisters_mercy', strength: 0.95, type: 'INFLUENCE' },
  { source: 'joy_division', target: 'radiohead', strength: 0.78, type: 'INFLUENCE' },
  { source: 'joy_division', target: 'swans', strength: 0.7, type: 'INFLUENCE' },
  { source: 'joy_division', target: 'the_fall', strength: 0.75, type: 'INFLUENCE' },

  // CAN influences everyone
  { source: 'can', target: 'joy_division', strength: 0.8, type: 'INFLUENCE' },
  { source: 'can', target: 'wire', strength: 0.85, type: 'INFLUENCE' },
  { source: 'can', target: 'the_fall', strength: 0.9, type: 'INFLUENCE' },
  { source: 'can', target: 'bauhaus', strength: 0.65, type: 'INFLUENCE' },
  { source: 'can', target: 'radiohead', strength: 0.7, type: 'INFLUENCE' },

  // Bauhaus connections
  { source: 'bauhaus', target: 'nick_cave', strength: 0.8, type: 'INFLUENCE' },
  { source: 'bauhaus', target: 'sisters_mercy', strength: 0.85, type: 'INFLUENCE' },
  { source: 'bauhaus', target: 'dead_can_dance', strength: 0.7, type: 'INFLUENCE' },
  { source: 'bauhaus', target: 'the_cure', strength: 0.75, type: 'INFLUENCE' },
  { source: 'bauhaus', target: 'swans', strength: 0.65, type: 'INFLUENCE' },

  // Siouxsie cluster
  { source: 'siouxsie', target: 'bauhaus', strength: 0.8, type: 'COLLABORATION' },
  { source: 'siouxsie', target: 'cocteau_twins', strength: 0.75, type: 'INFLUENCE' },
  { source: 'siouxsie', target: 'pj_harvey', strength: 0.7, type: 'INFLUENCE' },
  { source: 'siouxsie', target: 'wire', strength: 0.65, type: 'INFLUENCE' },
  { source: 'siouxsie', target: 'my_bloody_valentine', strength: 0.6, type: 'INFLUENCE' },

  // The Cure
  { source: 'the_cure', target: 'cocteau_twins', strength: 0.7, type: 'INFLUENCE' },
  { source: 'the_cure', target: 'my_bloody_valentine', strength: 0.65, type: 'INFLUENCE' },
  { source: 'the_cure', target: 'portishead', strength: 0.6, type: 'INFLUENCE' },
  { source: 'the_cure', target: 'radiohead', strength: 0.7, type: 'INFLUENCE' },
  { source: 'the_cure', target: 'tindersticks', strength: 0.65, type: 'INFLUENCE' },

  // Nick Cave
  { source: 'nick_cave', target: 'pj_harvey', strength: 0.9, type: 'COLLABORATION' },
  { source: 'nick_cave', target: 'scott_walker', strength: 0.85, type: 'INFLUENCE' },
  { source: 'nick_cave', target: 'tindersticks', strength: 0.8, type: 'INFLUENCE' },
  { source: 'nick_cave', target: 'dead_can_dance', strength: 0.7, type: 'INFLUENCE' },
  { source: 'nick_cave', target: 'swans', strength: 0.75, type: 'INFLUENCE' },
  { source: 'nick_cave', target: 'the_fall', strength: 0.7, type: 'INFLUENCE' },

  // Bristol cluster
  { source: 'portishead', target: 'massive_attack', strength: 0.9, type: 'INFLUENCE' },
  { source: 'massive_attack', target: 'radiohead', strength: 0.75, type: 'INFLUENCE' },
  { source: 'portishead', target: 'radiohead', strength: 0.7, type: 'INFLUENCE' },
  { source: 'massive_attack', target: 'cocteau_twins', strength: 0.65, type: 'INFLUENCE' },
  { source: 'massive_attack', target: 'can', strength: 0.6, type: 'INFLUENCE' },

  // Radiohead
  { source: 'radiohead', target: 'scott_walker', strength: 0.82, type: 'INFLUENCE' },
  { source: 'radiohead', target: 'pj_harvey', strength: 0.75, type: 'INFLUENCE' },
  { source: 'radiohead', target: 'can', strength: 0.7, type: 'INFLUENCE' },
  { source: 'radiohead', target: 'wire', strength: 0.65, type: 'INFLUENCE' },

  // Post-punk roots
  { source: 'wire', target: 'bauhaus', strength: 0.7, type: 'INFLUENCE' },
  { source: 'wire', target: 'my_bloody_valentine', strength: 0.65, type: 'INFLUENCE' },
  { source: 'gang_of_four', target: 'radiohead', strength: 0.8, type: 'INFLUENCE' },
  { source: 'gang_of_four', target: 'wire', strength: 0.85, type: 'INFLUENCE' },
  { source: 'gang_of_four', target: 'swans', strength: 0.7, type: 'INFLUENCE' },
  { source: 'gang_of_four', target: 'the_fall', strength: 0.75, type: 'INFLUENCE' },

  // Shoegaze cluster
  { source: 'my_bloody_valentine', target: 'cocteau_twins', strength: 0.78, type: 'INFLUENCE' },
  { source: 'my_bloody_valentine', target: 'massive_attack', strength: 0.7, type: 'INFLUENCE' },
  { source: 'my_bloody_valentine', target: 'portishead', strength: 0.65, type: 'INFLUENCE' },

  // Dark ambient / neoclassical
  { source: 'dead_can_dance', target: 'cocteau_twins', strength: 0.8, type: 'INFLUENCE' },
  { source: 'dead_can_dance', target: 'tindersticks', strength: 0.75, type: 'INFLUENCE' },
  { source: 'dead_can_dance', target: 'scott_walker', strength: 0.7, type: 'INFLUENCE' },

  // Swans connections
  { source: 'swans', target: 'scott_walker', strength: 0.8, type: 'INFLUENCE' },
  { source: 'swans', target: 'my_bloody_valentine', strength: 0.65, type: 'INFLUENCE' },
  { source: 'swans', target: 'pj_harvey', strength: 0.7, type: 'INFLUENCE' },

  // Scott Walker
  { source: 'scott_walker', target: 'tindersticks', strength: 0.85, type: 'INFLUENCE' },
  { source: 'scott_walker', target: 'portishead', strength: 0.75, type: 'INFLUENCE' },

  // Sisters
  { source: 'sisters_mercy', target: 'dead_can_dance', strength: 0.65, type: 'INFLUENCE' },
  { source: 'sisters_mercy', target: 'tindersticks', strength: 0.6, type: 'INFLUENCE' },

  // PJ Harvey
  { source: 'pj_harvey', target: 'cocteau_twins', strength: 0.6, type: 'INFLUENCE' },
  { source: 'pj_harvey', target: 'portishead', strength: 0.65, type: 'INFLUENCE' },

  // The Fall
  { source: 'the_fall', target: 'wire', strength: 0.8, type: 'INFLUENCE' },
  { source: 'the_fall', target: 'swans', strength: 0.65, type: 'INFLUENCE' },
];

export function getArtistById(id: string): Artist | undefined {
  return ARTISTS.find(a => a.id === id);
}

export function getConnectionsForArtist(id: string): Array<{ artist: Artist; strength: number; type: Connection['type'] }> {
  return CONNECTIONS
    .filter(c => c.source === id || c.target === id)
    .map(c => {
      const otherId = c.source === id ? c.target : c.source;
      const artist = getArtistById(otherId);
      if (!artist) return null;
      return { artist, strength: c.strength, type: c.type };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => b.strength - a.strength);
}

export function findCenterArtist(query: string): Artist | undefined {
  if (!query.trim()) return undefined;
  const q = query.toLowerCase().trim();
  return ARTISTS.find(a =>
    a.name.toLowerCase().includes(q) ||
    a.id.includes(q.replace(/\s+/g, '_'))
  );
}

export function getFoundingYear(era: string): number {
  const match = era.match(/^(\d{4})/);
  return match ? parseInt(match[1]) : 0;
}

/** BFS shortest path between two artist IDs. Returns array of IDs including endpoints, or null. */
export function findShortestPath(sourceId: string, targetId: string): string[] | null {
  if (sourceId === targetId) return [sourceId];
  const adj = new Map<string, string[]>();
  for (const a of ARTISTS) adj.set(a.id, []);
  for (const c of CONNECTIONS) {
    adj.get(c.source as string)?.push(c.target as string);
    adj.get(c.target as string)?.push(c.source as string);
  }
  const queue: string[][] = [[sourceId]];
  const visited = new Set([sourceId]);
  while (queue.length > 0) {
    const path = queue.shift()!;
    const curr = path[path.length - 1];
    for (const neighbor of (adj.get(curr) || [])) {
      if (visited.has(neighbor)) continue;
      const newPath = [...path, neighbor];
      if (neighbor === targetId) return newPath;
      visited.add(neighbor);
      queue.push(newPath);
    }
  }
  return null;
}

/** Returns a Map from artistId to depth (0 = center, 1 = 1st degree, etc.) */
export function getArtistsWithDepth(centerId: string, maxDegree: number): Map<string, number> {
  const depthMap = new Map([[centerId, 0]]);
  let frontier = new Set([centerId]);
  for (let d = 1; d <= maxDegree; d++) {
    const next = new Set<string>();
    for (const id of frontier) {
      for (const c of CONNECTIONS) {
        const other = c.source === id ? c.target as string : c.target === id ? c.source as string : null;
        if (other && !depthMap.has(other)) {
          depthMap.set(other, d);
          next.add(other);
        }
      }
    }
    frontier = next;
    if (frontier.size === 0) break;
  }
  return depthMap;
}
