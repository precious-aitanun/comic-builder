import React from 'react';
import { Episode } from '../types';
import { TrashIcon } from './Icons';

interface EpisodeCardProps {
  episode: Episode;
  onContinue: (episodeId: string) => void;
  onDelete: (episodeId: string) => void;
}

const getStatusText = (phase: Episode['generationPhase']) => {
    switch (phase) {
        case 'start': return 'Not Started';
        case 'arc_proposal_pending': return 'Generating Arc...';
        case 'arc_proposal_review': return 'Awaiting Arc Approval';
        case 'episode_writing_pending': return 'Writing Episode...';
        case 'episode_review': return 'Episode Ready for Review';
        case 'panel_breakdown_pending': return 'Generating Panels...';
        case 'panel_breakdown_review': return 'Panels Ready for Review';
        case 'complete': return 'Completed';
        default: return 'Unknown';
    }
}

const EpisodeCard: React.FC<EpisodeCardProps> = ({ episode, onContinue, onDelete }) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(episode.id);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-primary-600 dark:text-primary-400">Episode {episode.episodeNumber}</p>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">{episode.topic}</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                    Status: <span className="font-semibold">{getStatusText(episode.generationPhase)}</span>
                </p>
            </div>
            <button onClick={handleDelete} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1 rounded-full">
                <TrashIcon />
            </button>
        </div>
        <div className="mt-4 text-xs text-gray-400">
            Created: {new Date(episode.createdAt).toLocaleDateString()}
        </div>
      </div>
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg">
        <button
          onClick={() => onContinue(episode.id)}
          className="w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
        >
          {episode.generationPhase === 'start' ? 'Start Generation' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default EpisodeCard;
