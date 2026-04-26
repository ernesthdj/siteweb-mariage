import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Item, CreateItemPayload, UpdateItemPayload, ReorderEntry } from '../types';

interface UseItemsReturn {
  items: Item[];
  loading: boolean;
  error: string | null;
  fetchItems: (parentId?: string) => Promise<void>;
  createItem: (payload: CreateItemPayload) => Promise<Item | null>;
  updateItem: (id: string, changes: UpdateItemPayload) => Promise<Item | null>;
  deleteItem: (id: string) => Promise<boolean>;
  reorderItems: (entries: ReorderEntry[]) => Promise<boolean>;
}

export function useItems(): UseItemsReturn {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async (parentId?: string) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('items')
        .select('*')
        .order('position', { ascending: true });

      if (parentId) {
        query = query.eq('parent_id', parentId);
      } else {
        query = query.is('parent_id', null);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setItems(data as Item[]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createItem = useCallback(async (payload: CreateItemPayload): Promise<Item | null> => {
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from('items')
        .insert(payload)
        .select()
        .single();

      if (insertError) throw insertError;

      const created = data as Item;
      setItems(prev => [...prev, created]);
      return created;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la création';
      setError(message);
      return null;
    }
  }, []);

  const updateItem = useCallback(async (id: string, changes: UpdateItemPayload): Promise<Item | null> => {
    setError(null);

    // Capturer l'item original via le callback pour éviter les closures stales
    let originalItem: Item | undefined;
    setItems(prev => {
      originalItem = prev.find(item => item.id === id);
      return prev.map(item =>
        item.id === id ? { ...item, ...changes } : item
      );
    });

    try {
      const { data, error: updateError } = await supabase
        .from('items')
        .update(changes)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      const updated = data as Item;
      setItems(prev => prev.map(item =>
        item.id === id ? updated : item
      ));
      return updated;
    } catch (err) {
      // Rollback en cas d'erreur : restaurer l'item original
      if (originalItem) {
        setItems(prev => prev.map(item =>
          item.id === id ? originalItem! : item
        ));
      }
      const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(message);
      return null;
    }
  }, []);

  const deleteItem = useCallback(async (id: string): Promise<boolean> => {
    setError(null);

    // Capturer l'item supprimé et sa position via le callback pour éviter les closures stales
    let deletedItem: Item | undefined;
    let deletedIndex = -1;
    setItems(prev => {
      deletedIndex = prev.findIndex(item => item.id === id);
      if (deletedIndex !== -1) {
        deletedItem = prev[deletedIndex];
      }
      return prev.filter(item => item.id !== id);
    });

    try {
      const { error: deleteError } = await supabase
        .from('items')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      return true;
    } catch (err) {
      // Rollback : réinsérer l'item à sa position d'origine
      if (deletedItem) {
        const itemToRestore = deletedItem;
        const indexToRestore = deletedIndex;
        setItems(prev => {
          const restored = [...prev];
          restored.splice(indexToRestore, 0, itemToRestore);
          return restored;
        });
      }
      const message = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(message);
      return false;
    }
  }, []);

  const reorderItems = useCallback(async (entries: ReorderEntry[]): Promise<boolean> => {
    setError(null);

    // Capturer le snapshot via le callback pour éviter les closures stales
    let previousItems: Item[] = [];
    setItems(prev => {
      previousItems = [...prev];
      const updated = [...prev];
      for (const entry of entries) {
        const idx = updated.findIndex(item => item.id === entry.id);
        if (idx !== -1) {
          updated[idx] = { ...updated[idx], position: entry.position };
        }
      }
      return updated.sort((a, b) => a.position - b.position);
    });

    try {
      const { error: rpcError } = await supabase
        .rpc('reorder_items', { p_items: entries });

      if (rpcError) throw rpcError;
      return true;
    } catch (err) {
      setItems(previousItems);
      const message = err instanceof Error ? err.message : 'Erreur lors du réordonnancement';
      setError(message);
      return false;
    }
  }, []);

  return {
    items,
    loading,
    error,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    reorderItems,
  };
}
