
import { Comic } from '../types';

const STORAGE_KEY = 'zenith_comics';

export const getComics = (): Comic[] => {
  try {
    const comicsJson = localStorage.getItem(STORAGE_KEY);
    return comicsJson ? JSON.parse(comicsJson) : [];
  } catch (error) {
    console.error('Error reading comics from localStorage', error);
    return [];
  }
};

export const saveComics = (comics: Comic[]): void => {
  try {
    const comicsJson = JSON.stringify(comics);
    localStorage.setItem(STORAGE_KEY, comicsJson);
  } catch (error) {
    console.error('Error saving comics to localStorage', error);
  }
};
