import React, { useState } from 'react';
import { Episode } from '../types';
import EpisodeCard from './ComicCard';
import { BookOpenIcon, PlusIcon, SparklesIcon } from './Icons';

interface LibraryProps {
  episodes: Episode[];
  onContinue: (episodeId: string) => void;
  onDelete: (episodeId: string) => void;
  onCreateEpisode: (topic: string, textbookContent: string, creativeDirection: string) => void;
}

const NewEpisodeForm: React.FC<{ onCreateEpisode: (topic: string, textbookContent: string, creativeDirection: string) => void; }> = ({ onCreateEpisode }) => {
    const [topic, setTopic] = useState('');
    const [textbookContent, setTextbookContent] = useState('');
    const [creativeDirection, setCreativeDirection] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim() || !textbookContent.trim()) {
            alert('Please provide a topic and the textbook content.');
            return;
        }
        onCreateEpisode(topic, textbookContent, creativeDirection);
        setTopic('');
        setTextbookContent('');
        setCreativeDirection('');
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Create New Episode</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Episode Topic</label>
                    <input
                        type="text"
                        id="topic"
                        value={topic}
                        onChange={e => setTopic(e.target.value)}
                        placeholder="e.g., Management of Acute Myocardial Infarction"
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="textbook-content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Textbook Content</label>
                    <textarea
                        id="textbook-content"
                        value={textbookContent}
                        onChange={e => setTextbookContent(e.target.value)}
                        rows={8}
                        placeholder="Paste the medical textbook content here. The AI will weave all of this information into the story."
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        required
                    />
                </div>
                 <div>
                    <label htmlFor="creative-direction" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Creative Direction (Optional)</label>
                    <textarea
                        id="creative-direction"
                        value={creativeDirection}
                        onChange={e => setCreativeDirection(e.target.value)}
                        rows={3}
                        placeholder="e.g., Focus on the relationship between Dr. Precious and Dr. Efua. Continue the storyline about the hospital's budget crisis."
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>
                <div className="text-right">
                    <button
                        type="submit"
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        <SparklesIcon />
                        <span className="ml-2">Start Episode Generation</span>
                    </button>
                </div>
            </form>
        </div>
    );
}


const Library: React.FC<LibraryProps> = ({ episodes, onContinue, onDelete, onCreateEpisode }) => {
  return (
    <div className="max-w-7xl mx-auto p-8">
        <NewEpisodeForm onCreateEpisode={onCreateEpisode} />
      
      <div className="mt-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Episode Library</h2>
        {episodes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {episodes.map(episode => (
              <EpisodeCard
                key={episode.id}
                episode={episode}
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
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No episodes found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new episode above.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;
