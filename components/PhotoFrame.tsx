
import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Photo } from '../types';

interface PhotoFrameProps {
  photo: Photo;
  index: number;
}

const PhotoFrame: React.FC<PhotoFrameProps> = ({ photo, index: _index }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { rotation = 0, shape = 'rectangle', mount = 'none' } = photo;
  const [dimensions, setDimensions] = useState({ width: photo.width, height: photo.height });

  useEffect(() => {
    const updateDimensions = () => {
      const maxWidth = Math.min(photo.width, window.innerWidth - 80);
      const aspectRatio = photo.height / photo.width;
      setDimensions({
        width: maxWidth,
        height: maxWidth * aspectRatio
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [photo.width, photo.height]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
    restDelta: 0.001
  });

  const yParallax = useTransform(smoothProgress, [0, 1], ["-10%", "10%"]);
  const opacity = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  // Styles spécifiques aux formes
  const getContainerStyles = () => {
    switch(shape) {
      case 'circle': return 'rounded-full aspect-square p-2';
      case 'polaroid': return 'rounded-sm pb-12 pt-4 px-4 shadow-xl';
      default: return 'rounded-sm p-2 md:p-4';
    }
  };

  const getImageStyles = () => {
    switch(shape) {
      case 'circle': return 'rounded-full aspect-square';
      default: return 'rounded-[1px]';
    }
  };

  return (
    <motion.div
      ref={containerRef}
      style={{
        rotate: rotation,
        opacity: opacity,
      }}
      className="inline-block relative perspective-1000 group max-w-full photo-spotlight"
    >
      {/* Éléments de montage physiques */}
      {mount === 'tape' && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-24 h-8 bg-white/30 backdrop-blur-[2px] border border-white/10 z-20 -rotate-2 opacity-60 pointer-events-none"
             style={{ boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)' }} />
      )}

      {mount === 'corners' && (
        <>
          <div className="absolute -top-1 -left-1 w-4 md:w-6 h-4 md:h-6 border-t-2 border-l-2 border-[#b58b4c]/40 z-20 pointer-events-none" />
          <div className="absolute -top-1 -right-1 w-4 md:w-6 h-4 md:h-6 border-t-2 border-r-2 border-[#b58b4c]/40 z-20 pointer-events-none" />
          <div className="absolute -bottom-1 -left-1 w-4 md:w-6 h-4 md:h-6 border-b-2 border-l-2 border-[#b58b4c]/40 z-20 pointer-events-none" />
          <div className="absolute -bottom-1 -right-1 w-4 md:w-6 h-4 md:h-6 border-b-2 border-r-2 border-[#b58b4c]/40 z-20 pointer-events-none" />
        </>
      )}

      {mount === 'pin' && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-800/80 rounded-full z-20 shadow-md border border-white/20" />
      )}

      {/* Cadre principal */}
      <div className={`relative bg-white shadow-2xl transition-transform duration-700 group-hover:scale-[1.03] ${getContainerStyles()}`}
           style={{
             boxShadow: '0 15px 35px rgba(0,0,0,0.12)',
             backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper.png")'
           }}>

        <div className={`relative overflow-hidden bg-[#eee] border border-black/5 ${getImageStyles()}`}
             style={{ width: dimensions.width, height: dimensions.height }}>

          <motion.img
            style={{ y: yParallax }}
            src={photo.url}
            alt={photo.title}
            className="absolute inset-0 w-full h-[120%] object-cover grayscale group-hover:grayscale-0 transition-[filter] duration-1000 ease-out"
          />

          {/* Reflet papier */}
          <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay"
               style={{ backgroundImage: 'radial-gradient(circle at 30% 30%, white 0%, transparent 70%)' }} />
        </div>

        {/* Label handwritten sous la photo (style légende au stylo) */}
        <div className={`mt-2 md:mt-4 text-center ${shape === 'circle' ? 'hidden' : ''}`}>
          <span className="handwritten text-lg md:text-xl text-gray-700 block opacity-80">{photo.title}</span>
          {shape === 'polaroid' && (
            <span className="text-[7px] md:text-[8px] uppercase tracking-[0.2em] text-gray-400 mt-1 block">{photo.subtitle}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PhotoFrame;
