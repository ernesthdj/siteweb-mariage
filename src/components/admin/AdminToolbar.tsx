/**
 * AdminToolbar — Barre d'outils admin fixee en bas
 * fixed bottom-0, z-[300], w-full
 * bg-[#faf8f5]/95 backdrop-blur-md border-t border-black/5, h-12
 * Animation slide-up a l'entree (Framer Motion)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useAdmin } from './AdminContext';
import { useAuth } from '../../hooks/useAuth';

/** Segment de breadcrumb pour le contexte admin */
interface BreadcrumbSegment {
  label: string;
  onClick?: () => void;
}

interface AdminToolbarProps {
  /** Segments de contexte (breadcrumb simplifie) */
  contextSegments?: BreadcrumbSegment[];
}

const AdminToolbar: React.FC<AdminToolbarProps> = ({ contextSegments = [] }) => {
  const { isAdmin, isEditing, toggleEditing } = useAdmin();
  const { logout } = useAuth();

  if (!isAdmin) return null;

  return (
    <motion.div
      initial={{ y: 48, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 48, opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed bottom-0 left-0 right-0 z-[300] h-12 bg-[#faf8f5]/95 backdrop-blur-md border-t border-black/5 flex items-center justify-between px-4 md:px-8"
    >
      {/* Gauche : Icone + Mode Admin */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleEditing}
          className={`flex items-center gap-2 transition-colors duration-300 ${
            isEditing
              ? 'text-[#8b7355]'
              : 'text-zinc-400 hover:text-zinc-600'
          }`}
          aria-label={isEditing ? 'Desactiver le mode edition' : 'Activer le mode edition'}
        >
          <span className="text-base">&#9881;</span>
          <span className="text-[9px] uppercase tracking-[0.3em] font-medium hidden sm:inline">
            {isEditing ? 'Edition active' : 'Mode Admin'}
          </span>
        </button>

        {/* Separateur */}
        {contextSegments.length > 0 && (
          <div className="w-[1px] h-4 bg-zinc-200 hidden md:block" />
        )}

        {/* Contexte actuel (breadcrumb simplifie) */}
        <nav className="hidden md:flex items-center gap-1.5" aria-label="Contexte admin">
          {contextSegments.map((segment, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <span className="text-[8px] text-zinc-300 mx-0.5">&rsaquo;</span>
              )}
              {segment.onClick ? (
                <button
                  onClick={segment.onClick}
                  className="text-[9px] uppercase tracking-[0.3em] text-zinc-300 hover:text-zinc-600 transition-colors"
                >
                  {segment.label}
                </button>
              ) : (
                <span className="text-[9px] uppercase tracking-[0.3em] text-zinc-500">
                  {segment.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Droite : Deconnexion */}
      <button
        onClick={() => void logout()}
        className="text-[9px] uppercase tracking-[0.3em] text-zinc-400 hover:text-zinc-600 transition-colors duration-300"
      >
        Deconnexion
      </button>
    </motion.div>
  );
};

export default AdminToolbar;
