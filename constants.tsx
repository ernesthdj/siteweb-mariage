
// ============================================================================
// AUDIO TRACKS — Pistes ambiantes
// ============================================================================

export interface AudioTrack {
  id: string;
  title: string;
  url: string;
}

export const AUDIO_TRACKS: AudioTrack[] = [
  {
    id: 'moonlit',
    title: 'Moonlit Teacups',
    url: 'https://res.cloudinary.com/dzoshz4ut/video/upload/v1769971796/Moonlit_Teacups_mahq0t.mp3'
  },
  {
    id: 'lanterns',
    title: 'Moonlight On Old Sketches',
    url: 'https://res.cloudinary.com/dzoshz4ut/video/upload/v1770049420/Moonlight_On_Old_Sketches_jppzjm.mp3'
  },
  {
    id: 'waltz',
    title: 'Moonlit Teacup Waltz',
    url: 'https://res.cloudinary.com/dzoshz4ut/video/upload/v1770078465/Moonlit_Teacup_Waltz_hicjnp.mp3'
  }
];
