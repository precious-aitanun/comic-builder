import { Episode } from '../types';

const STORAGE_KEY = 'zenith_episodes';

export const getEpisodes = (): Episode[] => {
  try {
    const episodesJson = localStorage.getItem(STORAGE_KEY);
    return episodesJson ? JSON.parse(episodesJson) : [];
  } catch (error) {
    console.error('Error reading episodes from localStorage', error);
    return [];
  }
};

export const saveEpisodes = (episodes: Episode[]): void => {
  try {
    const episodesJson = JSON.stringify(episodes);
    localStorage.setItem(STORAGE_KEY, episodesJson);
  } catch (error) {
    console.error('Error saving episodes to localStorage', error);
  }
};
