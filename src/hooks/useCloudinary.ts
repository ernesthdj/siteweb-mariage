import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { CloudinaryFolder, CloudinaryImage } from '../types';

interface UseCloudinaryReturn {
  folders: CloudinaryFolder[];
  images: CloudinaryImage[];
  loading: boolean;
  error: string | null;
  currentFolder: string;
  browseFolders: (folder?: string) => Promise<void>;
  goBack: () => void;
}

export function useCloudinary(): UseCloudinaryReturn {
  const [folders, setFolders] = useState<CloudinaryFolder[]>([]);
  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState('');
  const [folderHistory, setFolderHistory] = useState<string[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup de la requete en cours au demontage
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  /** Fetch interne reutilise par browseFolders et goBack */
  const fetchFolder = useCallback(async (folder: string): Promise<{ folders: CloudinaryFolder[]; images: CloudinaryImage[] }> => {
    // Annuler la requete precedente si encore en cours
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Authentification requise pour parcourir Cloudinary');

    const { data, error: fnError } = await supabase.functions.invoke(
      'cloudinary-browse',
      {
        body: { folder },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    // Verifier si la requete a ete annulee
    if (controller.signal.aborted) {
      throw new Error('Requete annulee');
    }

    if (fnError) throw fnError;

    return data as { folders: CloudinaryFolder[]; images: CloudinaryImage[] };
  }, []);

  const browseFolders = useCallback(async (folder?: string) => {
    const targetFolder = folder ?? '';
    setLoading(true);
    setError(null);

    try {
      const response = await fetchFolder(targetFolder);
      setFolders(response.folders ?? []);
      setImages(response.images ?? []);

      // Ne pas empiler un string vide dans l'historique (premier appel racine)
      if (folder !== undefined && currentFolder !== '') {
        setFolderHistory(prev => [...prev, currentFolder]);
      } else if (folder !== undefined && currentFolder === '' && targetFolder !== '') {
        // Naviguer depuis la racine vers un sous-dossier : empiler la racine
        setFolderHistory(prev => [...prev, currentFolder]);
      }
      setCurrentFolder(targetFolder);
    } catch (err) {
      if (err instanceof Error && err.message === 'Requete annulee') return;
      const message = err instanceof Error ? err.message : 'Erreur Cloudinary';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [currentFolder, fetchFolder]);

  const goBack = useCallback(async () => {
    if (folderHistory.length === 0) return;

    const previousFolder = folderHistory[folderHistory.length - 1];
    setFolderHistory(prev => prev.slice(0, -1));
    setCurrentFolder(previousFolder);
    setLoading(true);
    setError(null);

    try {
      const response = await fetchFolder(previousFolder);
      setFolders(response.folders ?? []);
      setImages(response.images ?? []);
    } catch (err) {
      if (err instanceof Error && err.message === 'Requete annulee') return;
      const message = err instanceof Error ? err.message : 'Erreur Cloudinary';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [folderHistory, fetchFolder]);

  return {
    folders,
    images,
    loading,
    error,
    currentFolder,
    browseFolders,
    goBack,
  };
}
