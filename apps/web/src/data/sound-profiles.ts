export interface SoundProfile {
  energy: number;         // 0–100
  acousticness: number;   // 0–100
  darkness: number;       // 0–100
  experimentalism: number; // 0–100
  danceability: number;   // 0–100
}

export const SOUND_PROFILES: Record<string, SoundProfile> = {
  bauhaus:          { energy: 72, acousticness: 22, darkness: 94, experimentalism: 74, danceability: 28 },
  joy_division:     { energy: 58, acousticness: 20, darkness: 97, experimentalism: 80, danceability: 22 },
  the_cure:         { energy: 55, acousticness: 34, darkness: 82, experimentalism: 64, danceability: 38 },
  siouxsie:         { energy: 68, acousticness: 18, darkness: 86, experimentalism: 72, danceability: 34 },
  nick_cave:        { energy: 42, acousticness: 62, darkness: 92, experimentalism: 78, danceability: 18 },
  pj_harvey:        { energy: 70, acousticness: 44, darkness: 80, experimentalism: 82, danceability: 26 },
  portishead:       { energy: 34, acousticness: 36, darkness: 96, experimentalism: 68, danceability: 20 },
  massive_attack:   { energy: 48, acousticness: 22, darkness: 88, experimentalism: 62, danceability: 44 },
  radiohead:        { energy: 52, acousticness: 38, darkness: 84, experimentalism: 90, danceability: 32 },
  scott_walker:     { energy: 30, acousticness: 58, darkness: 90, experimentalism: 96, danceability: 10 },
  wire:             { energy: 78, acousticness: 16, darkness: 58, experimentalism: 86, danceability: 52 },
  gang_of_four:     { energy: 84, acousticness: 14, darkness: 52, experimentalism: 80, danceability: 66 },
  my_bloody_valentine: { energy: 82, acousticness: 12, darkness: 62, experimentalism: 92, danceability: 42 },
  cocteau_twins:    { energy: 44, acousticness: 48, darkness: 54, experimentalism: 76, danceability: 36 },
  dead_can_dance:   { energy: 26, acousticness: 72, darkness: 78, experimentalism: 70, danceability: 14 },
  sisters_mercy:    { energy: 66, acousticness: 16, darkness: 94, experimentalism: 56, danceability: 24 },
  tindersticks:     { energy: 22, acousticness: 78, darkness: 84, experimentalism: 60, danceability: 12 },
  swans:            { energy: 64, acousticness: 42, darkness: 98, experimentalism: 94, danceability: 8 },
  the_fall:         { energy: 80, acousticness: 36, darkness: 62, experimentalism: 88, danceability: 50 },
  can:              { energy: 76, acousticness: 30, darkness: 46, experimentalism: 96, danceability: 72 },
};
