
import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AUDIO_TRACKS, AudioTrack } from '../constants';

// Interface pour exposer les méthodes au parent
export interface AudioPlayerRef {
  triggerPlay: () => void;
}

const AudioPlayer = forwardRef<AudioPlayerRef>((_, ref) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const hasTriggeredPlay = useRef(false);

  const currentTrack = AUDIO_TRACKS[currentTrackIndex];

  // Exposer la méthode triggerPlay au parent
  useImperativeHandle(ref, () => ({
    triggerPlay: () => {
      // Ne déclencher qu'une seule fois
      if (hasTriggeredPlay.current || isPlaying) return;
      hasTriggeredPlay.current = true;
      startPlayback();
    }
  }));

  useEffect(() => {
    // Créer l'élément audio
    audioRef.current = new Audio();
    audioRef.current.volume = 0.3;
    audioRef.current.loop = false; // Désactivé pour passer à la piste suivante

    // Nettoyer à la destruction
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Passer à la piste suivante quand la chanson se termine
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      const nextIndex = (currentTrackIndex + 1) % AUDIO_TRACKS.length;
      setCurrentTrackIndex(nextIndex);
      loadAndPlayTrack(AUDIO_TRACKS[nextIndex]);
    };

    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex]);

  // Mettre à jour la progression
  useEffect(() => {
    if (isPlaying) {
      progressIntervalRef.current = window.setInterval(() => {
        if (audioRef.current && audioRef.current.duration) {
          setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
        }
      }, 100);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying]);

  const startPlayback = async () => {
    if (!audioRef.current || isPlaying) return;

    setIsLoading(true);
    audioRef.current.src = AUDIO_TRACKS[0].url;

    try {
      await audioRef.current.load();
      await audioRef.current.play();
      fadeIn();
      setIsPlaying(true);
      setProgress(0);
    } catch (error) {
      console.warn('Erreur de lecture audio:', error);
      hasTriggeredPlay.current = false; // Réinitialiser pour permettre une nouvelle tentative
    }

    setIsLoading(false);
  };

  const loadAndPlayTrack = async (track: AudioTrack) => {
    if (!audioRef.current) return;

    setIsLoading(true);

    // Fade out si déjà en lecture
    if (isPlaying) {
      await fadeOut();
    }

    audioRef.current.src = track.url;

    try {
      await audioRef.current.load();
      await audioRef.current.play();
      fadeIn();
      setIsPlaying(true);
      setProgress(0);
    } catch (error) {
      console.warn('Erreur de lecture audio:', error);
    }

    setIsLoading(false);
  };

  const fadeIn = () => {
    if (!audioRef.current) return;
    audioRef.current.volume = 0;
    let vol = 0;
    // Fade-in très doux : 3 secondes pour atteindre le volume final
    const fadeInterval = setInterval(() => {
      vol += 0.005;
      if (vol >= 0.3) {
        vol = 0.3;
        clearInterval(fadeInterval);
      }
      if (audioRef.current) audioRef.current.volume = vol;
    }, 50);
  };

  const fadeOut = (): Promise<void> => {
    return new Promise((resolve) => {
      if (!audioRef.current) {
        resolve();
        return;
      }
      let vol = audioRef.current.volume;
      const fadeInterval = setInterval(() => {
        vol -= 0.02;
        if (vol <= 0) {
          vol = 0;
          clearInterval(fadeInterval);
          if (audioRef.current) {
            audioRef.current.pause();
          }
          resolve();
        }
        if (audioRef.current) audioRef.current.volume = vol;
      }, 30);
    });
  };

  const togglePlayback = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      await fadeOut();
      setIsPlaying(false);
    } else {
      if (!audioRef.current.src || audioRef.current.src === window.location.href) {
        await loadAndPlayTrack(currentTrack);
      } else {
        audioRef.current.play();
        fadeIn();
        setIsPlaying(true);
      }
    }
  };

  const selectTrack = async (index: number) => {
    setCurrentTrackIndex(index);
    await loadAndPlayTrack(AUDIO_TRACKS[index]);
  };

  const nextTrack = async () => {
    const nextIndex = (currentTrackIndex + 1) % AUDIO_TRACKS.length;
    await selectTrack(nextIndex);
  };

  const prevTrack = async () => {
    const prevIndex = (currentTrackIndex - 1 + AUDIO_TRACKS.length) % AUDIO_TRACKS.length;
    await selectTrack(prevIndex);
  };

  // Extraire le nom court de la piste
  const getShortTitle = (title: string) => {
    const words = title.split(' ');
    if (words.length <= 2) return title;
    return words.slice(0, 2).join(' ') + '...';
  };

  return (
    <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[250]">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute bottom-full right-0 mb-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl border border-black/5 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 pt-5 pb-3 border-b border-black/5">
              <p className="text-[8px] uppercase tracking-[0.4em] text-zinc-400 mb-1">Ambiance Sonore</p>
              <h3 className="text-sm font-medium text-zinc-800 serif italic">{currentTrack.title}</h3>
            </div>

            {/* Progress bar */}
            <div className="px-5 py-3">
              <div className="h-[2px] bg-zinc-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-zinc-400"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="px-5 pb-4 flex items-center justify-center gap-6">
              <button
                onClick={prevTrack}
                className="p-2 text-zinc-400 hover:text-zinc-800 transition-colors"
                aria-label="Piste précédente"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 6h2v12H6V6zm3.5 6 8.5 6V6l-8.5 6z"/>
                </svg>
              </button>

              <button
                onClick={togglePlayback}
                disabled={isLoading}
                className="w-12 h-12 rounded-full bg-zinc-900 text-white flex items-center justify-center hover:bg-zinc-800 transition-colors disabled:opacity-50"
                aria-label={isPlaying ? 'Pause' : 'Lecture'}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : isPlaying ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="ml-1">
                    <path d="M8 5v14l11-7L8 5z"/>
                  </svg>
                )}
              </button>

              <button
                onClick={nextTrack}
                className="p-2 text-zinc-400 hover:text-zinc-800 transition-colors"
                aria-label="Piste suivante"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 18l8.5-6L6 6v12zm8.5 0h2V6h-2v12z"/>
                </svg>
              </button>
            </div>

            {/* Track list */}
            <div className="border-t border-black/5">
              {AUDIO_TRACKS.map((track, index) => (
                <button
                  key={track.id}
                  onClick={() => selectTrack(index)}
                  className={`w-full px-5 py-3 text-left flex items-center gap-3 hover:bg-zinc-50 transition-colors ${
                    index === currentTrackIndex ? 'bg-zinc-50' : ''
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] ${
                    index === currentTrackIndex
                      ? 'bg-zinc-900 text-white'
                      : 'bg-zinc-100 text-zinc-500'
                  }`}>
                    {index === currentTrackIndex && isPlaying ? (
                      <motion.span
                        animate={{ opacity: [1, 0.4, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        ♪
                      </motion.span>
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span className={`text-xs truncate ${
                    index === currentTrackIndex ? 'text-zinc-900 font-medium' : 'text-zinc-500'
                  }`}>
                    {track.title}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main button */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-full border border-black/5 shadow-lg transition-all duration-500 ${
          isExpanded
            ? 'bg-zinc-900 text-white'
            : 'bg-white/80 backdrop-blur-xl hover:bg-white'
        }`}
      >
        {/* Equalizer animation */}
        <div className="relative w-5 h-5 flex items-center justify-center gap-[2px]">
          <motion.div
            animate={isPlaying ? { height: [6, 14, 8, 12, 6] } : { height: 6 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
            className={`w-[2px] rounded-full ${isExpanded ? 'bg-white' : 'bg-zinc-800'}`}
          />
          <motion.div
            animate={isPlaying ? { height: [10, 6, 14, 8, 10] } : { height: 10 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className={`w-[2px] rounded-full ${isExpanded ? 'bg-white' : 'bg-zinc-800'}`}
          />
          <motion.div
            animate={isPlaying ? { height: [4, 10, 6, 12, 4] } : { height: 4 }}
            transition={{ repeat: Infinity, duration: 0.9, ease: 'easeInOut' }}
            className={`w-[2px] rounded-full ${isExpanded ? 'bg-white' : 'bg-zinc-800'}`}
          />
        </div>

        {/* Track info */}
        <span className={`text-[9px] uppercase tracking-[0.3em] font-medium hidden sm:block ${
          isExpanded ? 'text-white/80' : 'text-zinc-500'
        }`}>
          {isPlaying ? getShortTitle(currentTrack.title) : 'Ambiance'}
        </span>

        {/* Expand icon */}
        <motion.svg
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`hidden sm:block ${isExpanded ? 'text-white/60' : 'text-zinc-400'}`}
        >
          <path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round"/>
        </motion.svg>
      </motion.button>
    </div>
  );
});

AudioPlayer.displayName = 'AudioPlayer';

export default AudioPlayer;
