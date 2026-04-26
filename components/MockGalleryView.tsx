
import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MockPhoto } from '../constants';

// ============================================================================
// COMPOSANT TYPEWRITER - Effet d'écriture manuscrite en direct
// ============================================================================
interface TypewriterTextProps {
  text: string;
  isVisible: boolean;
  className?: string;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({ text, isVisible, className = '' }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setDisplayedText('');
      setCurrentIndex(0);
      return;
    }

    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 35 + Math.random() * 25); // Vitesse variable pour effet naturel

      return () => clearTimeout(timeout);
    }
  }, [isVisible, currentIndex, text]);

  // Reset quand le texte change
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 20 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={className}
    >
      <span className="handwritten text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-[#8b7355] leading-relaxed">
        {displayedText}
      </span>
      {/* Curseur clignotant */}
      {isVisible && currentIndex < text.length && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="inline-block w-[2px] h-4 sm:h-5 md:h-6 lg:h-8 xl:h-10 bg-[#8b7355]/60 ml-1 align-middle"
        />
      )}
    </motion.div>
  );
};

// ============================================================================
// DESCRIPTIONS DES PHOTOS - Lorem Ipsum pour test
// ============================================================================
const PHOTO_DESCRIPTIONS: Record<string, string> = {
  'mock1': "« Elle croyait au possible, et le possible est arrivé. » - Victor Hugo.",
  'mock2': "« L’amour ne consiste pas à se regarder l’un l’autre, mais à regarder ensemble dans la même direction. » - Antoine de Saint-Exupéry",
  'mock3': "« Le mariage est et restera le voyage de découverte le plus important que l'homme puisse entreprendre. » - Søren Kierkegaard.",
  'mock4': "L'éternité ne se mesure pas en années, mais en ces instants où le cœur bat à l'unisson. Un moment figé pour toujours.",
  'mock5': "La sérénité d'un amour qui n'a plus rien à prouver. Juste être là, ensemble, suffit à illuminer le monde entier.",
  'mock6': "Une douceur infinie émane de ce portrait. Le voile qui caresse, la lumière qui enveloppe, l'amour qui transperce.",
  'mock7': "L'harmonie parfaite de deux âmes qui ont choisi de danser ensemble pour le reste de leur vie.",
  'mock8': "La passion brûle dans leurs regards. Cet instant capture toute l'intensité de leur amour naissant.",
  'mock9': "Une promesse murmurée, un serment échangé. Les alliances brillent, témoins silencieux de cet engagement sacré.",
  'mock10': "La lumière dorée du couchant enveloppe les mariés. Un tableau vivant, peint par les derniers rayons du soleil.",
  'mock11': "Ces mains croisées racontent une histoire d'amour écrite jour après jour, geste après geste, caresse après caresse.",
  'mock12': "Telle une princesse de conte de fées, la mariée rayonne. Son sourire illumine la pièce tout entière.",
  'default': "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation."
};

interface MockGalleryViewProps {
  photos: MockPhoto[];
  title?: string;
  startIndex?: number;  // Index de départ pour le carousel
  onClose: () => void;
}

const MockGalleryView: React.FC<MockGalleryViewProps> = ({ photos, title = "Galerie", startIndex = 0, onClose }) => {
  // Index de la photo actuellement affichée
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isDimmed, setIsDimmed] = useState(false);

  // Set des photos qui ont été "révélées" - une fois révélé, le texte reste
  const [revealedPhotos, setRevealedPhotos] = useState<Set<number>>(new Set([startIndex]));

  // Fonction de fermeture avec animation
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 250); // Temps de l'animation de fermeture
  }, [onClose]);

  // Bloquer le scroll du body + déclencher le tamisage de lumière
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    // Petit délai pour que l'animation d'entrée se fasse d'abord, puis on tamise
    const dimTimer = setTimeout(() => setIsDimmed(true), 300);
    return () => {
      document.body.style.overflow = 'auto';
      clearTimeout(dimTimer);
    };
  }, []);

  // Révéler la photo courante
  useEffect(() => {
    if (!revealedPhotos.has(currentIndex)) {
      // Petit délai pour que l'animation de slide se fasse d'abord
      const timer = setTimeout(() => {
        setRevealedPhotos(prev => new Set(prev).add(currentIndex));
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, revealedPhotos]);

  // Navigation vers photo suivante/précédente
  const goToPhoto = useCallback((newIndex: number) => {
    if (isAnimating) return;
    if (newIndex < 0 || newIndex >= photos.length) return;

    setIsAnimating(true);
    setCurrentIndex(newIndex);

    // Débloquer après l'animation
    setTimeout(() => setIsAnimating(false), 800);
  }, [isAnimating, photos.length]);

  // Fermer avec Escape, navigation avec flèches
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        goToPhoto(currentIndex + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        goToPhoto(currentIndex - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose, currentIndex, goToPhoto]);

  // Scroll avec la molette - navigation photo par photo
  useEffect(() => {
    let wheelAccumulator = 0;
    const WHEEL_THRESHOLD = 50; // Seuil pour déclencher le changement de photo

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (isAnimating) return;

      wheelAccumulator += e.deltaY;

      if (wheelAccumulator > WHEEL_THRESHOLD) {
        goToPhoto(currentIndex + 1);
        wheelAccumulator = 0;
      } else if (wheelAccumulator < -WHEEL_THRESHOLD) {
        goToPhoto(currentIndex - 1);
        wheelAccumulator = 0;
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [currentIndex, isAnimating, goToPhoto]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isClosing ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="fixed inset-0 z-[150]"
    >
      {/* Fond qui s'assombrit progressivement — effet "lumière tamisée" */}
      <motion.div
        className="absolute inset-0 wall-texture"
        initial={{ backgroundColor: '#faf8f5' }}
        animate={{ backgroundColor: isDimmed && !isClosing ? '#e8e0d4' : '#faf8f5' }}
        transition={{ duration: 1.8, ease: [0.25, 0.1, 0.25, 1] }}
      />
      {/* Header fixe */}
      <motion.div
        className="absolute top-0 left-0 w-full h-16 md:h-20 flex items-center justify-between px-4 md:px-12 z-[160] backdrop-blur-sm"
        initial={{ backgroundColor: 'rgba(250, 248, 245, 0.8)' }}
        animate={{ backgroundColor: isDimmed && !isClosing ? 'rgba(232, 224, 212, 0.85)' : 'rgba(250, 248, 245, 0.8)' }}
        transition={{ duration: 1.8, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <button
          onClick={handleClose}
          className="group flex items-center gap-2 md:gap-4 text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] text-zinc-400 hover:text-black transition-colors"
        >
          <div className="w-6 md:w-8 h-[1px] bg-zinc-300 group-hover:w-10 group-hover:bg-black transition-all" />
          <span>Retour</span>
        </button>

        <div className="text-center">
          <h2 className="serif italic text-base md:text-xl text-[#8b7355]">{title}</h2>
        </div>

        <div className="w-20" /> {/* Spacer pour centrer le titre */}
      </motion.div>

      {/* Conteneur avec animation de slide */}
      <div className="relative h-full w-full overflow-hidden">
        <AnimatePresence mode="wait">
          {photos.map((photo, index) => {
            if (index !== currentIndex) return null;

            const description = PHOTO_DESCRIPTIONS[photo.id] || PHOTO_DESCRIPTIONS['default'];
            const isRevealed = revealedPhotos.has(index);

            return (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{
                  duration: 0.7,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                className="absolute inset-0 flex items-center justify-center p-3 sm:p-4 md:p-8 pt-20 md:pt-24"
              >
                {/* Container - vertical sur mobile, horizontal sur desktop */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-12 lg:gap-16 max-w-full h-full w-full">
                  {/* Image PNG - responsive : petite sur mobile, grande sur desktop */}
                  <motion.img
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.5, ease: 'easeOut' }}
                    src={photo.carouselUrl}
                    alt={photo.title || `Photo ${index + 1}`}
                    className="w-auto h-auto object-contain flex-shrink-0
                      max-h-[45vh] sm:max-h-[50vh] md:max-h-[75vh] lg:max-h-[80vh]
                      max-w-[90vw] md:max-w-[55vw] lg:max-w-[50vw]"
                  />

                  {/* Zone de texte manuscrit - en dessous sur mobile, à côté sur desktop */}
                  <div className="flex-shrink-0 w-full md:w-[280px] lg:w-[350px] xl:w-[400px] max-w-[90vw] md:max-w-none flex items-center md:h-full px-2 sm:px-0">
                    <AnimatePresence>
                      {isRevealed && (
                        <motion.div
                          initial={{ opacity: 0, y: 20, x: 0 }}
                          animate={{ opacity: 1, y: 0, x: 0 }}
                          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                          className="w-full"
                        >
                          <div className="pl-4 md:pl-6 border-l-2 border-[#8b7355]/30">
                            {/* Titre de la photo */}
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.5, duration: 0.4 }}
                              className="text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[#8b7355]/60 mb-2 sm:mb-3 md:mb-4"
                            >
                              {photo.title || `Photo ${index + 1}`}
                            </motion.p>

                            {/* Texte qui s'écrit */}
                            <TypewriterText
                              text={description}
                              isVisible={isRevealed}
                              className="block"
                            />

                            {/* Petite signature en bas - cachée sur très petit écran */}
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 0.4 }}
                              transition={{ delay: 3, duration: 1 }}
                              className="mt-4 sm:mt-6 md:mt-8 hidden sm:block"
                            >
                              <span className="handwritten text-base sm:text-lg text-[#8b7355]/40 italic">
                                — Ernest H.
                              </span>
                            </motion.div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Indicateur de navigation */}
        <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 z-[105]">
          {photos.map((_, index) => (
            <button
              key={index}
              onClick={() => goToPhoto(index)}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-[#8b7355] w-4 sm:w-6'
                  : 'bg-[#8b7355]/30 hover:bg-[#8b7355]/50 w-1.5 sm:w-2'
              }`}
            />
          ))}
        </div>

        {/* Flèches de navigation - plus petites sur mobile */}
        {currentIndex > 0 && (
          <button
            onClick={() => goToPhoto(currentIndex - 1)}
            className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-[105] p-2 sm:p-3 text-[#8b7355]/40 hover:text-[#8b7355] transition-colors"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}
        {currentIndex < photos.length - 1 && (
          <button
            onClick={() => goToPhoto(currentIndex + 1)}
            className="absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-[105] p-2 sm:p-3 text-[#8b7355]/40 hover:text-[#8b7355] transition-colors"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )}
      </div>

      {/* Instructions en bas */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 text-zinc-400 text-[8px] sm:text-[9px] uppercase tracking-widest z-[105]">
        <span className="hidden md:inline">Molette pour naviguer</span>
        <span className="md:hidden">Swipez pour naviguer</span>
      </div>

      {/* Vignettage subtil — renforce l'effet lumière tamisée */}
      <motion.div
        className="fixed inset-0 z-[119] pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: isDimmed && !isClosing ? 1 : 0 }}
        transition={{ duration: 2, ease: 'easeOut' }}
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.12) 100%)',
        }}
      />

      {/* Couche d'ombre portée au-dessus de tout */}
      <div
        className="fixed inset-0 z-[120] pointer-events-none"
        style={{
          backgroundImage: 'url(https://res.cloudinary.com/dzoshz4ut/image/upload/v1769988211/Ombre_2_dtue5d.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
    </motion.div>
  );
};

export default MockGalleryView;
