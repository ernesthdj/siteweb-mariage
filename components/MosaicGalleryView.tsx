
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { GalleryAlbum, AlbumDisplayConfig, ALBUM_DISPLAY_CONFIGS } from '../constants';

interface MosaicGalleryViewProps {
  albums: GalleryAlbum[];
  title?: string;
  onClose: () => void;
  onAlbumClick: (album: GalleryAlbum) => void;
  savedScrollPosition?: number;
  onScrollPositionChange?: (position: number) => void;
}

const MosaicGalleryView: React.FC<MosaicGalleryViewProps> = ({
  albums,
  title = "Albums",
  onClose,
  onAlbumClick,
  savedScrollPosition = 0,
  onScrollPositionChange
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Bloquer le scroll du body
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  // Restaurer la position de scroll au montage
  useEffect(() => {
    if (scrollContainerRef.current && savedScrollPosition > 0) {
      scrollContainerRef.current.scrollTop = savedScrollPosition;
    }
  }, [savedScrollPosition]);

  // Fermer avec Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Scroll vertical doux
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let targetScroll = container.scrollTop;
    let animationFrameId: number | null = null;

    const EASE_FACTOR = 0.05;
    const WHEEL_SENSITIVITY = 3.0;

    const smoothScroll = () => {
      const currentScroll = container.scrollTop;
      const diff = targetScroll - currentScroll;

      if (Math.abs(diff) > 0.5) {
        container.scrollTop = currentScroll + diff * EASE_FACTOR;
        animationFrameId = requestAnimationFrame(smoothScroll);
      } else {
        container.scrollTop = targetScroll;
        animationFrameId = null;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetScroll = container.scrollTop + e.deltaY * WHEEL_SENSITIVITY;
      targetScroll = Math.max(0, Math.min(targetScroll, container.scrollHeight - container.clientHeight));

      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(smoothScroll);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  // Configuration par défaut pour les albums sans config spécifique
  const getDefaultConfig = (index: number, album: GalleryAlbum): AlbumDisplayConfig => ({
    image: {
      url: album.coverUrl, // Utilise l'URL de couverture de l'album par défaut
      scale: 0.8,
      rotation: index % 2 === 0 ? -1.5 : 1.5,
      offsetX: 0,
      offsetY: 0
    },
    text: {
      content: album.description || "Découvrez cette collection unique de moments précieux.",
      offsetX: 0,
      offsetY: 0,
      rotation: index % 2 === 0 ? 1 : -1,
      scale: 1,
      opacity: 0.85
    },
    layout: {
      side: index % 2 === 0 ? 'left' : 'right',
      marginTop: 0,
      marginBottom: 80
    },
  });

  // Obtenir la configuration d'un album
  const getConfig = (index: number, album: GalleryAlbum): AlbumDisplayConfig => {
    return ALBUM_DISPLAY_CONFIGS[index] || getDefaultConfig(index, album);
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100]"
    >
      {/* Fond opaque immédiat pour cacher le contenu derrière */}
      <div className="absolute inset-0 bg-[#faf8f5] wall-texture" />

      {/* Conteneur scrollable */}
      <div
        ref={scrollContainerRef}
        className="absolute inset-0 overflow-y-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
      {/* Header fixe */}
      <div className="sticky top-0 left-0 w-full h-16 md:h-20 flex items-center justify-between px-4 md:px-12 z-[110] bg-[#faf8f5]/90 backdrop-blur-sm border-b border-black/5">
        <button
          onClick={onClose}
          className="group flex items-center gap-2 md:gap-4 text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] text-zinc-400 hover:text-black transition-colors"
        >
          <div className="w-6 md:w-8 h-[1px] bg-zinc-300 group-hover:w-10 group-hover:bg-black transition-all" />
          <span>Retour</span>
        </button>

        <div className="text-center">
          <h2 className="serif italic text-base md:text-xl text-[#8b7355]">{title}</h2>
          <p className="text-[7px] md:text-[8px] uppercase tracking-widest text-zinc-400">
            {albums.length} album{albums.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className="w-20" />
      </div>

      {/* Liste des albums - un par ligne avec texte alterné */}
      <div className="w-full py-8 sm:py-12 md:py-24 pb-24 sm:pb-32 px-4 sm:px-6 md:px-8 lg:px-16 max-w-7xl mx-auto">
        {albums.map((album, index) => {
          const config = getConfig(index, album);
          const isLeft = config.layout.side === 'left';

          return (
            <motion.div
              key={album.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 1,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className={`flex flex-col md:flex-row items-center gap-6 sm:gap-8 md:gap-12 lg:gap-20 ${
                isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
              style={{
                marginTop: `${Math.min(config.layout.marginTop, 40)}px`,
                marginBottom: `${Math.min(config.layout.marginBottom, 60)}px`,
              }}
            >
              {/* IMAGE DE L'ALBUM */}
              <div
                className="w-full md:flex-1 flex justify-center"
                style={{
                  transform: `rotate(${config.image.rotation * 0.5}deg)`,
                }}
              >
                <motion.img
                  src={config.image.url}
                  alt={album.title}
                  className="h-auto object-contain cursor-pointer w-[70%] sm:w-[60%] md:w-full"
                  style={{
                    maxWidth: 'min(400px, 80vw)',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  onClick={() => {
                    if (scrollContainerRef.current && onScrollPositionChange) {
                      onScrollPositionChange(scrollContainerRef.current.scrollTop);
                    }
                    onAlbumClick(album);
                  }}
                />
              </div>

              {/* TEXTE À CÔTÉ */}
              <motion.div
                className="w-full md:flex-1 flex flex-col justify-center text-center md:text-left px-2 sm:px-4 md:px-0"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.8,
                  delay: 0.2,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
              >
                {/* Titre de l'album */}
                <motion.h3
                  className="handwritten text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-[#8b7355] mb-1 sm:mb-2"
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  {album.title}
                </motion.h3>

                {/* Sous-titre */}
                <motion.p
                  className="text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.3em] sm:tracking-[0.4em] text-zinc-400 mb-4 sm:mb-6"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  {album.subtitle}
                </motion.p>

                {/* Ligne décorative - centrée sur mobile */}
                <motion.div
                  className="w-12 sm:w-16 h-[1px] bg-[#8b7355]/30 mb-4 sm:mb-6 mx-auto md:mx-0"
                  initial={{ width: 0 }}
                  whileInView={{ width: 48 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                />

                {/* Description/Texte principal */}
                <motion.p
                  className="text-sm sm:text-base md:text-lg text-zinc-500 font-light leading-relaxed mb-4 sm:mb-6"
                  style={{ opacity: config.text.opacity }}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: config.text.opacity, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  {config.text.content}
                </motion.p>

                {/* Nombre de photos et bouton */}
                <motion.div
                  className="flex items-center justify-center md:justify-start gap-2 sm:gap-3"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-zinc-400">
                    {album.photos.length} photos
                  </span>
                  <div className="w-6 sm:w-8 h-[1px] bg-zinc-200" />
                  <button
                    onClick={() => {
                      if (scrollContainerRef.current && onScrollPositionChange) {
                        onScrollPositionChange(scrollContainerRef.current.scrollTop);
                      }
                      onAlbumClick(album);
                    }}
                    className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[#8b7355] hover:text-[#6b5740] active:text-[#5a4a35] transition-colors"
                  >
                    Voir l'album →
                  </button>
                </motion.div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Instructions en bas */}
      <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 text-center z-[105]">
        <span className="text-zinc-400 text-[8px] sm:text-[9px] uppercase tracking-widest bg-[#faf8f5]/80 px-3 sm:px-4 py-2 backdrop-blur-sm">
          Scrollez pour découvrir
        </span>
      </div>

      {/* Couche d'ombre portée */}
      <div
        className="fixed inset-0 z-[120] pointer-events-none"
        style={{
          backgroundImage: 'url(https://res.cloudinary.com/dzoshz4ut/image/upload/v1769988059/Ombre_Port%C3%A9e_nxbqxv.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      </div>
    </motion.div>
  );
};

export default MosaicGalleryView;
