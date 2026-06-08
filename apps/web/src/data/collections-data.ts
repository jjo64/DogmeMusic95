export interface Collection {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  artistIds: string[];
  era: string;
  tags: string[];
}

export const COLLECTIONS: Collection[] = [
  {
    id: 'bristol_sound',
    title: 'THE BRISTOL SOUND',
    subtitle: 'TRIP-HOP TRINITY · 1991–2008',
    description: 'Three artists who turned a post-industrial English city into a laboratory for slow-motion dread. The Bristol sound synthesized hip-hop rhythms, film noir sampling, and electronic experimentation into something new and entirely urban.',
    artistIds: ['portishead', 'massive_attack', 'radiohead'],
    era: '1991–2008',
    tags: ['TRIP-HOP', 'ELECTRONIC', 'DARKWAVE'],
  },
  {
    id: '4ad_axis',
    title: 'THE 4AD CONSTELLATION',
    subtitle: 'LABEL AS AESTHETIC SYSTEM · 1978–1997',
    description: 'Label 4AD under Ivo Watts-Russell became the home of the uncanny. From Bauhaus to the Cocteau Twins, these acts shared a fidelity to texture, atmosphere, and the romantic power of silence. The sleeve art was as important as the music.',
    artistIds: ['bauhaus', 'cocteau_twins', 'dead_can_dance', 'the_cure'],
    era: '1978–1997',
    tags: ['DARKWAVE', 'DREAM POP', 'GOTH ROCK', 'POST-PUNK'],
  },
  {
    id: 'post_punk_vanguard',
    title: 'POST-PUNK VANGUARD',
    subtitle: 'FOUNDING DOCUMENTS · 1976–1983',
    description: 'The bands that dismantled rock and gave it back as architecture. Political, minimal, relentless — and still unreplicated. Wire\'s compression, Gang of Four\'s rhythm, The Fall\'s velocity, Joy Division\'s dread. Can as the root system beneath all of it.',
    artistIds: ['wire', 'gang_of_four', 'the_fall', 'joy_division', 'can'],
    era: '1976–1983',
    tags: ['POST-PUNK', 'ART PUNK', 'KRAUTROCK'],
  },
  {
    id: 'gothic_triumvirate',
    title: 'GOTHIC TRIUMVIRATE',
    subtitle: 'THREE ARCHITECTURES OF DARKNESS · 1978–PRESENT',
    description: 'Three monuments. Three completely different approaches to darkness as aesthetic system. Bauhaus: theatrical, corporeal, visual. Sisters of Mercy: architectural, monumental, cold. Nick Cave: literary, biblical, intimate. They share a territory but not a language.',
    artistIds: ['bauhaus', 'sisters_mercy', 'nick_cave'],
    era: '1978–PRESENT',
    tags: ['GOTH ROCK', 'DARKWAVE', 'POST-PUNK'],
  },
  {
    id: 'shoegaze_cloud',
    title: 'THE SHOEGAZE CLOUD',
    subtitle: 'TEXTURE AS EMOTION · 1984–1998',
    description: 'The disappearance of the guitar into pure texture. Three acts that treated volume and sonic density as emotional states rather than musical tools. My Bloody Valentine\'s violence, Cocteau Twins\' aquatic grace, Portishead\'s paranoid cinema — different entry points into the same dissolution.',
    artistIds: ['my_bloody_valentine', 'cocteau_twins', 'portishead'],
    era: '1984–1998',
    tags: ['SHOEGAZE', 'DREAM POP', 'TRIP-HOP'],
  },
  {
    id: 'bleak_pastoral',
    title: 'BLEAK PASTORAL',
    subtitle: 'BRITISH DARK FOLK · 1983–PRESENT',
    description: 'Artists who found the gothic not in urban noir but in landscape, soil, and the weight of history. Folk music haunted by centuries rather than decades. Cave\'s Australia-as-Bible-country, Harvey\'s rural Dorset exorcisms, Tindersticks\' late-night interior, Dead Can Dance\'s invented antiquity.',
    artistIds: ['nick_cave', 'pj_harvey', 'tindersticks', 'dead_can_dance'],
    era: '1983–PRESENT',
    tags: ['ART ROCK', 'CHAMBER POP', 'DARKWAVE', 'NEOCLASSICAL'],
  },
];

export interface ProposedConnection {
  id: string;
  sourceId: string;
  sourceName: string;
  targetId: string;
  targetName: string;
  proposedBy: string;
  reason: string;
  votes: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  timestamp: string;
}

export const PROPOSED_CONNECTIONS: ProposedConnection[] = [
  {
    id: 'prop_01',
    sourceId: 'nick_cave',
    sourceName: 'NICK CAVE',
    targetId: 'chelsea_wolfe',
    targetName: 'CHELSEA WOLFE',
    proposedBy: 'ARCHIVE_ANON',
    reason: 'Cave\'s confessional darkness, biblical imagery, and stripped piano arrangements directly informed Wolfe\'s approach to doom-folk and the intersection of the sacred and violent.',
    votes: 18,
    status: 'PENDING',
    timestamp: '2025-11-14',
  },
  {
    id: 'prop_02',
    sourceId: 'gang_of_four',
    sourceName: 'GANG OF FOUR',
    targetId: 'lcd_soundsystem',
    targetName: 'LCD SOUNDSYSTEM',
    proposedBy: 'POST_PUNK_ARCHIVIST',
    reason: 'Andy Gill\'s dry, scratching funk rhythm and James Murphy\'s entire aesthetic vocabulary share an identical political-dance synthesis. Murphy has cited Gang of Four explicitly.',
    votes: 31,
    status: 'PENDING',
    timestamp: '2025-10-22',
  },
  {
    id: 'prop_03',
    sourceId: 'radiohead',
    sourceName: 'RADIOHEAD',
    targetId: 'james_blake',
    targetName: 'JAMES BLAKE',
    proposedBy: 'SONIC_CARTOGRAPHER',
    reason: 'Thom Yorke\'s falsetto, Kid A\'s electronic textures, and In Rainbows\' intimacy are the direct antecedent of Blake\'s music. Blake has stated this publicly.',
    votes: 24,
    status: 'PENDING',
    timestamp: '2025-12-01',
  },
  {
    id: 'prop_04',
    sourceId: 'siouxsie',
    sourceName: 'SIOUXSIE AND THE BANSHEES',
    targetId: 'florence_machine',
    targetName: 'FLORENCE + THE MACHINE',
    proposedBy: 'DARK_WAVE_HISTORIAN',
    reason: 'Florence Welch has cited Siouxsie as her primary vocal and visual influence. The theatrical female darkness, the howling soprano, the use of gothic imagery — all direct lineage.',
    votes: 27,
    status: 'PENDING',
    timestamp: '2025-09-17',
  },
  {
    id: 'prop_05',
    sourceId: 'bauhaus',
    sourceName: 'BAUHAUS',
    targetId: 'interpol',
    targetName: 'INTERPOL',
    proposedBy: 'COLDWAVE_INDEX',
    reason: 'Interpol\'s entire aesthetic vocabulary — the angular guitar, baritone vocals, monochrome fashion — traces directly through Joy Division via Bauhaus. Paul Banks has been explicit about this.',
    votes: 22,
    status: 'APPROVED',
    timestamp: '2025-08-03',
  },
  {
    id: 'prop_06',
    sourceId: 'massive_attack',
    sourceName: 'MASSIVE ATTACK',
    targetId: 'burial',
    targetName: 'BURIAL',
    proposedBy: 'URBAN_TEXTURE_LAB',
    reason: 'Burial\'s fractured London bass music owes its atmospheric DNA entirely to Mezzanine-era Massive Attack — the rain, the empty streets, the half-heard voices buried in static.',
    votes: 41,
    status: 'PENDING',
    timestamp: '2025-11-29',
  },
];
