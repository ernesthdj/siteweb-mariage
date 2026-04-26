/**
 * PhotoSection — Affiche les photos d'un album depuis Supabase
 * Toggle entre CarouselView (pattern MockGalleryView) et MosaicView (MosaicWallView)
 * En mode admin : ItemControls + AddItemButton + ItemForm
 */

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useItems } from '../hooks/useItems';
import { useAdmin } from './admin/AdminContext';
import ItemControls from './admin/ItemControls';
import AddItemButton from './admin/AddItemButton';
import ItemForm from './admin/ItemForm';
import Breadcrumb from './gallery/Breadcrumb';
import ViewToggle from './gallery/ViewToggle';
import MosaicWallView from './gallery/MosaicWallView';
import { supabase } from '../lib/supabase';
import type { Item, CreateItemPayload, UpdateItemPayload } from '../types';

type ViewMode = 'carousel' | 'mosaic';

// ============================================================================
// CAROUSEL VIEW — Reprend le pattern de MockGalleryView
// ============================================================================

const CarouselView: React.FC<{
  photos: Item[];
  title: string;
  startIndex: number;
  onClose: () => void;
  isAdmin: boolean;
  isEditing: boolean;
  onEditPhoto: (item: Item) => void;
  onDeletePhoto: (item: Item) => void;
  onToggleVisiblePhoto: (item: Item) => void;
}> = ({
  photos,
  title,
  startIndex,
  onClose,
  isAdmin,
  isEditing,
  onEditPhoto,
  onDeletePhoto,
  onToggleVisiblePhoto,
}) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDimmed, setIsDimmed] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const dimTimer = setTimeout(() => setIsDimmed(true), 300);
    return () => {
      document.body.style.overflow = 'auto';
      clearTimeout(dimTimer);
    };
  }, []);

  const goToPhoto = useCallback(
    (newIndex: number) => {
      if (isAnimating || newIndex < 0 || newIndex >= photos.length) return;
      setIsAnimating(true);
      setCurrentIndex(newIndex);
      setTimeout(() => setIsAnimating(false), 800);
    },
    [isAnimating, photos.length]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goToPhoto(currentIndex + 1);
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goToPhoto(currentIndex - 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, currentIndex, goToPhoto]);

  useEffect(() => {
    let wheelAccumulator = 0;
    const WHEEL_THRESHOLD = 50;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isAnimating) return;
      wheelAccumulator += e.deltaY;
      if (wheelAccumulator > WHEEL_THRESHOLD) {
        goToPhoto(currentIndex + 1);
        wheelAccumulator = 0;
      } else if (wheelAccumulator < -WHEEL_THRESHOLD) {
        goToPhoto(currentIndex - 1);
        wheelAccumulator = 0;
      }
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [currentIndex, isAnimating, goToPhoto]);

  const currentPhoto = photos[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[150]"
    >
      {/* Fond */}
      <motion.div
        className="absolute inset-0 wall-texture"
        initial={{ backgroundColor: '#faf8f5' }}
        animate={{ backgroundColor: isDimmed ? '#e8e0d4' : '#faf8f5' }}
        transition={{ duration: 1.8, ease: [0.25, 0.1, 0.25, 1] }}
      />

      {/* Header */}
      <motion.div
        className="absolute top-0 left-0 w-full h-16 md:h-20 flex items-center justify-between px-4 md:px-12 z-[160] backdrop-blur-sm"
        initial={{ backgroundColor: 'rgba(250, 248, 245, 0.8)' }}
        animate={{ backgroundColor: isDimmed ? 'rgba(232, 224, 212, 0.85)' : 'rgba(250, 248, 245, 0.8)' }}
        transition={{ duration: 1.8, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <button
          onClick={onClose}
          className="group flex items-center gap-2 md:gap-4 text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] text-zinc-400 hover:text-black transition-colors"
        >
          <div className="w-6 md:w-8 h-[1px] bg-zinc-300 group-hover:w-10 group-hover:bg-black transition-all" />
          <span>Retour</span>
        </button>
        <div className="text-center">
          <h2 className="serif italic text-base md:text-xl text-[#8b7355]">{title}</h2>
        </div>
        <div className="w-20" />
      </motion.div>

      {/* Photo courante */}
      <div className="relative h-full w-full overflow-hidden">
        <AnimatePresence mode="wait">
          {currentPhoto && (
            <motion.div
              key={currentPhoto.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute inset-0 flex items-center justify-center p-3 sm:p-4 md:p-8 pt-20 md:pt-24"
            >
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-12 lg:gap-16 max-w-full h-full w-full">
                {/* Wrapper pour admin controls sur la photo */}
                {isAdmin && isEditing ? (
                  <ItemControls
                    item={currentPhoto}
                    onEdit={onEditPhoto}
                    onDelete={onDeletePhoto}
                    onToggleVisible={onToggleVisiblePhoto}
                  >
                    <motion.img
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1, duration: 0.5, ease: 'easeOut' }}
                      src={currentPhoto.url ?? ''}
                      alt={currentPhoto.label}
                      className="w-auto h-auto object-contain flex-shrink-0
                        max-h-[45vh] sm:max-h-[50vh] md:max-h-[75vh] lg:max-h-[80vh]
                        max-w-[90vw] md:max-w-[55vw] lg:max-w-[50vw]"
                    />
                  </ItemControls>
                ) : (
                  <motion.img
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.5, ease: 'easeOut' }}
                    src={currentPhoto.url ?? ''}
                    alt={currentPhoto.label}
                    className="w-auto h-auto object-contain flex-shrink-0
                      max-h-[45vh] sm:max-h-[50vh] md:max-h-[75vh] lg:max-h-[80vh]
                      max-w-[90vw] md:max-w-[55vw] lg:max-w-[50vw]"
                  />
                )}

                {/* Description */}
                <div className="flex-shrink-0 w-full md:w-[280px] lg:w-[350px] xl:w-[400px] max-w-[90vw] md:max-w-none flex items-center md:h-full px-2 sm:px-0">
                  {currentPhoto.description && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                      className="w-full"
                    >
                      <div className="pl-4 md:pl-6 border-l-2 border-[#8b7355]/30">
                        <p className="text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[#8b7355]/60 mb-2 sm:mb-3 md:mb-4">
                          {currentPhoto.label}
                        </p>
                        <span className="handwritten text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-[#8b7355] leading-relaxed">
                          {currentPhoto.description}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Indicateur dots */}
        <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 z-[105]">
          {photos.map((_, index) => (
            <button
              key={index}
              onClick={() => goToPhoto(index)}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-[#8b7355] w-4 sm:w-6'
                  : 'bg-[#8b7355]/30 hover:bg-[#8b7355]/50 w-1.5 sm:w-2'
              }`}
            />
          ))}
        </div>

        {/* Fleches de navigation */}
        {currentIndex > 0 && (
          <button
            onClick={() => goToPhoto(currentIndex - 1)}
            className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-[105] p-2 sm:p-3 text-[#8b7355]/40 hover:text-[#8b7355] transition-colors"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}
        {currentIndex < photos.length - 1 && (
          <button
            onClick={() => goToPhoto(currentIndex + 1)}
            className="absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-[105] p-2 sm:p-3 text-[#8b7355]/40 hover:text-[#8b7355] transition-colors"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )}
      </div>

      {/* Instruction */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 text-zinc-400 text-[8px] sm:text-[9px] uppercase tracking-widest z-[105]">
        <span className="hidden md:inline">Molette pour naviguer</span>
        <span className="md:hidden">Swipez pour naviguer</span>
      </div>

      {/* Vignettage */}
      <motion.div
        className="fixed inset-0 z-[119] pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: isDimmed ? 1 : 0 }}
        transition={{ duration: 2, ease: 'easeOut' }}
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.12) 100%)',
        }}
      />

      {/* Ombre portee */}
      <div
        className="fixed inset-0 z-[120] pointer-events-none"
        style={{
          backgroundImage:
            'url(https://res.cloudinary.com/dzoshz4ut/image/upload/v1769988211/Ombre_2_dtue5d.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
    </motion.div>
  );
};

// ============================================================================
// PHOTO SECTION — Composant principal
// ============================================================================

const PhotoSection: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { collectionId, albumId } = useParams<{ collectionId: string; albumId: string }>();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const { items, loading, error, fetchItems, createItem, updateItem, deleteItem } = useItems();
  const { isAdmin, isEditing } = useAdmin();

  const [viewMode, setViewMode] = useState<ViewMode>('mosaic');
  const [carouselStartIndex, setCarouselStartIndex] = useState(0);
  const [showCarousel, setShowCarousel] = useState(false);

  // Parents pour le breadcrumb
  const [parentCollection, setParentCollection] = useState<{ id: string; label: string } | null>(null);
  const [parentAlbum, setParentAlbum] = useState<{ id: string; label: string } | null>(null);

  // Etat du formulaire
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | undefined>(undefined);

  // Charger les photos de cet album
  useEffect(() => {
    if (albumId) {
      void fetchItems(albumId);
    }
  }, [albumId, fetchItems]);

  // Charger les noms des parents pour le breadcrumb
  useEffect(() => {
    if (!collectionId || !albumId) return;

    const loadParents = async () => {
      const [collRes, albRes] = await Promise.all([
        supabase.from('items').select('id, label').eq('id', collectionId).single(),
        supabase.from('items').select('id, label').eq('id', albumId).single(),
      ]);
      if (collRes.data) setParentCollection(collRes.data as { id: string; label: string });
      if (albRes.data) setParentAlbum(albRes.data as { id: string; label: string });
    };
    void loadParents();
  }, [collectionId, albumId]);

  const handlePhotoClick = useCallback((index: number) => {
    setCarouselStartIndex(index);
    setShowCarousel(true);
  }, []);

  const handleEdit = useCallback((item: Item) => {
    setEditingItem(item);
    setFormOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (item: Item) => {
      await deleteItem(item.id);
    },
    [deleteItem]
  );

  const handleToggleVisible = useCallback(
    async (item: Item) => {
      await updateItem(item.id, { visible: !item.visible });
    },
    [updateItem]
  );

  const handleAdd = useCallback(() => {
    setEditingItem(undefined);
    setFormOpen(true);
  }, []);

  const handleSave = useCallback(
    async (data: CreateItemPayload | UpdateItemPayload) => {
      if (editingItem) {
        await updateItem(editingItem.id, data as UpdateItemPayload);
      } else {
        await createItem(data as CreateItemPayload);
      }
      setFormOpen(false);
      setEditingItem(undefined);
    },
    [editingItem, createItem, updateItem]
  );

  const handleCloseForm = useCallback(() => {
    setFormOpen(false);
    setEditingItem(undefined);
  }, []);

  // Breadcrumb
  const basePath = isAdminRoute ? '/admin/portfolio' : '/portfolio';
  const breadcrumbSegments = [
    {
      label: 'Collections',
      onClick: () => navigate(basePath),
    },
    {
      label: parentCollection?.label ?? '...',
      onClick: () => navigate(`${basePath}/${collectionId}`),
    },
    {
      label: parentAlbum?.label ?? 'Photos',
    },
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 z-[140] bg-[#faf8f5] wall-texture flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            className="w-6 h-6 border border-zinc-200 border-t-[#8b7355] rounded-full mx-auto mb-4"
          />
          <span className="text-[9px] uppercase tracking-[0.4em] text-zinc-400">
            Chargement des photos...
          </span>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-[140] bg-[#faf8f5] wall-texture flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-[10px] text-red-400 tracking-wide mb-4">{error}</p>
          <button
            onClick={() => albumId && void fetchItems(albumId)}
            className="text-[9px] uppercase tracking-[0.3em] text-zinc-400 hover:text-zinc-600 transition-colors border-b border-zinc-200 pb-1"
          >
            Reessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[140] bg-[#faf8f5] wall-texture"
    >
      <Breadcrumb segments={breadcrumbSegments} />

      {/* Bouton retour */}
      <div className="fixed top-[72px] md:top-[88px] left-4 md:left-8 z-[191]">
        <button
          onClick={() => navigate(`${basePath}/${collectionId}`)}
          className="group flex items-center gap-2 md:gap-4 text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] text-zinc-400 hover:text-black transition-colors"
        >
          <div className="w-6 md:w-8 h-[1px] bg-zinc-300 group-hover:w-10 group-hover:bg-black transition-all" />
          <span>Retour</span>
        </button>
      </div>

      {/* Toggle vue + Bouton ajouter (admin) */}
      <div className="fixed top-[72px] md:top-[88px] right-4 md:right-8 z-[191] flex items-center gap-3">
        <ViewToggle mode={viewMode} onChange={setViewMode} />
        {isAdmin && isEditing && (
          <button
            onClick={handleAdd}
            className="w-8 h-8 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-full border border-black/[0.03] text-zinc-400 hover:text-[#8b7355] transition-colors"
            aria-label="Ajouter une photo"
            title="Ajouter une photo"
          >
            <span className="text-lg leading-none">&#43;</span>
          </button>
        )}
      </div>

      {/* Ombre portee */}
      <div
        className="fixed inset-0 z-[10] pointer-events-none"
        style={{
          backgroundImage:
            'url(https://res.cloudinary.com/dzoshz4ut/image/upload/v1769988211/Ombre_2_dtue5d.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Contenu principal */}
      <div className="relative z-20 h-full pt-28 md:pt-36">
        {viewMode === 'mosaic' ? (
          <MosaicWallView photos={items} onPhotoClick={handlePhotoClick} />
        ) : (
          /* Mode carousel directement */
          items.length > 0 && (
            <div className="h-full flex items-center justify-center">
              <p className="text-[9px] uppercase tracking-[0.4em] text-zinc-400">
                Cliquez sur une photo en mosaique pour ouvrir le carousel
              </p>
            </div>
          )
        )}

        {/* Etat vide */}
        {items.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center gap-4">
            <p className="text-[9px] uppercase tracking-[0.4em] text-zinc-300">
              Aucune photo dans cet album
            </p>
            {isAdmin && isEditing && (
              <AddItemButton
                onClick={handleAdd}
                variant="photo"
                label="Ajouter une photo"
              />
            )}
          </div>
        )}
      </div>

      {/* Carousel overlay */}
      <AnimatePresence>
        {showCarousel && items.length > 0 && (
          <CarouselView
            photos={items}
            title={parentAlbum?.label ?? 'Photos'}
            startIndex={carouselStartIndex}
            onClose={() => setShowCarousel(false)}
            isAdmin={isAdmin}
            isEditing={isEditing}
            onEditPhoto={handleEdit}
            onDeletePhoto={(i) => void handleDelete(i)}
            onToggleVisiblePhoto={(i) => void handleToggleVisible(i)}
          />
        )}
      </AnimatePresence>

      {/* ItemForm drawer */}
      <AnimatePresence>
        {formOpen && (
          <ItemForm
            mode={editingItem ? 'edit' : 'create'}
            item={editingItem}
            parentId={albumId ?? null}
            itemType="photo"
            onClose={handleCloseForm}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PhotoSection;
