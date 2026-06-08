import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ARTISTS = [
  {
    id: 'bauhaus',
    name: 'BAUHAUS',
    era: '1978–1983',
    origin: 'NORTHAMPTON, UK',
    genres: ['POST-PUNK', 'GOTH ROCK', 'ART ROCK'],
    description: 'Architects of gothic rock. Their debut "Bela Lugosi\'s Dead" — nine minutes of distilled dread — crystallized the entire darkwave movement into a single transmission from the void.',
    influenceScore: 96,
    energy: 72, acousticness: 22, darkness: 94, experimental: 74, danceability: 28
  },
  {
    id: 'joy_division',
    name: 'JOY DIVISION',
    era: '1976–1980',
    origin: 'SALFORD, UK',
    genres: ['POST-PUNK', 'DARKWAVE', 'INDUSTRIAL'],
    description: 'Ian Curtis distilled urban dread and neurological fragility into pure sound. "Unknown Pleasures" is the blueprint every band that followed in the dark has studied.',
    influenceScore: 99,
    energy: 58, acousticness: 20, darkness: 97, experimental: 80, danceability: 22
  },
  {
    id: 'the_cure',
    name: 'THE CURE',
    era: '1976–PRESENT',
    origin: 'CRAWLEY, UK',
    genres: ['POST-PUNK', 'GOTH ROCK', 'NEW WAVE'],
    description: 'Robert Smith built cathedrals of delay and reverb over three decades of contradictions — pop sensibility buried under existential weight.',
    influenceScore: 97,
    energy: 55, acousticness: 34, darkness: 82, experimental: 64, danceability: 38
  },
  {
    id: 'siouxsie',
    name: 'SIOUXSIE AND THE BANSHEES',
    era: '1976–1996',
    origin: 'LONDON, UK',
    genres: ['POST-PUNK', 'GOTH ROCK', 'ALTERNATIVE'],
    description: 'Siouxsie Sioux weaponized texture and image into a decade-spanning aesthetic empire. The Banshees pioneered a feminine darkness that was confrontational, not decorative.',
    influenceScore: 94,
    energy: 68, acousticness: 18, darkness: 86, experimental: 72, danceability: 34
  },
  {
    id: 'nick_cave',
    name: 'NICK CAVE & THE BAD SEEDS',
    era: '1983–PRESENT',
    origin: 'MELBOURNE, AU',
    genres: ['POST-PUNK', 'GOTHIC ROCK', 'BLUES ROCK'],
    description: 'Australia\'s preacher-poet has catalogued the full spectrum of human cruelty and grace across four decades. "Murder Ballads" is an act of operatic violence.',
    influenceScore: 95,
    energy: 42, acousticness: 62, darkness: 92, experimental: 78, danceability: 18
  },
  {
    id: 'pj_harvey',
    name: 'PJ HARVEY',
    era: '1991–PRESENT',
    origin: 'BRIDPORT, UK',
    genres: ['ART ROCK', 'ALTERNATIVE', 'BLUES ROCK'],
    description: 'Polly Jean Harvey reinvents herself completely on every record. From the raw power of "Dry" to the orchestral grandeur of "Let England Shake".',
    influenceScore: 93,
    energy: 70, acousticness: 44, darkness: 80, experimental: 82, danceability: 26
  },
  {
    id: 'portishead',
    name: 'PORTISHEAD',
    era: '1991–PRESENT',
    origin: 'BRISTOL, UK',
    genres: ['TRIP-HOP', 'DARKWAVE', 'ELECTRONIC'],
    description: 'Beth Gibbons\' voice — damaged, aching, spectral — over Geoff Barrow\'s paranoid cinematic collages. "Dummy" invented trip-hop as emotional wreckage.',
    influenceScore: 92,
    energy: 34, acousticness: 36, darkness: 96, experimental: 68, danceability: 20
  },
  {
    id: 'massive_attack',
    name: 'MASSIVE ATTACK',
    era: '1988–PRESENT',
    origin: 'BRISTOL, UK',
    genres: ['TRIP-HOP', 'ELECTRONIC', 'DARKWAVE'],
    description: 'The Bristol collective invented a subterranean grammar of bass frequencies, film noir samples, and slow-motion dread. "Mezzanine" is the sound of the city eating itself alive.',
    influenceScore: 94,
    energy: 48, acousticness: 22, darkness: 88, experimental: 62, danceability: 44
  },
  {
    id: 'radiohead',
    name: 'RADIOHEAD',
    era: '1985–PRESENT',
    origin: 'ABINGDON, UK',
    genres: ['ART ROCK', 'ALTERNATIVE', 'ELECTRONIC'],
    description: 'Thom Yorke\'s paranoid dispatches from the post-industrial collapse. "OK Computer" is the defining document of late 20th-century anxiety.',
    influenceScore: 98,
    energy: 52, acousticness: 38, darkness: 84, experimental: 90, danceability: 32
  },
  {
    id: 'scott_walker',
    name: 'SCOTT WALKER',
    era: '1965–2019',
    origin: 'HAMILTON, US',
    genres: ['ORCHESTRAL POP', 'ART ROCK', 'AVANT-GARDE'],
    description: 'From teen idol to avant-garde extremist: the most radical transformation in pop history. Walker\'s late works are dispatches from beyond language.',
    influenceScore: 91,
    energy: 30, acousticness: 58, darkness: 90, experimental: 96, danceability: 10
  },
  {
    id: 'wire',
    name: 'WIRE',
    era: '1976–PRESENT',
    origin: 'LONDON, UK',
    genres: ['POST-PUNK', 'ART PUNK', 'MINIMALIST'],
    description: 'The most cerebral band of the post-punk vanguard. Wire stripped rock to its conceptual skeleton then rebuilt it as pure information.',
    influenceScore: 88,
    energy: 78, acousticness: 16, darkness: 58, experimental: 86, danceability: 52
  },
  {
    id: 'gang_of_four',
    name: 'GANG OF FOUR',
    era: '1976–1997',
    origin: 'LEEDS, UK',
    genres: ['POST-PUNK', 'ART PUNK', 'FUNK PUNK'],
    description: 'Political economy set to angular dance rhythms. "Entertainment!" dismantled every myth rock ever told itself while remaining viscerally physical.',
    influenceScore: 90,
    energy: 84, acousticness: 14, darkness: 52, experimental: 80, danceability: 66
  },
  {
    id: 'my_bloody_valentine',
    name: 'MY BLOODY VALENTINE',
    era: '1983–PRESENT',
    origin: 'DUBLIN, IE',
    genres: ['SHOEGAZE', 'DREAM POP', 'NOISE ROCK'],
    description: 'Kevin Shields built a wall of guitar texture so dense it collapsed the distinction between noise and melody. "Loveless" remains a singular object.',
    influenceScore: 96,
    energy: 82, acousticness: 12, darkness: 62, experimental: 92, danceability: 42
  },
  {
    id: 'cocteau_twins',
    name: 'COCTEAU TWINS',
    era: '1979–1997',
    origin: 'GRANGEMOUTH, UK',
    genres: ['DREAM POP', 'SHOEGAZE', 'POST-PUNK'],
    description: 'Elizabeth Fraser\'s voice as pure texture — a private glossolalia that communicated emotion without language. The Cocteau Twins created a sealed aesthetic world.',
    influenceScore: 89,
    energy: 44, acousticness: 48, darkness: 54, experimental: 76, danceability: 36
  },
  {
    id: 'dead_can_dance',
    name: 'DEAD CAN DANCE',
    era: '1981–PRESENT',
    origin: 'MELBOURNE, AU',
    genres: ['NEOCLASSICAL', 'DARKWAVE', 'WORLD'],
    description: 'Lisa Gerrard and Brendan Perry traversed every ancient musical tradition to arrive somewhere entirely their own. Sacred music with no specific god.',
    influenceScore: 87,
    energy: 26, acousticness: 72, darkness: 78, experimental: 70, danceability: 14
  },
  {
    id: 'sisters_mercy',
    name: 'THE SISTERS OF MERCY',
    era: '1980–PRESENT',
    origin: 'LEEDS, UK',
    genres: ['GOTH ROCK', 'POST-PUNK', 'DARKWAVE'],
    description: 'Andrew Eldritch\'s gothic grandeur at maximum density. The drum machine — "Doktor Avalanche" — as monument, the bass as architecture.',
    influenceScore: 88,
    energy: 66, acousticness: 16, darkness: 94, experimental: 56, danceability: 24
  },
  {
    id: 'tindersticks',
    name: 'TINDERSTICKS',
    era: '1991–PRESENT',
    origin: 'NOTTINGHAM, UK',
    genres: ['CHAMBER POP', 'ART ROCK', 'DARKWAVE'],
    description: 'Stuart Staples\' baritone over orchestral arrangements of crushing intimacy. Tindersticks make music that sounds like the interior of a film no one else can see.',
    influenceScore: 85,
    energy: 22, acousticness: 78, darkness: 84, experimental: 60, danceability: 12
  },
  {
    id: 'swans',
    name: 'SWANS',
    era: '1982–PRESENT',
    origin: 'NEW YORK, US',
    genres: ['NOISE ROCK', 'POST-PUNK', 'EXPERIMENTAL'],
    description: 'Michael Gira\'s confrontation with transcendence and brutality across four decades of reinvention. Swans are long-form sonic rituals.',
    influenceScore: 92,
    energy: 64, acousticness: 42, darkness: 98, experimental: 94, danceability: 8
  },
  {
    id: 'the_fall',
    name: 'THE FALL',
    era: '1976–2018',
    origin: 'MANCHESTER, UK',
    genres: ['POST-PUNK', 'EXPERIMENTAL ROCK', 'KRAUTROCK'],
    description: 'Mark E. Smith\'s relentless, decade-spanning machine. The Fall released 32 studio albums, never compromised, and never repeated themselves.',
    influenceScore: 91,
    energy: 80, acousticness: 36, darkness: 62, experimental: 88, danceability: 50
  },
  {
    id: 'can',
    name: 'CAN',
    era: '1968–1979',
    origin: 'COLOGNE, DE',
    genres: ['KRAUTROCK', 'EXPERIMENTAL', 'AVANT-GARDE'],
    description: 'Holger Czukay, Michael Karoli, Jaki Liebezeit and company invented a new grammar of collective improvisation. Motorik rhythms template.',
    influenceScore: 93,
    energy: 76, acousticness: 30, darkness: 46, experimental: 96, danceability: 72
  }
];

const COLLECTIONS = [
  {
    id: 'bristol_sound',
    name: 'THE BRISTOL SOUND',
    subtitle: 'TRIP-HOP TRINITY · 1991–2008',
    description: 'Three artists who turned a post-industrial English city into a laboratory for slow-motion dread. The Bristol sound synthesized hip-hop rhythms, film noir sampling, and electronic experimentation into something new and entirely urban.',
    artistIds: ['portishead', 'massive_attack', 'radiohead'],
    coverColor: '#1c1f1c',
    tags: ['TRIP-HOP', 'ELECTRONIC', 'DARKWAVE']
  },
  {
    id: '4ad_axis',
    name: 'THE 4AD CONSTELLATION',
    subtitle: 'LABEL AS AESTHETIC SYSTEM · 1978–1997',
    description: 'Label 4AD under Ivo Watts-Russell became the home of the uncanny. From Bauhaus to the Cocteau Twins, these acts shared a fidelity to texture, atmosphere, and the romantic power of silence.',
    artistIds: ['bauhaus', 'cocteau_twins', 'dead_can_dance', 'the_cure'],
    coverColor: '#2b2a24',
    tags: ['DARKWAVE', 'DREAM POP', 'GOTH ROCK', 'POST-PUNK']
  },
  {
    id: 'post_punk_vanguard',
    name: 'POST-PUNK VANGUARD',
    subtitle: 'FOUNDING DOCUMENTS · 1976–1983',
    description: 'The bands that dismantled rock and gave it back as architecture. Political, minimal, relentless — and still unreplicated. Wire\'s compression, Gang of Four\'s rhythm, The Fall\'s velocity, Joy Division\'s dread.',
    artistIds: ['wire', 'gang_of_four', 'the_fall', 'joy_division', 'can'],
    coverColor: '#2b1b1b',
    tags: ['POST-PUNK', 'ART PUNK', 'KRAUTROCK']
  },
  {
    id: 'gothic_triumvirate',
    name: 'GOTHIC TRIUMVIRATE',
    subtitle: 'THREE ARCHITECTURES OF DARKNESS · 1978–PRESENT',
    description: 'Three monuments. Three completely different approaches to darkness as aesthetic system. Bauhaus: theatrical, corporeal, visual. Sisters of Mercy: architectural, monumental, cold. Nick Cave: literary, biblical, intimate.',
    artistIds: ['bauhaus', 'sisters_mercy', 'nick_cave'],
    coverColor: '#1a1a1e',
    tags: ['GOTH ROCK', 'DARKWAVE', 'POST-PUNK']
  },
  {
    id: 'shoegaze_cloud',
    name: 'THE SHOEGAZE CLOUD',
    subtitle: 'TEXTURE AS EMOTION · 1984–1998',
    description: 'The disappearance of the guitar into pure texture. Three acts that treated volume and sonic density as emotional states rather than musical tools. My Bloody Valentine\'s violence, Cocteau Twins\' aquatic grace, Portishead\'s paranoid cinema.',
    artistIds: ['my_bloody_valentine', 'cocteau_twins', 'portishead'],
    coverColor: '#302633',
    tags: ['SHOEGAZE', 'DREAM POP', 'TRIP-HOP']
  },
  {
    id: 'bleak_pastoral',
    name: 'BLEAK PASTORAL',
    subtitle: 'BRITISH DARK FOLK · 1983–PRESENT',
    description: 'Artists who found the gothic not in urban noir but in landscape, soil, and the weight of history. Folk music haunted by centuries rather than decades. Cave\'s Australia-as-Bible-country, Harvey\'s rural Dorset exorcisms.',
    artistIds: ['nick_cave', 'pj_harvey', 'tindersticks', 'dead_can_dance'],
    coverColor: '#282d24',
    tags: ['ART ROCK', 'CHAMBER POP', 'DARKWAVE', 'NEOCLASSICAL']
  }
];

async function main() {
  console.log('🌱 Start seeding...');

  // 1. Seed Artists
  for (const a of ARTISTS) {
    const artist = await prisma.artist.upsert({
      where: { name: a.name },
      update: {
        era: a.era,
        origin: a.origin,
        genres: a.genres,
        description: a.description,
        influenceScore: a.influenceScore,
        energy: a.energy,
        acousticness: a.acousticness,
        darkness: a.darkness,
        experimental: a.experimental,
        danceability: a.danceability,
      },
      create: {
        name: a.name,
        era: a.era,
        origin: a.origin,
        genres: a.genres,
        description: a.description,
        influenceScore: a.influenceScore,
        energy: a.energy,
        acousticness: a.acousticness,
        darkness: a.darkness,
        experimental: a.experimental,
        danceability: a.danceability,
      },
    });
    console.log(`Created/updated artist: ${artist.name}`);
  }

  // 2. Seed Collections
  for (const c of COLLECTIONS) {
    const col = await prisma.collection.upsert({
      where: { id: c.id },
      update: {
        name: c.name,
        subtitle: c.subtitle,
        description: c.description,
        coverColor: c.coverColor,
        artistIds: c.artistIds,
        tags: c.tags,
      },
      create: {
        id: c.id,
        name: c.name,
        subtitle: c.subtitle,
        description: c.description,
        coverColor: c.coverColor,
        artistIds: c.artistIds,
        tags: c.tags,
      },
    });
    console.log(`Created/updated collection: ${col.name}`);
  }

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
