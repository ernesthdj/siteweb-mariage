/**
 * ViewToggle — Toggle carousel <-> mosaique
 * Deux icones : grille et cadre unique
 * Actif : text-[#8b7355], Inactif : text-zinc-300
 * w-8 h-8 par bouton, transition 200ms
 */

import React from 'react';
import { motion } from 'framer-motion';

type ViewMode = 'carousel' | 'mosaic';

interface ViewToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ mode, onChange }) => {
  return (
    <div className="flex items-center gap-1 bg-white/60 backdrop-blur-sm rounded-full px-1.5 py-1 border border-black/[0.03]">
      {/* Bouton Carousel (cadre unique) */}
      <button
        onClick={() => onChange('carousel')}
        className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 ${
          mode === 'carousel'
            ? 'text-[#8b7355] bg-[#8b7355]/10'
            : 'text-zinc-300 hover:text-zinc-500'
        }`}
        aria-label="Vue carousel"
        title="Vue carousel"
      >
        {/* Icone cadre unique */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        >
          <rect x="2" y="2" width="10" height="10" rx="1" />
        </svg>
      </button>

      {/* Bouton Mosaique (grille) */}
      <button
        onClick={() => onChange('mosaic')}
        className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 ${
          mode === 'mosaic'
            ? 'text-[#8b7355] bg-[#8b7355]/10'
            : 'text-zinc-300 hover:text-zinc-500'
        }`}
        aria-label="Vue mosaique"
        title="Vue mosaique"
      >
        {/* Icone grille */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        >
          <rect x="1" y="1" width="5" height="5" rx="0.5" />
          <rect x="8" y="1" width="5" height="5" rx="0.5" />
          <rect x="1" y="8" width="5" height="5" rx="0.5" />
          <rect x="8" y="8" width="5" height="5" rx="0.5" />
        </svg>
      </button>

      {/* Indicateur anime */}
      <motion.div
        layoutId="view-toggle-indicator"
        className="absolute w-8 h-8 bg-[#8b7355]/5 rounded-full pointer-events-none"
        style={{ display: 'none' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />
    </div>
  );
};

export default ViewToggle;
