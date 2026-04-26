import { useState, useCallback, useRef, useEffect } from 'react';
import type { CloudinaryFolder, CloudinaryImage, CloudinaryBrowseResponse } from '../types';

interface UseCloudinaryReturn {
  folders: CloudinaryFolder[];
  images: CloudinaryImage[];
  loading: boolean;
  error: string | null;
  currentFolder: string;
  browseFolders: (folder: string) => Promise<void>;
  goBack: () => void;
}

export function useCloudinary(): UseCloudinaryReturn {
  const [folders, setFolders] = useState<CloudinaryFolder[]>([]);
  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState('');
  const folderHistoryRef = useRef<string[]>([]);
  const currentFolderRef = useRef('');

  const fetchFolder = useCallback(async (folder: string): Promise<CloudinaryBrowseResponse> => {
    const params = folder ? `?folder=${encodeURIComponent(folder)}` : '';
    const res = await fetch(`/api/cloudinary-browse${params}`);

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Erreur Cloudinary');
    }

    return res.json() as Promise<CloudinaryBrowseResponse>;
  }, []);

  const browseFolders = useCallback(async (folder: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchFolder(folder);
      setFolders(response.folders ?? []);
      setImages(response.images ?? []);

      // Empiler le dossier courant dans l'historique avant de changer
      if (currentFolderRef.current !== folder) {
        folderHistoryRef.current = [...folderHistoryRef.current, currentFolderRef.current];
      }
      currentFolderRef.current = folder;
      setCurrentFolder(folder);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur Cloudinary';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [fetchFolder]);

  const goBack = useCallback(async () => {
    const history = folderHistoryRef.current;
    if (history.length === 0) return;

    const previousFolder = history[history.length - 1];
    folderHistoryRef.current = history.slice(0, -1);
    currentFolderRef.current = previousFolder;
    setCurrentFolder(previousFolder);
    setLoading(true);
    setError(null);

    try {
      const response = await fetchFolder(previousFolder);
      setFolders(response.folders ?? []);
      setImages(response.images ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur Cloudinary';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [fetchFolder]);

  // Cleanup
  useEffect(() => {
    return () => {
      folderHistoryRef.current = [];
      currentFolderRef.current = '';
    };
  }, []);

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
