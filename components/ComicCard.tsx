
import React from 'react';
import { Comic } from '../types';
import { TrashIcon } from './Icons';

interface ComicCardProps {
  comic: Comic;
  onContinue: (comicId: string) => void;
  onDelete: (comicId: string) => void;
}

const ComicCard: React.FC<ComicCardProps> = ({ comic, onContinue, onDelete }) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete the comic "${comic.topic}"?`)) {
      onDelete(comic.id);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-primary-600 dark:text-primary-400">{comic.subject}</p>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">{comic.topic}</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{comic.ward}</p>
            </div>
            <button onClick={handleDelete} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1 rounded-full">
                <TrashIcon />
            </button>
        </div>
        <div className="mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">Progress</p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-1">
                <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${comic.progress}%` }}></div>
            </div>
            <p className="text-right text-sm text-gray-500 dark:text-gray-400 mt-1">{comic.progress}% complete</p>
        </div>
      </div>
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg">
        <button
          onClick={() => onContinue(comic.id)}
          className="w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default ComicCard;
