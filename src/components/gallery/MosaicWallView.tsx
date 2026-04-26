/**
 * MosaicWallView — Vue mosaique "mur d'exposition" pour les photos
 * REUTILISE PhotoFrame.tsx existant pour chaque photo
 * Layout CSS columns (2 cols mobile, 3 tablette, 4 desktop)
 * Rotations aleatoires, mounts distribues cycliquement
 * Espacement irregulier, fond wall-texture
 * Scroll vertical avec smooth scroll (EASE_FACTOR 0.05)
 */

import React, { useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import PhotoFrame from '../../../components/PhotoFrame';
import type { Item } from '../../types';
import type { Photo, PhotoMount } from '../../../types';

interface MosaicWallViewProps {
  photos: Item[];
  onPhotoClick: (index: number) => void;
}

/** Genere une rotation aleatoire deterministe basee sur l'index */
const getRotation = (index: number): number => {
  const rotations = [-3.2, 2.1, -1.5, 3.8, -0.8, 2.9, -4.0, 1.2, -2.5, 3.5];
  return rotations[index % rotations.length];
};

/** Distribue les types de mounts cycliquement */
const getMount = (index: number): PhotoMount => {
  const mounts: PhotoMount[] = ['tape', 'corners', 'pin', 'none'];
  return mounts[index % mounts.length];
};

/** Genere un margin irregulier deterministe */
const getMargin = (index: number): number => {
  const margins = [8, 16, 12, 24, 10, 20, 14, 18, 22, 8];
  return margins[index % margins.length];
};

/** Convertit un Item CMS en Photo pour PhotoFrame */
const itemToPhoto = (item: Item, index: number): Photo => ({
  id: item.id,
  url: item.url ?? '',
  title: item.label,
  subtitle: item.subtitle ?? '',
  width: 300,
  height: 400,
  rotation: getRotation(index),
  shape: 'rectangle',
  mount: getMount(index),
});

const MosaicWallView: React.FC<MosaicWallViewProps> = ({
  photos,
  onPhotoClick,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Convertir les items en photos pour PhotoFrame
  const photoFrameData = useMemo(
    () => photos.map((photo, idx) => itemToPhoto(photo, idx)),
    [photos]
  );

  // Bloquer le scroll du body
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Scroll vertical doux (meme pattern que MosaicGalleryView existant)
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
      targetScroll = Math.max(
        0,
        Math.min(targetScroll, container.scrollHeight - container.clientHeight)
      );

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

  return (
    <div
      ref={scrollContainerRef}
      className="w-full h-full overflow-y-auto bg-[#faf8f5] wall-texture"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {/* Container en colonnes CSS pour masonry naturel */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-12 md:py-16 pb-24">
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
          {photoFrameData.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: index * 0.05,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="break-inside-avoid cursor-pointer"
              style={{
                marginBottom: `${getMargin(index)}px`,
              }}
              onClick={() => onPhotoClick(index)}
            >
              <PhotoFrame photo={photo} index={index} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MosaicWallView;
