export interface Album {
  title: string;
  year: number;
  note: string;
}

export const ALBUMS: Record<string, Album[]> = {
  bauhaus: [
    { title: 'IN THE FLAT FIELD', year: 1980, note: 'Gothic debut. Nine tracks of pure aural darkness.' },
    { title: 'MASK', year: 1981, note: 'The experimental peak. Cinematic, ritualistic, precise.' },
    { title: 'THE SKY\'S GONE OUT', year: 1982, note: 'Art rock expansion. Their most diverse statement.' },
    { title: 'BURNING FROM THE INSIDE', year: 1983, note: 'Final transmission. Recorded with Peter Murphy hospitalised.' },
  ],
  joy_division: [
    { title: 'UNKNOWN PLEASURES', year: 1979, note: 'The blueprint. Bernard Sumner\'s pulsar on the cover says everything.' },
    { title: 'CLOSER', year: 1980, note: 'Post-mortem masterpiece. Released weeks after Ian Curtis\'s death.' },
  ],
  the_cure: [
    { title: 'SEVENTEEN SECONDS', year: 1980, note: 'Cold wave beginning. Minimal, grey, hypnotic.' },
    { title: 'FAITH', year: 1981, note: 'Gothic cathedral. Robert Smith at his most despairing.' },
    { title: 'PORNOGRAPHY', year: 1982, note: 'Nihilist peak. The loudest silence on record.' },
    { title: 'DISINTEGRATION', year: 1989, note: 'Career pinnacle. Lush orchestral ruin.' },
    { title: 'BLOODFLOWERS', year: 2000, note: 'Final of the dark trilogy. Autumnal, graceful resignation.' },
  ],
  siouxsie: [
    { title: 'THE SCREAM', year: 1978, note: 'Post-punk birth. Confrontational and without precedent.' },
    { title: 'JUJU', year: 1981, note: 'Goth masterpiece. Siouxsie at her most commanding.' },
    { title: 'A KISS IN THE DREAMHOUSE', year: 1982, note: 'Psychedelic expansion. Arabian nights as dark fantasy.' },
    { title: 'TINDERBOX', year: 1986, note: 'Gothic maturity. Controlled menace throughout.' },
  ],
  nick_cave: [
    { title: 'FROM HER TO ETERNITY', year: 1984, note: 'Gothic blues birth. Cave as Old Testament prophet.' },
    { title: 'MURDER BALLADS', year: 1996, note: 'Gothic opera. Violence as literary device.' },
    { title: 'THE BOATMAN\'S CALL', year: 1997, note: 'Stripped to piano and confession.' },
    { title: 'SKELETON TREE', year: 2016, note: 'Grief document. Recorded as Cave\'s son died.' },
    { title: 'GHOSTEEN', year: 2019, note: 'Double album elegy. Transcendence through mourning.' },
  ],
  pj_harvey: [
    { title: 'DRY', year: 1992, note: 'Raw debut. Polly Jean Harvey fully formed, immediately distinct.' },
    { title: 'RID OF ME', year: 1993, note: 'Steve Albini brutalism. Most visceral record of the decade.' },
    { title: 'TO BRING YOU MY LOVE', year: 1995, note: 'Gothic blues synthesis. Cave collaboration era.' },
    { title: 'LET ENGLAND SHAKE', year: 2011, note: 'War poetry as folk music. Mercury Prize.' },
  ],
  portishead: [
    { title: 'DUMMY', year: 1994, note: 'Trip-hop birth. Beth Gibbons\' voice over film noir samples.' },
    { title: 'PORTISHEAD', year: 1997, note: 'Darker, more claustrophobic second statement.' },
    { title: 'THIRD', year: 2008, note: 'Industrial departure. Everything comfortable abandoned.' },
  ],
  massive_attack: [
    { title: 'BLUE LINES', year: 1991, note: 'Trip-hop foundation. Unqm in its synthesis.' },
    { title: 'PROTECTION', year: 1994, note: 'Emotional depth. More fragile, equally devastating.' },
    { title: 'MEZZANINE', year: 1998, note: 'Paranoid perfection. The city eating itself.' },
    { title: 'HELIGOLAND', year: 2010, note: 'Future bass. Bleak but forward-looking.' },
  ],
  radiohead: [
    { title: 'THE BENDS', year: 1995, note: 'Alternative peak before the metamorphosis.' },
    { title: 'OK COMPUTER', year: 1997, note: '20th century anxiety in album form. Defining document.' },
    { title: 'KID A', year: 2000, note: 'Electronic metamorphosis. Yorke disappears into abstraction.' },
    { title: 'IN RAINBOWS', year: 2007, note: 'Folk and electronic synthesis. Warmest of the late period.' },
    { title: 'A MOON SHAPED POOL', year: 2016, note: 'String-laden farewell letter to no one.' },
  ],
  scott_walker: [
    { title: 'SCOTT 4', year: 1969, note: 'Art pop peak before the long silence.' },
    { title: 'NITE FLIGHTS', year: 1978, note: 'Proto-industrial shock. Completely out of its time.' },
    { title: 'TILT', year: 1995, note: 'Avant-garde manifesto. 18 years between this and Nite Flights.' },
    { title: 'THE DRIFT', year: 2006, note: 'Extreme art music. Punching meat, musique concrète, horror.' },
  ],
  wire: [
    { title: 'PINK FLAG', year: 1977, note: 'Compressed punk. 21 songs, 35 minutes, zero waste.' },
    { title: 'CHAIRS MISSING', year: 1978, note: 'Progressive expansion. Synthesizers enter the room.' },
    { title: '154', year: 1979, note: 'Post-punk peak. Most fully realised statement.' },
  ],
  gang_of_four: [
    { title: 'ENTERTAINMENT!', year: 1979, note: 'THE post-punk record. Gill\'s dry riff never replicated.' },
    { title: 'SOLID GOLD', year: 1981, note: 'Funk evolution. The politics remain, the bass deepens.' },
  ],
  my_bloody_valentine: [
    { title: 'ISN\'T ANYTHING', year: 1988, note: 'Shoegaze birth. The guitar first disappears into texture.' },
    { title: 'LOVELESS', year: 1991, note: 'Genre-defining object. Beautiful and violent simultaneously.' },
    { title: 'M B V', year: 2013, note: '22-year sequel. Darker, slower, stranger.' },
  ],
  cocteau_twins: [
    { title: 'TREASURE', year: 1984, note: 'Gothic foundation. Fraser\'s glossolalia fully formed.' },
    { title: 'BLUE BELL KNOLL', year: 1988, note: 'Aquatic peak. Sound as pure sensory environment.' },
    { title: 'HEAVEN OR LAS VEGAS', year: 1990, note: 'Dream pop zenith. Most accessible and most beautiful.' },
  ],
  dead_can_dance: [
    { title: 'SPLEEN AND IDEAL', year: 1985, note: 'Medieval chamber. Ancient Europe reconstructed from memory.' },
    { title: 'WITHIN THE REALM OF A DYING SUN', year: 1987, note: 'Neoclassical apex. Orchestral and terrifying.' },
    { title: 'AION', year: 1990, note: 'World music synthesis. Celtic, Byzantine, Gregorian as one.' },
  ],
  sisters_mercy: [
    { title: 'FIRST AND LAST AND ALWAYS', year: 1985, note: 'Gothic debut. Eldritch\'s baritone as monument.' },
    { title: 'FLOODLAND', year: 1987, note: 'Gothic maximalism. Drum machine as geological event.' },
    { title: 'VISION THING', year: 1990, note: 'Industrial rock. America reflected back, distorted.' },
  ],
  tindersticks: [
    { title: 'TINDERSTICKS', year: 1993, note: 'Orchestral debut. Intimate and cinematic simultaneously.' },
    { title: 'CURTAINS', year: 1997, note: 'Film score intimacy. Every song a dissolve.' },
    { title: 'THE SOMETHING RAIN', year: 2012, note: 'Late career peak. Patience rewarded with grace.' },
  ],
  swans: [
    { title: 'FILTH', year: 1983, note: 'Industrial origin. Confrontational beyond genre.' },
    { title: 'THE SEER', year: 2012, note: 'Epic return. Two hours of ritual noise and transcendence.' },
    { title: 'TO BE KIND', year: 2014, note: 'Double album apotheosis. Grace through endurance.' },
  ],
  the_fall: [
    { title: 'LIVE AT THE WITCH TRIALS', year: 1979, note: 'Debut. Smith\'s rhythmic ranting fully formed.' },
    { title: 'HEX ENDUCTION HOUR', year: 1982, note: 'Masterpiece. Two drummers, pure momentum.' },
    { title: 'THIS NATION\'S SAVING GRACE', year: 1985, note: 'Pop peak. Still uncompromising.' },
  ],
  can: [
    { title: 'TAGO MAGO', year: 1971, note: 'Electronic peak. Damo Suzuki + motorik = everything.' },
    { title: 'EGE BAMYASI', year: 1972, note: 'Funky krautrock. Most accessible and immediately visceral.' },
    { title: 'FUTURE DAYS', year: 1973, note: 'Ambient masterpiece. Liebezeit dissolves into infinity.' },
  ],
};
