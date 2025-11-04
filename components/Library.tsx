
import React from 'react';
import { Comic } from '../types';
import ComicCard from './ComicCard';
import { BookOpenIcon, PlusIcon } from './Icons';

interface LibraryProps {
  comics: Comic[];
  onContinue: (comicId: string) => void;
  onDelete: (comicId: string) => void;
  onNavigateToDashboard: () => void;
}

const Library: React.FC<LibraryProps> = ({ comics, onContinue, onDelete, onNavigateToDashboard }) => {
  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Comic Library</h2>
        <button 
          onClick={onNavigateToDashboard}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon />
          <span className="ml-2">New Comic</span>
        </button>
      </div>

      {comics.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {comics.map(comic => (
            <ComicCard
              key={comic.id}
              comic={comic}
              onContinue={onContinue}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <BookOpenIcon />
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No comics found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new comic.</p>
          <div className="mt-6">
            <button
              type="button"
              onClick={onNavigateToDashboard}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon />
              <span className="ml-2">Create New Comic</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;
