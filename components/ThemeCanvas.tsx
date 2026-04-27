
import React from 'react';
import { motion } from 'framer-motion';
import { ExhibitionTheme } from '../types';

interface ThemeCanvasProps {
  theme: ExhibitionTheme;
  onClick: () => void;
  index: number;
}

const ThemeCanvas: React.FC<ThemeCanvasProps> = ({ theme, onClick, index }) => {
  // Variations plus marquées pour un look "accrochage artisanal"
  // Réduites sur mobile pour éviter les problèmes de layout
  const variations = [
    { rotate: -3, y: -60, scale: 0.85, mobileScale: 0.9, aspect: 'aspect-[3/4]' },
    { rotate: 2.5, y: 40, scale: 0.95, mobileScale: 0.95, aspect: 'aspect-[4/5]' },
    { rotate: -1, y: -15, scale: 0.8, mobileScale: 0.85, aspect: 'aspect-[2/3]' },
    { rotate: 4, y: 70, scale: 0.9, mobileScale: 0.9, aspect: 'aspect-[3/4]' },
    { rotate: -4.5, y: -80, scale: 1.0, mobileScale: 0.95, aspect: 'aspect-[4/5]' },
    { rotate: 1.5, y: 25, scale: 0.82, mobileScale: 0.88, aspect: 'aspect-[3/4]' },
    { rotate: -3.8, y: -35, scale: 0.92, mobileScale: 0.9, aspect: 'aspect-[2/3]' },
    { rotate: 2.5, y: 60, scale: 0.78, mobileScale: 0.85, aspect: 'aspect-[3/4]' },
  ];

  const variant = variations[index % variations.length];

  const styles = {
    wedding: "shadow-[20px_20px_60px_rgba(0,0,0,0.1)] border-[10px] border-white",
    culinary: "shadow-[10px_10px_40px_rgba(0,0,0,0.06)] border-[1px] border-black/10",
    urban: "shadow-2xl border-[12px] border-zinc-900",
    birth: "rounded-[40px] shadow-lg border-[6px] border-white/80",
    nature: "shadow-2xl border-[8px] border-[#1e272e]",
    fashion: "shadow-[20px_20px_0px_rgba(0,0,0,0.02)] border-[1.5px] border-black",
    architecture: "shadow-none border-[1px] border-zinc-300",
    portrait: "shadow-2xl border-[15px] border-white outline outline-1 outline-black/5",
    showcase: "",
  };

  // Rendu spécial pour l'album showcase
  if (theme.type === 'showcase') {
    return (
      <motion.div
        layoutId={`canvas-${theme.id}`}
        onClick={onClick}
        style={{
          rotate: -2,
          y: -20,
          scale: 0.95
        }}
        whileHover={{
          y: -40,
          scale: 1.02,
          rotate: 0,
          transition: { duration: 0.5, ease: "easeOut" }
        }}
        whileTap={{ scale: 0.98 }}
        className="relative cursor-pointer flex-shrink-0 mx-4 sm:mx-8 md:mx-12 lg:mx-20 flex flex-col items-center canvas-spotlight"
      >
        {/* Photo PNG responsive */}
        <motion.img
          layoutId={`img-${theme.id}`}
          src={theme.coverUrl}
          alt={theme.title}
          className="h-auto object-contain transition-transform duration-500
            w-[200px] sm:w-[280px] md:w-[400px] lg:w-[500px] xl:w-[550px]"
          style={{
            filter: 'drop-shadow(8px 12px 25px rgba(0,0,0,0.2))',
          }}
        />

        {/* Titre manuscrit */}
        <div className="mt-2 sm:mt-4 text-center">
          <h3 className="handwritten text-lg sm:text-xl md:text-2xl lg:text-3xl text-black/90">
            {theme.title}
          </h3>
        </div>
      </motion.div>
    );
  }

  // Rendu standard pour les autres albums - RESPONSIVE
  return (
    <motion.div
      layoutId={`canvas-${theme.id}`}
      onClick={onClick}
      style={{
        rotate: variant.rotate * 0.5, // Rotation réduite sur mobile
        y: variant.y * 0.5,
        scale: variant.scale
      }}
      whileHover={{
        y: variant.y - 20,
        scale: variant.scale * 1.08,
        rotate: 0,
        transition: { duration: 0.6, ease: "easeOut" }
      }}
      whileTap={{ scale: variant.scale * 0.95 }}
      className={`relative cursor-pointer flex-shrink-0
        w-[160px] sm:w-[200px] md:w-[240px] lg:w-[280px]
        bg-white
        mx-3 sm:mx-6 md:mx-12 lg:mx-20
        overflow-hidden canvas-spotlight ${variant.aspect} ${styles[theme.type]}`}
    >
      <motion.img
        layoutId={`img-${theme.id}`}
        src={theme.coverUrl}
        alt={theme.title}
        className="absolute inset-0 w-full h-full object-cover grayscale-[0.4] hover:grayscale-0 transition-all duration-1000"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 pointer-events-none" />

      <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 left-3 sm:left-4 md:left-5 right-3 sm:right-4 md:right-5 text-white">
        <p className="text-[6px] sm:text-[7px] mb-0.5 sm:mb-1 uppercase tracking-[0.3em] sm:tracking-[0.4em] opacity-70 font-medium">
          {theme.subtitle}
        </p>
        <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl serif italic leading-none">
          {theme.title}
        </h3>
      </div>

      <div className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 mix-blend-difference">
        <span className="text-[6px] sm:text-[7px] text-white/40 uppercase tracking-[0.2em] sm:tracking-[0.3em]">Coll. {index + 1}</span>
      </div>
    </motion.div>
  );
};

export default ThemeCanvas;
