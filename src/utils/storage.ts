import { School } from '../types';

const STORAGE_KEY = 'schools';

export const getSchools = (): School[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading from localStorage', error);
    return [];
  }
};

export const saveSchools = (schools: School[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schools));
  } catch (error) {
    console.error('Error saving to localStorage', error);
  }
};
