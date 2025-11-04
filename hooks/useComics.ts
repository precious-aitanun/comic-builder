import { useState, useEffect, useCallback } from 'react';
import { Comic } from '../types';
import { getComics, saveComics } from '../services/storageService';
import { generateUUID } from '../utils/helpers';

export const useComics = () => {
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadedComics = getComics();
    setComics(loadedComics);
    setLoading(false);
  }, []);

  const updateAndSave = (newComics: Comic[]) => {
    setComics(newComics);
    saveComics(newComics);
  };

  const addComic = (newComicData: Omit<Comic, 'id' | 'storyState' | 'panels' | 'progress' | 'createdAt'>, initialExcerpt: string) => {
    const newComic: Comic = {
      ...newComicData,
      id: generateUUID(),
      storyState: {
        lastPanelSummary: initialExcerpt.substring(0, 100) + '...',
        completedExcerpts: 0,
      },
      panels: [],
      progress: 0,
      createdAt: new Date().toISOString(),
    };
    const updatedComics = [...comics, newComic];
    updateAndSave(updatedComics);
    return newComic;
  };

  const updateComic = (updatedComic: Comic) => {
    const updatedComics = comics.map(c => (c.id === updatedComic.id ? updatedComic : c));
    updateAndSave(updatedComics);
  };

  const deleteComic = (comicId: string) => {
    const updatedComics = comics.filter(c => c.id !== comicId);
    updateAndSave(updatedComics);
  };
  
  const getComicById = useCallback((id: string | null) => {
    if (!id) return undefined;
    return comics.find(c => c.id === id);
  }, [comics]);


  const clearAllComics = () => {
    updateAndSave([]);
  }

  return { comics, loading, addComic, updateComic, deleteComic, getComicById, clearAllComics };
};
