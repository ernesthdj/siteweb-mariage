/**
 * MosaicWallView — Vue mosaique "mur d'exposition" pour les photos
 * Affiche les images brutes (mockups PNG avec cadre intégré)
 * Pas de cadre ni mount ajouté — juste un drop-shadow léger
 * Layout CSS columns (2 cols mobile, 3 tablette, 4 desktop)
 * Rotations légères, espacement irrégulier, fond wall-texture
 */

import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Item } from '../../types';

interface MosaicWallViewProps {
  photos: Item[];
  onPhotoClick: (index: number) => void;
}

/** Rotation légère deterministe */
const getRotation = (index: number): number => {
  const rotations = [-2, 1.5, -1, 2.5, -0.5, 1.8, -2.5, 0.8, -1.5, 2];
  return rotations[index % rotations.length];
};

/** Margin irrégulier deterministe */
const getMargin = (index: number): number => {
  const margins = [12, 20, 16, 24, 14, 22, 18, 10, 20, 16];
  return margins[index % margins.length];
};

const MosaicWallView: React.FC<MosaicWallViewProps> = ({
  photos,
  onPhotoClick,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

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
      <div className="px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-12 md:py-16 pb-24">
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
          {photos.map((photo, index) => (
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
                rotate: `${getRotation(index)}deg`,
              }}
              onClick={() => onPhotoClick(index)}
            >
              <motion.img
                src={photo.url ?? ''}
                alt={photo.label}
                className="w-full h-auto object-contain"
                style={{
                  filter: 'drop-shadow(4px 6px 12px rgba(0,0,0,0.15))',
                }}
                whileHover={{
                  scale: 1.03,
                  transition: { duration: 0.3 },
                }}
              />
              <p className="handwritten text-center text-lg sm:text-xl text-black/70 mt-2">
                {photo.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MosaicWallView;
