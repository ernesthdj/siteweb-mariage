/**
 * ItemControls — Overlay de controles sur chaque item en mode admin
 * Au hover : overlay bg-black/5 + boutons en bas-droite
 * Boutons : edit, delete, toggle visible (w-8 h-8 bg-white/90 rounded-full shadow-sm)
 * Drag handle a gauche (cursor-grab)
 * Items brouillon (visible=false) : opacity-50 + badge "Brouillon" ambre
 * Mobile : tap au lieu de hover
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from './AdminContext';
import type { Item } from '../../types';

interface ItemControlsProps {
  item: Item;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
  onToggleVisible: (item: Item) => void;
  children: React.ReactNode;
}

const ItemControls: React.FC<ItemControlsProps> = ({
  item,
  onEdit,
  onDelete,
  onToggleVisible,
  children,
}) => {
  const { isAdmin, isEditing } = useAdmin();
  const [isHovered, setIsHovered] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Nettoyer le timer au demontage
  useEffect(() => {
    return () => {
      if (confirmTimerRef.current) {
        clearTimeout(confirmTimerRef.current);
      }
    };
  }, []);

  const handleEdit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit(item);
    },
    [item, onEdit]
  );

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (confirmDelete) {
        // Deuxieme clic : confirmer la suppression
        setConfirmDelete(false);
        if (confirmTimerRef.current) {
          clearTimeout(confirmTimerRef.current);
          confirmTimerRef.current = null;
        }
        onDelete(item);
      } else {
        // Premier clic : activer le mode confirmation (3 secondes)
        setConfirmDelete(true);
        confirmTimerRef.current = setTimeout(() => {
          setConfirmDelete(false);
          confirmTimerRef.current = null;
        }, 3000);
      }
    },
    [item, onDelete, confirmDelete]
  );

  const handleToggleVisible = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleVisible(item);
    },
    [item, onToggleVisible]
  );

  // Si pas admin ou pas en mode edition, render juste les enfants
  if (!isAdmin || !isEditing) {
    return <>{children}</>;
  }

  const isDraft = !item.visible;
  const showControls = isHovered;

  return (
    <div
      className={`relative group ${isDraft ? 'opacity-50' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      // Mobile : tap toggle
      onTouchStart={() => setIsHovered((prev) => !prev)}
    >
      {children}

      {/* Badge Brouillon */}
      {isDraft && (
        <div className="absolute top-2 right-2 z-10">
          <span className="bg-amber-100 text-amber-700 text-[8px] uppercase tracking-[0.2em] px-2 py-1 rounded-sm font-medium">
            Brouillon
          </span>
        </div>
      )}

      {/* Overlay + Controles */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 z-20"
          >
            {/* Overlay semi-transparent */}
            <div className="absolute inset-0 bg-black/5 rounded-sm pointer-events-none" />

            {/* Drag handle a gauche */}
            <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-600 transition-colors select-none">
              <span className="text-sm leading-none tracking-tighter">&#8942;&#8942;</span>
            </div>

            {/* Boutons en bas-droite */}
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15, delay: 0.05 }}
              className="absolute bottom-2 right-2 flex items-center gap-1.5"
            >
              {/* Bouton Edit */}
              <button
                onClick={handleEdit}
                className="w-8 h-8 bg-white/90 rounded-full shadow-sm flex items-center justify-center text-zinc-500 hover:text-[#8b7355] hover:shadow-md transition-all duration-200"
                aria-label="Modifier"
                title="Modifier"
              >
                <span className="text-sm">&#9998;</span>
              </button>

              {/* Bouton Toggle Visible */}
              <button
                onClick={handleToggleVisible}
                className={`w-8 h-8 bg-white/90 rounded-full shadow-sm flex items-center justify-center transition-all duration-200 hover:shadow-md ${
                  isDraft
                    ? 'text-amber-500 hover:text-amber-600'
                    : 'text-zinc-500 hover:text-[#8b7355]'
                }`}
                aria-label={isDraft ? 'Publier' : 'Masquer'}
                title={isDraft ? 'Publier' : 'Masquer'}
              >
                <span className="text-sm">{isDraft ? '\u{1F441}' : '\u{1F441}'}</span>
              </button>

              {/* Bouton Delete avec confirmation inline */}
              {confirmDelete ? (
                <button
                  onClick={handleDeleteClick}
                  className="h-8 px-3 bg-red-500 rounded-full shadow-sm flex items-center justify-center text-white text-[9px] uppercase tracking-[0.15em] font-medium hover:bg-red-600 hover:shadow-md transition-all duration-200"
                  aria-label="Confirmer la suppression"
                  title="Confirmer la suppression"
                >
                  Confirmer ?
                </button>
              ) : (
                <button
                  onClick={handleDeleteClick}
                  className="w-8 h-8 bg-white/90 rounded-full shadow-sm flex items-center justify-center text-zinc-400 hover:text-red-500 hover:shadow-md transition-all duration-200"
                  aria-label="Supprimer"
                  title="Supprimer"
                >
                  <span className="text-sm">&#128465;</span>
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ItemControls;
