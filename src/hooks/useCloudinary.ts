import { useState, useCallback, useRef, useEffect } from 'react';
import type { CloudinaryFolder, CloudinaryImage, CloudinaryBrowseResponse } from '../types';

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

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const fetchFolder = useCallback(async (folder: string): Promise<CloudinaryBrowseResponse> => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const params = folder ? `?folder=${encodeURIComponent(folder)}` : '';
    const res = await fetch(`/api/cloudinary-browse${params}`, {
      signal: controller.signal,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Erreur Cloudinary');
    }

    return res.json() as Promise<CloudinaryBrowseResponse>;
  }, []);

  const browseFolders = useCallback(async (folder?: string) => {
    const targetFolder = folder ?? '';
    setLoading(true);
    setError(null);

    try {
      const response = await fetchFolder(targetFolder);
      setFolders(response.folders ?? []);
      setImages(response.images ?? []);

      if (folder !== undefined && (currentFolder !== '' || targetFolder !== '')) {
        setFolderHistory(prev => [...prev, currentFolder]);
      }
      setCurrentFolder(targetFolder);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
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
      if (err instanceof DOMException && err.name === 'AbortError') return;
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
