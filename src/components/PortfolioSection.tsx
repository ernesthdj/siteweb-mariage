/**
 * PortfolioSection — Affiche les collections depuis Supabase (items parent_id = null)
 * Remplace la section Portfolio hardcodee de GalleryWall
 * En mode admin : ItemControls + AddItemButton + ItemForm
 */

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useItems } from '../hooks/useItems';
import { useAdmin } from './admin/AdminContext';
import ItemControls from './admin/ItemControls';
import AddItemButton from './admin/AddItemButton';
import ItemForm from './admin/ItemForm';
import type { Item, CreateItemPayload, UpdateItemPayload } from '../types';

/** Carte visuelle d'une collection — reprend le style ThemeCanvas */
const CollectionCard: React.FC<{
  item: Item;
  index: number;
  onClick: () => void;
}> = ({ item, index, onClick }) => {
  const variations = [
    { rotate: -3, y: -60, scale: 0.85, aspect: 'aspect-[3/4]' },
    { rotate: 2.5, y: 40, scale: 0.95, aspect: 'aspect-[4/5]' },
    { rotate: -1, y: -15, scale: 0.8, aspect: 'aspect-[2/3]' },
    { rotate: 4, y: 70, scale: 0.9, aspect: 'aspect-[3/4]' },
    { rotate: -4.5, y: -80, scale: 1.0, aspect: 'aspect-[4/5]' },
    { rotate: 1.5, y: 25, scale: 0.82, aspect: 'aspect-[3/4]' },
    { rotate: -3.8, y: -35, scale: 0.92, aspect: 'aspect-[2/3]' },
    { rotate: 2.5, y: 60, scale: 0.78, aspect: 'aspect-[3/4]' },
  ];

  const variant = variations[index % variations.length];

  // Si l'item a un variant specifique (type de cadrage), l'utiliser
  const frameStyles: Record<string, string> = {
    wedding: 'shadow-[20px_20px_60px_rgba(0,0,0,0.1)] border-[10px] border-white',
    culinary: 'shadow-[10px_10px_40px_rgba(0,0,0,0.06)] border-[1px] border-black/10',
    urban: 'shadow-2xl border-[12px] border-zinc-900',
    birth: 'rounded-[40px] shadow-lg border-[6px] border-white/80',
    nature: 'shadow-2xl border-[8px] border-[#1e272e]',
    fashion: 'shadow-[20px_20px_0px_rgba(0,0,0,0.02)] border-[1.5px] border-black',
    architecture: 'shadow-none border-[1px] border-zinc-300',
    portrait: 'shadow-2xl border-[15px] border-white outline outline-1 outline-black/5',
    showcase: '',
  };

  const frameClass = frameStyles[item.variant] ?? '';

  // Rendu pour showcase et standard (PNG transparent, pas de cadre)
  if (item.variant === 'showcase' || item.variant === 'standard') {
    return (
      <motion.div
        onClick={onClick}
        style={{ rotate: -2, y: -20, scale: 0.95 }}
        whileHover={{
          y: -40,
          scale: 1.02,
          rotate: 0,
          transition: { duration: 0.5, ease: 'easeOut' },
        }}
        whileTap={{ scale: 0.98 }}
        className="relative cursor-pointer flex-shrink-0 mx-4 sm:mx-8 md:mx-12 lg:mx-20 flex flex-col items-center"
      >
        {item.url && (
          <motion.img
            src={item.url}
            alt={item.label}
            className="h-auto object-contain transition-transform duration-500
              w-[200px] sm:w-[280px] md:w-[400px] lg:w-[500px] xl:w-[550px]"
            style={{ filter: 'drop-shadow(8px 12px 25px rgba(0,0,0,0.2))' }}
          />
        )}
        <div className="mt-2 sm:mt-4 text-center">
          <h3 className="handwritten text-lg sm:text-xl md:text-2xl lg:text-3xl text-black/90">
            {item.label}
          </h3>
        </div>
      </motion.div>
    );
  }

  // Rendu standard
  return (
    <motion.div
      onClick={onClick}
      style={{
        rotate: variant.rotate * 0.5,
        y: variant.y * 0.5,
        scale: variant.scale,
      }}
      whileHover={{
        y: variant.y - 20,
        scale: variant.scale * 1.08,
        rotate: 0,
        transition: { duration: 0.6, ease: 'easeOut' },
      }}
      whileTap={{ scale: variant.scale * 0.95 }}
      className={`relative cursor-pointer flex-shrink-0
        w-[160px] sm:w-[200px] md:w-[240px] lg:w-[280px]
        mx-3 sm:mx-6 md:mx-12 lg:mx-20
        overflow-hidden ${variant.aspect} ${frameClass}`}
    >
      {item.url && (
        <img
          src={item.url}
          alt={item.label}
          className="absolute inset-0 w-full h-full object-contain grayscale-[0.4] hover:grayscale-0 transition-all duration-1000"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 pointer-events-none" />

      <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 left-3 sm:left-4 md:left-5 right-3 sm:right-4 md:right-5 text-white">
        <p className="text-[6px] sm:text-[7px] mb-0.5 sm:mb-1 uppercase tracking-[0.3em] sm:tracking-[0.4em] opacity-70 font-medium">
          {item.subtitle}
        </p>
        <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl serif italic leading-none">
          {item.label}
        </h3>
      </div>

      <div className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 mix-blend-difference">
        <span className="text-[6px] sm:text-[7px] text-white/40 uppercase tracking-[0.2em] sm:tracking-[0.3em]">
          Coll. {index + 1}
        </span>
      </div>
    </motion.div>
  );
};

const PortfolioSection: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const { items, loading, error, fetchItems, createItem, updateItem, deleteItem } = useItems();
  const { isAdmin, isEditing } = useAdmin();

  // Etat du formulaire
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | undefined>(undefined);

  useEffect(() => {
    void fetchItems(); // parent_id = null => collections
  }, [fetchItems]);

  const handleCollectionClick = useCallback(
    (item: Item) => {
      const basePath = isAdminRoute ? '/admin/portfolio' : '/portfolio';
      navigate(`${basePath}/${item.id}`);
    },
    [navigate, isAdminRoute]
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


  if (loading) {
    return (
      <div className="fixed inset-0 z-[140] bg-[#faf8f5] wall-texture flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            className="w-6 h-6 border border-zinc-200 border-t-[#8b7355] rounded-full mx-auto mb-4"
          />
          <span className="text-[9px] uppercase tracking-[0.4em] text-zinc-400">
            Chargement des collections...
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
            onClick={() => void fetchItems()}
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
      className="w-screen h-screen bg-[#faf8f5] wall-texture overflow-hidden"
    >



      {/* Contenu scrollable horizontalement */}
      <div
        className="flex h-full w-full overflow-x-auto overflow-y-hidden items-center select-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Titre "Collections" */}
        <div className="flex-shrink-0 w-[50vw] sm:w-[45vw] md:w-[40vw] flex flex-col justify-center px-3 sm:px-6 md:px-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-3xl sm:text-5xl md:text-7xl lg:text-9xl serif italic mb-2 sm:mb-4">
              Collections
            </h2>
            <div className="w-12 sm:w-16 h-[1px] bg-black/10 mb-4 sm:mb-6" />
            <p className="text-[7px] sm:text-[8px] md:text-[9px] uppercase tracking-[0.2em] sm:tracking-[0.3em] md:tracking-[0.5em] text-zinc-400">
              <span className="hidden md:inline">Navigation a la molette</span>
              <span className="md:hidden">Glissez &rarr;</span>
            </p>
          </motion.div>
        </div>

        {/* Cartes des collections */}
        <div className="flex items-center">
          {items.map((item, idx) => {
            const card = (
              <CollectionCard
                key={item.id}
                item={item}
                index={idx}
                onClick={() => handleCollectionClick(item)}
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
              variant="collection"
              label="Ajouter une collection"
            />
          )}
        </div>

        {/* Spacer fin de mur */}
        <div className="flex-shrink-0 w-[20vw] sm:w-[30vw] h-full" />
      </div>

      {/* ItemForm drawer */}
      <AnimatePresence>
        {formOpen && (
          <ItemForm
            mode={editingItem ? 'edit' : 'create'}
            item={editingItem}
            parentId={null}
            itemType="collection"
            onClose={handleCloseForm}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PortfolioSection;
