import { useState, useEffect, useCallback } from 'react';
import { Episode } from '../types';
import { getEpisodes, saveEpisodes } from '../services/storageService';
import { generateUUID } from '../utils/helpers';

export const useEpisodes = () => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadedEpisodes = getEpisodes();
    setEpisodes(loadedEpisodes);
    setLoading(false);
  }, []);

  const updateAndSave = (newEpisodes: Episode[]) => {
    // Sort by episode number before saving
    const sortedEpisodes = [...newEpisodes].sort((a, b) => a.episodeNumber - b.episodeNumber);
    setEpisodes(sortedEpisodes);
    saveEpisodes(sortedEpisodes);
  };

  const addEpisode = (topic: string, textbookContent: string, creativeDirection: string): Episode => {
    const newEpisode: Episode = {
      id: generateUUID(),
      episodeNumber: (episodes[episodes.length - 1]?.episodeNumber || 0) + 1,
      topic,
      textbookContent,
      createdAt: new Date().toISOString(),
      generationPhase: 'start',
      history: [],
    };
    const updatedEpisodes = [...episodes, newEpisode];
    updateAndSave(updatedEpisodes);
    return newEpisode;
  };

  const updateEpisode = (updatedEpisode: Episode) => {
    const updatedEpisodes = episodes.map(c => (c.id === updatedEpisode.id ? updatedEpisode : c));
    updateAndSave(updatedEpisodes);
  };

  const deleteEpisode = (episodeId: string) => {
    if (!window.confirm("Are you sure you want to delete this episode? This action cannot be undone.")) {
      return;
    }
    const updatedEpisodes = episodes.filter(c => c.id !== episodeId);
    updateAndSave(updatedEpisodes);
  };
  
  const getEpisodeById = useCallback((id: string | null) => {
    if (!id) return undefined;
    return episodes.find(c => c.id === id);
  }, [episodes]);


  const clearAllEpisodes = () => {
    if (window.confirm('Are you sure you want to delete ALL episode data? This action cannot be undone.')) {
        updateAndSave([]);
    }
  }

  return { episodes, loading, addEpisode, updateEpisode, deleteEpisode, getEpisodeById, clearAllEpisodes };
};
