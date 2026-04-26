/**
 * CloudinaryBrowser — Modal d'exploration Cloudinary
 * fixed center, max-w-3xl, max-h-[80vh], z-[400]
 * Navigation dossiers + grille d'images
 * Utilise le hook useCloudinary (Agent #4)
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCloudinary } from '../../hooks/useCloudinary';
import type { CloudinaryFolder, CloudinaryImage } from '../../types';

interface CloudinaryBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

const CloudinaryBrowser: React.FC<CloudinaryBrowserProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const { folders, images, loading, error, currentFolder, browseFolders, goBack } =
    useCloudinary();

  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  // Charger le dossier racine a l'ouverture
  useEffect(() => {
    if (isOpen) {
      void browseFolders('');
    }
  }, [isOpen, browseFolders]);

  // Fermer avec Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const navigateToFolder = useCallback(
    (folder: CloudinaryFolder) => {
      setSelectedUrl(null);
      void browseFolders(folder.path);
    },
    [browseFolders]
  );

  const handleGoBack = useCallback(() => {
    setSelectedUrl(null);
    goBack();
  }, [goBack]);

  const handleSelect = useCallback(() => {
    if (selectedUrl) {
      onSelect(selectedUrl);
    }
  }, [selectedUrl, onSelect]);

  const handleImageClick = useCallback((image: CloudinaryImage) => {
    setSelectedUrl((prev) =>
      prev === image.url ? null : image.url
    );
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Overlay */}
      <motion.div
        key="cloudinary-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[400] bg-black/30 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <motion.div
          key="cloudinary-modal"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          className="bg-white w-full max-w-3xl max-h-[80vh] rounded-sm shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              {currentFolder !== '' && (
                <button
                  onClick={handleGoBack}
                  className="text-zinc-400 hover:text-zinc-600 transition-colors text-sm"
                  aria-label="Retour"
                >
                  &larr;
                </button>
              )}
              <h3 className="serif italic text-lg text-[#1a1a1a]">
                Cloudinary
              </h3>
              {currentFolder && (
                <span className="text-[8px] uppercase tracking-[0.2em] text-zinc-300 mt-0.5">
                  / {currentFolder}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-zinc-300 hover:text-zinc-600 transition-colors text-xl leading-none"
              aria-label="Fermer"
            >
              &times;
            </button>
          </div>

          {/* Contenu scrollable */}
          <div
            className="flex-1 overflow-y-auto px-5 py-4"
            style={{ scrollbarWidth: 'none' }}
          >
            {/* Erreur */}
            {error && (
              <div className="text-center py-8">
                <p className="text-[10px] text-red-400 tracking-wide">
                  {error}
                </p>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="text-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-6 h-6 border-2 border-zinc-200 border-t-[#8b7355] rounded-full mx-auto"
                />
                <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-400 mt-3">
                  Chargement...
                </p>
              </div>
            )}

            {!loading && !error && (
              <>
                {/* Dossiers */}
                {folders.length > 0 && (
                  <div className="mb-6">
                    <p className="text-[8px] uppercase tracking-[0.3em] text-zinc-400 mb-3">
                      Dossiers
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {folders.map((folder) => (
                        <button
                          key={folder.path}
                          onClick={() => navigateToFolder(folder)}
                          className="flex items-center gap-2 px-3 py-2.5 border border-zinc-100 rounded-sm text-left hover:border-[#8b7355]/40 hover:bg-[#8b7355]/5 transition-all duration-200 group"
                        >
                          <span className="text-base opacity-50 group-hover:opacity-80">
                            &#128193;
                          </span>
                          <span className="text-xs text-zinc-600 font-light truncate">
                            {folder.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grille d'images */}
                {images.length > 0 && (
                  <div>
                    <p className="text-[8px] uppercase tracking-[0.3em] text-zinc-400 mb-3">
                      Images ({images.length})
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {images.map((image) => {
                        const isSelected = selectedUrl === image.url;
                        return (
                          <button
                            key={image.public_id}
                            onClick={() => handleImageClick(image)}
                            className={`relative aspect-square overflow-hidden rounded-sm transition-all duration-200 group ${
                              isSelected
                                ? 'ring-2 ring-[#8b7355] scale-[1.02]'
                                : 'hover:ring-2 hover:ring-[#8b7355] hover:scale-[1.02]'
                            }`}
                          >
                            <img
                              src={image.thumbnail}
                              alt={image.public_id}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            {/* Check overlay si selectionne */}
                            {isSelected && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 bg-[#8b7355]/20 flex items-center justify-center"
                              >
                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                                  <span className="text-[#8b7355] text-sm">
                                    &#10003;
                                  </span>
                                </div>
                              </motion.div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Etat vide */}
                {folders.length === 0 && images.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-300">
                      Ce dossier est vide
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer avec bouton Selection */}
          <div className="flex-shrink-0 px-5 py-4 border-t border-zinc-100 flex items-center justify-between">
            <button
              onClick={onClose}
              className="text-[9px] uppercase tracking-[0.3em] text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSelect}
              disabled={!selectedUrl}
              className="px-6 py-2.5 bg-[#1a1a1a] text-white text-[9px] uppercase tracking-[0.3em] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#2a2a2a]"
            >
              Selectionner
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CloudinaryBrowser;
