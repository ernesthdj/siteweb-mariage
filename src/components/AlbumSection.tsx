/**
 * AlbumSection — Affiche les albums d'une collection depuis Supabase
 * Recoit collectionId depuis les params de route
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
import { supabase } from '../lib/supabase';
import type { Item, CreateItemPayload, UpdateItemPayload } from '../types';

/** Carte visuelle d'un album — style galerie mur */
const AlbumCard: React.FC<{
  item: Item;
  index: number;
  onClick: () => void;
}> = ({ item, index, onClick }) => {
  const variations = [
    { rotate: -2, y: 0, aspect: 'aspect-[4/3]' },
    { rotate: 1.5, y: -10, aspect: 'aspect-[3/4]' },
    { rotate: -0.5, y: 5, aspect: 'aspect-[4/3]' },
    { rotate: 2, y: -15, aspect: 'aspect-[3/4]' },
    { rotate: -1.5, y: 8, aspect: 'aspect-[4/3]' },
    { rotate: 0.8, y: -5, aspect: 'aspect-[3/4]' },
  ];
  const variant = variations[index % variations.length];

  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
      style={{ rotate: variant.rotate }}
      whileHover={{
        y: -10,
        scale: 1.03,
        rotate: 0,
        transition: { duration: 0.4, ease: 'easeOut' },
      }}
      whileTap={{ scale: 0.97 }}
      className="cursor-pointer flex flex-col items-center w-full"
    >
      {item.url ? (
        <motion.img
          src={item.url}
          alt={item.label}
          className="w-full h-auto object-contain"
          style={{ filter: 'drop-shadow(4px 6px 12px rgba(0,0,0,0.15))' }}
        />
      ) : (
        <div className="w-full aspect-[4/3] bg-zinc-100 flex items-center justify-center rounded-sm">
          <span className="text-[9px] uppercase tracking-[0.3em] text-zinc-300">Pas d'image</span>
        </div>
      )}

      <div className="mt-2 sm:mt-3 text-center">
        {item.subtitle && (
          <p className="text-[7px] sm:text-[8px] uppercase tracking-[0.3em] text-zinc-400 mb-1">
            {item.subtitle}
          </p>
        )}
        <h3 className="handwritten text-lg sm:text-xl md:text-2xl text-black/80">
          {item.label}
        </h3>
      </div>
    </motion.div>
  );
};

const AlbumSection: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { collectionId } = useParams<{ collectionId: string }>();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const { items, loading, error, fetchItems, createItem, updateItem, deleteItem } = useItems();
  const { isAdmin, isEditing } = useAdmin();

  // Parent collection pour le breadcrumb
  const [parentCollection, setParentCollection] = useState<Item | null>(null);

  // Etat du formulaire
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | undefined>(undefined);

  // Charger les albums de cette collection
  useEffect(() => {
    if (collectionId) {
      void fetchItems(collectionId);
    }
  }, [collectionId, fetchItems]);

  // Charger le nom de la collection parente
  useEffect(() => {
    if (!collectionId) return;

    const loadParent = async () => {
      const { data } = await supabase
        .from('items')
        .select('id, label')
        .eq('id', collectionId)
        .single();
      if (data) {
        setParentCollection(data as Item);
      }
    };
    void loadParent();
  }, [collectionId]);

  const handleAlbumClick = useCallback(
    (item: Item) => {
      const basePath = isAdminRoute ? '/admin/portfolio' : '/portfolio';
      navigate(`${basePath}/${collectionId}/${item.id}`);
    },
    [navigate, collectionId, isAdminRoute]
  );

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
      label: parentCollection?.label ?? 'Albums',
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
            Chargement des albums...
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
            onClick={() => collectionId && void fetchItems(collectionId)}
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
      className="fixed inset-0 z-[140] bg-[#faf8f5] wall-texture overflow-y-auto"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <Breadcrumb segments={breadcrumbSegments} />



      {/* Header */}
      <div className="pt-32 md:pt-40 px-4 sm:px-6 md:px-[10vw] mb-8 md:mb-12 relative z-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-3xl sm:text-5xl md:text-7xl serif italic mb-2">
            {parentCollection?.label ?? 'Albums'}
          </h2>
          <div className="w-12 sm:w-16 h-[1px] bg-black/10 mb-4" />
          <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.3em] sm:tracking-[0.4em] text-zinc-400">
            {items.length} album{items.length !== 1 ? 's' : ''}
          </p>
        </motion.div>
      </div>

      {/* Grille d'albums */}
      <div className="px-4 sm:px-6 md:px-[10vw] pb-24 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
          {items.map((item, idx) => {
            const card = (
              <AlbumCard
                key={item.id}
                item={item}
                index={idx}
                onClick={() => handleAlbumClick(item)}
              />
            );

            if (isAdmin && isEditing) {
              return (
                <ItemControls
                  key={item.id}
                  item={item}
                  onEdit={handleEdit}
                  onDelete={(i) => void handleDelete(i)}
                  onToggleVisible={(i) => void handleToggleVisible(i)}
                >
                  {card}
                </ItemControls>
              );
            }

            return card;
          })}

          {/* Bouton Ajouter */}
          {isAdmin && isEditing && (
            <AddItemButton
              onClick={handleAdd}
              variant="album"
              label="Ajouter un album"
            />
          )}
        </div>

        {/* Etat vide */}
        {items.length === 0 && !loading && (
          <div className="text-center py-20">
            <p className="text-[9px] uppercase tracking-[0.4em] text-zinc-300">
              Aucun album dans cette collection
            </p>
          </div>
        )}
      </div>

      {/* ItemForm drawer */}
      <AnimatePresence>
        {formOpen && (
          <ItemForm
            mode={editingItem ? 'edit' : 'create'}
            item={editingItem}
            parentId={collectionId ?? null}
            itemType="album"
            onClose={handleCloseForm}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AlbumSection;
