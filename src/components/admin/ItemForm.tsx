/**
 * ItemForm — Drawer lateral droit pour creer/editer un item
 * fixed right-0 top-0 h-full, w-[400px] (md) / w-full (mobile)
 * bg-white shadow, slide-in from right (Framer Motion AnimatePresence)
 * Overlay bg-black/20 derriere, z-[350]
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Item, ItemType } from '../../types';

/** Donnees du formulaire de creation/edition */
interface ItemFormData {
  label: string;
  subtitle: string | null;
  url: string;
  description: string | null;
  visible: boolean;
  type?: ItemType;
  parent_id?: string | null;
}
import CloudinaryBrowser from './CloudinaryBrowser';

interface ItemFormProps {
  mode: 'create' | 'edit';
  item?: Item;
  parentId?: string | null;
  itemType: ItemType;
  onClose: () => void;
  onSave: (data: ItemFormData) => void | Promise<void>;
}

const ItemForm: React.FC<ItemFormProps> = ({
  mode,
  item,
  parentId,
  itemType,
  onClose,
  onSave,
}) => {
  const [label, setLabel] = useState(item?.label ?? '');
  const [subtitle, setSubtitle] = useState(item?.subtitle ?? '');
  const [url, setUrl] = useState(item?.url ?? '');
  const [description, setDescription] = useState(item?.description ?? '');
  const [visible, setVisible] = useState(item?.visible ?? false);
  const [showCloudinary, setShowCloudinary] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset du formulaire quand l'item change
  useEffect(() => {
    if (item) {
      setLabel(item.label);
      setSubtitle(item.subtitle ?? '');
      setUrl(item.url ?? '');
      setDescription(item.description ?? '');
      setVisible(item.visible);
    }
  }, [item]);

  // Fermer avec Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !showCloudinary) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, showCloudinary]);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!label.trim()) {
      newErrors.label = 'Le label est requis.';
    }

    if (url.trim() && !url.trim().startsWith('https://')) {
      newErrors.url = "L'URL doit commencer par https://";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [label, url]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate() || isSubmitting) return;

      setIsSubmitting(true);
      try {
        const formData: ItemFormData = {
          label: label.trim(),
          subtitle: subtitle.trim() || null,
          url: url.trim(),
          description: description.trim() || null,
          visible,
        };

        if (mode === 'create') {
          await onSave({
            ...formData,
            type: itemType,
            parent_id: parentId ?? null,
          });
        } else {
          await onSave(formData);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [label, subtitle, url, description, visible, validate, onSave, isSubmitting, mode, itemType, parentId]
  );

  const handleCloudinarySelect = useCallback((selectedUrl: string) => {
    setUrl(selectedUrl);
    setShowCloudinary(false);
  }, []);

  const isEdit = mode === 'edit';

  return (
    <AnimatePresence>
      {/* Overlay */}
      <motion.div
        key="item-form-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[350] bg-black/20"
        onClick={onClose}
      />

      {/* Drawer */}
      <motion.div
        key="item-form-drawer"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
        className="fixed right-0 top-0 h-full w-full md:w-[400px] bg-white z-[351] overflow-y-auto"
        style={{
          boxShadow: '-20px 0 60px rgba(0,0,0,0.08)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-zinc-100 px-6 py-5 flex items-center justify-between z-10">
          <h2 className="serif italic text-lg text-[#1a1a1a]">
            {isEdit ? 'Modifier' : "Creer l'item"}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-300 hover:text-zinc-600 transition-colors text-xl leading-none"
            aria-label="Fermer"
          >
            &times;
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          {/* Label */}
          <div>
            <label
              htmlFor="item-label"
              className="block text-[9px] uppercase tracking-[0.3em] text-zinc-400 mb-2"
            >
              Label <span className="text-red-400">*</span>
            </label>
            <input
              id="item-label"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Titre de l'item"
              className="w-full border-b border-zinc-100 py-3 outline-none focus:border-black transition-colors text-sm font-light bg-transparent"
            />
            {errors.label && (
              <p className="text-[10px] text-red-400 mt-1">{errors.label}</p>
            )}
          </div>

          {/* Subtitle */}
          <div>
            <label
              htmlFor="item-subtitle"
              className="block text-[9px] uppercase tracking-[0.3em] text-zinc-400 mb-2"
            >
              Sous-titre
            </label>
            <input
              id="item-subtitle"
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Sous-titre optionnel"
              className="w-full border-b border-zinc-100 py-3 outline-none focus:border-black transition-colors text-sm font-light bg-transparent"
            />
          </div>

          {/* Image URL + Bouton Cloudinary */}
          <div>
            <label
              htmlFor="item-url"
              className="block text-[9px] uppercase tracking-[0.3em] text-zinc-400 mb-2"
            >
              Image
            </label>
            <div className="flex items-end gap-3">
              <input
                id="item-url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://res.cloudinary.com/..."
                className="flex-1 border-b border-zinc-100 py-3 outline-none focus:border-black transition-colors text-sm font-light bg-transparent"
              />
              <button
                type="button"
                onClick={() => setShowCloudinary(true)}
                className="flex-shrink-0 px-3 py-2 border border-zinc-200 text-[8px] uppercase tracking-[0.2em] text-zinc-500 hover:border-[#8b7355]/40 hover:text-[#8b7355] transition-all duration-200 rounded-sm"
              >
                Parcourir
              </button>
            </div>
            {errors.url && (
              <p className="text-[10px] text-red-400 mt-1">{errors.url}</p>
            )}
            {/* Miniature de preview */}
            {url && url.startsWith('https://') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3"
              >
                <img
                  src={url}
                  alt="Preview"
                  className="w-full max-h-40 object-contain rounded-sm border border-zinc-100"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </motion.div>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="item-description"
              className="block text-[9px] uppercase tracking-[0.3em] text-zinc-400 mb-2"
            >
              Description
            </label>
            <textarea
              id="item-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Texte poetique, description..."
              rows={4}
              className="w-full border-b border-zinc-100 py-3 outline-none focus:border-black transition-colors text-sm font-light bg-transparent resize-none"
            />
          </div>

          {/* Toggle Visible */}
          <div className="flex items-center justify-between py-2">
            <label
              htmlFor="item-visible"
              className="text-[9px] uppercase tracking-[0.3em] text-zinc-400"
            >
              Publier
            </label>
            <button
              type="button"
              id="item-visible"
              role="switch"
              aria-checked={visible}
              onClick={() => setVisible((prev) => !prev)}
              className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                visible ? 'bg-[#8b7355]' : 'bg-zinc-200'
              }`}
            >
              <motion.div
                className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"
                animate={{ left: visible ? 20 : 2 }}
                transition={{ duration: 0.2 }}
              />
            </button>
          </div>

          {/* Bouton CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-[#1a1a1a] text-white py-4 text-[9px] uppercase tracking-[0.4em] mt-4 transition-all duration-500 relative overflow-hidden group ${
              isSubmitting
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-[#2a2a2a] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]'
            }`}
          >
            <span className="relative z-10">
              {isSubmitting
                ? 'Creation...'
                : isEdit
                  ? 'Sauvegarder'
                  : "Creer l'item"}
            </span>
            <div className="absolute inset-0 bg-[#2a2a2a] translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          </button>
        </form>
      </motion.div>

      {/* Cloudinary Browser Modal */}
      {showCloudinary && (
        <CloudinaryBrowser
          isOpen={showCloudinary}
          onClose={() => setShowCloudinary(false)}
          onSelect={handleCloudinarySelect}
        />
      )}
    </AnimatePresence>
  );
};

export default ItemForm;
