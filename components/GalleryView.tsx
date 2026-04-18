
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExhibitionTheme, Photo } from '../types';
import { LoveNote, InkBlot } from './ArtisticAccents';

interface GalleryViewProps {
  theme: ExhibitionTheme;
  onClose: () => void;
}

// Placeholder SVG pour les images non chargées
const PLACEHOLDER_V = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600"%3E%3Crect fill="%23f5f5f5" width="400" height="600"/%3E%3Ctext fill="%23ccc" font-family="system-ui" font-size="14" text-anchor="middle" x="200" y="300"%3EPhoto%3C/text%3E%3C/svg%3E';
const PLACEHOLDER_H = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"%3E%3Crect fill="%23f5f5f5" width="600" height="400"/%3E%3Ctext fill="%23ccc" font-family="system-ui" font-size="14" text-anchor="middle" x="300" y="200"%3EPhoto%3C/text%3E%3C/svg%3E';

// Palette de couleurs subtiles par type d'album
const getThemeColors = (type: string) => {
  const palettes: Record<string, { bg: string; bgGradient: string; accent: string; paper: string }> = {
    // Mariage - tons crème/ivoire chauds
    wedding: {
      bg: 'bg-[#faf8f5]',
      bgGradient: 'from-[#faf8f5] via-[#f7f4ef] to-[#f5f0e8]',
      accent: 'text-[#8b7355]',
      paper: '#f8f5f0'
    },
    // Nature - tons verts/sauge très doux
    nature: {
      bg: 'bg-[#f7f9f7]',
      bgGradient: 'from-[#f7f9f7] via-[#f4f7f4] to-[#f0f4ef]',
      accent: 'text-[#5a6b5a]',
      paper: '#f5f8f5'
    },
    // Culinaire - tons beige/caramel chaleureux
    culinary: {
      bg: 'bg-[#faf7f4]',
      bgGradient: 'from-[#faf7f4] via-[#f8f4ef] to-[#f5f0e8]',
      accent: 'text-[#8c6d4f]',
      paper: '#f9f5f0'
    },
    // Mode - tons gris/ardoise élégants
    fashion: {
      bg: 'bg-[#f7f7f8]',
      bgGradient: 'from-[#f7f7f8] via-[#f4f4f6] to-[#f0f0f3]',
      accent: 'text-[#555560]',
      paper: '#f6f6f8'
    },
    // Urbain - tons gris/béton industriels
    urban: {
      bg: 'bg-[#f6f6f7]',
      bgGradient: 'from-[#f6f6f7] via-[#f3f3f5] to-[#efeff2]',
      accent: 'text-[#606065]',
      paper: '#f5f5f7'
    },
    // Architecture - tons blanc/gris pur minimalistes
    architecture: {
      bg: 'bg-[#f8f8f9]',
      bgGradient: 'from-[#f8f8f9] via-[#f5f5f7] to-[#f2f2f5]',
      accent: 'text-[#505055]',
      paper: '#f7f7f9'
    },
    // Naissance - tons rose/pêche très doux
    birth: {
      bg: 'bg-[#faf8f8]',
      bgGradient: 'from-[#faf8f8] via-[#f9f6f6] to-[#f7f3f4]',
      accent: 'text-[#9a7070]',
      paper: '#f9f6f6'
    },
    // Portrait - tons sépia/brun chauds
    portrait: {
      bg: 'bg-[#f9f7f5]',
      bgGradient: 'from-[#f9f7f5] via-[#f6f4f0] to-[#f3f0eb]',
      accent: 'text-[#6b5d50]',
      paper: '#f8f5f2'
    },
  };

  return palettes[type] || palettes.wedding;
};

// Variations de placement "collé à la va-vite"
const getRandomPlacement = (index: number) => {
  const placements = [
    { rotate: -3, translateX: -15, translateY: 8 },
    { rotate: 2.5, translateX: 20, translateY: -5 },
    { rotate: -1.5, translateX: -8, translateY: 12 },
    { rotate: 4, translateX: 25, translateY: -10 },
    { rotate: -2, translateX: -20, translateY: 5 },
    { rotate: 1, translateX: 12, translateY: -8 },
    { rotate: -4, translateX: -25, translateY: 15 },
    { rotate: 3, translateX: 18, translateY: -12 },
    { rotate: -0.5, translateX: -5, translateY: 10 },
    { rotate: 2, translateX: 15, translateY: -6 },
  ];
  return placements[index % placements.length];
};

const GalleryView: React.FC<GalleryViewProps> = ({ theme, onClose }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Obtenir la palette de couleurs pour ce type d'album
  const colors = getThemeColors(theme.type);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  // Fermer avec Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedPhoto) {
          setSelectedPhoto(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto, onClose]);

  const handleImageError = (photoId: string) => {
    setImageErrors(prev => new Set(prev).add(photoId));
  };

  const getImageSrc = (photo: Photo) => {
    if (imageErrors.has(photo.id)) {
      return photo.width > photo.height ? PLACEHOLDER_H : PLACEHOLDER_V;
    }
    return photo.url;
  };

  const isVertical = (photo: Photo) => photo.height > photo.width;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[100] ${colors.bg} wall-texture overflow-y-auto scroll-smooth`}
    >
      {/* Header */}
      <div
        className={`sticky top-0 left-0 w-full h-16 md:h-20 flex items-center justify-between px-4 md:px-12 z-[110] ${colors.bg}/90 backdrop-blur-xl border-b border-black/5`}
      >
        <button
          onClick={onClose}
          className="group flex items-center gap-2 md:gap-4 text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] text-zinc-400 hover:text-black transition-colors"
        >
          <div className="w-6 md:w-8 h-[1px] bg-zinc-300 group-hover:w-10 group-hover:bg-black transition-all" />
          <span className="hidden sm:inline">Retour</span>
          <span className="sm:hidden">Retour</span>
        </button>
        <div className="text-right">
          <h2 className={`serif italic text-base md:text-xl ${colors.accent}`}>{theme.title}</h2>
          <p className="text-[7px] md:text-[8px] uppercase tracking-widest text-zinc-400">{theme.photos.length} photos</p>
        </div>
      </div>

      {/* Grille de photos style "collées" */}
      <div className="max-w-6xl mx-auto py-12 md:py-20 px-4 md:px-8">
        {/* Description */}
        <div className="mb-16 md:mb-24 max-w-2xl">
          <LoveNote text={theme.description} className="text-xl md:text-2xl" rotation={-1} />
        </div>

        {/* Grille de photos */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-12">
          {theme.photos.map((photo, index) => {
            const placement = getRandomPlacement(index);
            const vertical = isVertical(photo);

            return (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  transform: `rotate(${placement.rotate}deg) translate(${placement.translateX}px, ${placement.translateY}px)`,
                }}
                className="relative cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                {/* Ombre portée décalée */}
                <div
                  className="absolute inset-0 bg-black/10 blur-md"
                  style={{ transform: 'translate(4px, 6px)' }}
                />

                {/* Cadre photo */}
                <div className="relative bg-white p-2 md:p-3 shadow-sm">
                  <div
                    className={`relative overflow-hidden bg-zinc-100 ${
                      vertical ? 'aspect-[2/3]' : 'aspect-[3/2]'
                    }`}
                  >
                    <img
                      src={getImageSrc(photo)}
                      alt={photo.title}
                      onError={() => handleImageError(photo.id)}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>

                  {/* Légende manuscrite */}
                  <div className="mt-2 text-center">
                    <span className={`handwritten text-xs md:text-sm ${colors.accent} opacity-70 block truncate`}>
                      {photo.title}
                    </span>
                  </div>
                </div>

                {/* Petit scotch en haut (aléatoire) */}
                {index % 3 === 0 && (
                  <div
                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 md:w-10 h-3 md:h-4 bg-amber-100/60 opacity-70"
                    style={{ transform: `translateX(-50%) rotate(${placement.rotate > 0 ? -5 : 5}deg)` }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-24 md:mt-40 text-center opacity-20">
          <InkBlot className="w-16 mx-auto mb-6" />
          <p className="text-[9px] uppercase tracking-[0.5em]">Fin de la collection</p>
        </div>
      </div>

      {/* Modal plein écran pour photo agrandie */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/95 flex items-center justify-center p-4 md:p-8"
            onClick={() => setSelectedPhoto(null)}
          >
            {/* Bouton fermer */}
            <button
              className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-10"
              onClick={() => setSelectedPhoto(null)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Photo agrandie */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="relative max-w-5xl max-h-[85vh] bg-white p-3 md:p-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={getImageSrc(selectedPhoto)}
                alt={selectedPhoto.title}
                className="max-h-[75vh] w-auto object-contain"
              />

              {/* Légende */}
              <div className="mt-3 md:mt-4 text-center">
                <span className="handwritten text-lg md:text-xl text-zinc-700 block">
                  {selectedPhoto.title}
                </span>
                <span className="text-[9px] md:text-[10px] uppercase tracking-widest text-zinc-400 mt-1 block">
                  {selectedPhoto.subtitle}
                </span>
              </div>
            </motion.div>

            {/* Instructions */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-[9px] uppercase tracking-widest">
              Cliquez pour fermer
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GalleryView;
