/**
 * AddItemButton — Bouton + en fin de liste d'items
 * Memes dimensions qu'un item standard (ThemeCanvas pour collections, etc.)
 * border-2 border-dashed, bg transparent -> hover bg-[#8b7355]/5
 * Ne s'affiche QUE en mode admin
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useAdmin } from './AdminContext';

interface AddItemButtonProps {
  /** Callback au clic */
  onClick: () => void;
  /** Variante de taille selon le contexte */
  variant?: 'collection' | 'album' | 'photo';
  /** Label affiche sous l'icone */
  label?: string;
}

const AddItemButton: React.FC<AddItemButtonProps> = ({
  onClick,
  variant = 'collection',
  label = 'Ajouter',
}) => {
  const { isAdmin, isEditing } = useAdmin();

  if (!isAdmin || !isEditing) return null;

  // Classes de dimension selon le contexte
  const sizeClasses: Record<string, string> = {
    collection:
      'w-[160px] sm:w-[200px] md:w-[240px] lg:w-[280px] aspect-[3/4]',
    album: 'w-full aspect-[4/3]',
    photo: 'w-full aspect-[3/4]',
  };

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${sizeClasses[variant]} flex-shrink-0 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-zinc-200 hover:border-[#8b7355]/40 bg-transparent hover:bg-[#8b7355]/5 transition-all duration-300 cursor-pointer rounded-sm mx-3 sm:mx-6 md:mx-12 lg:mx-20`}
      aria-label={label}
    >
      {/* Icone + */}
      <span className="text-2xl text-zinc-300 group-hover:text-[#8b7355]/60 transition-colors">
        &#43;
      </span>
      {/* Label */}
      <span className="text-[9px] uppercase tracking-[0.3em] text-zinc-300">
        {label}
      </span>
    </motion.button>
  );
};

export default AddItemButton;
