import React from 'react';
import { Panel } from '../types';

interface ComicPanelPreviewProps {
  panel: Panel;
  panelNumber: number;
}

const ComicPanelPreview: React.FC<ComicPanelPreviewProps> = ({ panel, panelNumber }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col h-full border border-gray-200 dark:border-gray-700">
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Panel {panelNumber}</h3>
        
        {panel.caption && (
          <p className="mt-2 text-sm italic text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md">
            "{panel.caption}"
          </p>
        )}

        {panel.dialogue && panel.dialogue.length > 0 && (
          <div className="mt-4 space-y-2 flex-grow">
            {panel.dialogue.map((d, index) => (
              <div key={index}>
                <span className="font-semibold text-primary-600 dark:text-primary-400">{d.character}: </span>
                <span className="text-gray-700 dark:text-gray-300">"{d.line}"</span>
              </div>
            ))}
          </div>
        )}

        {(!panel.dialogue || panel.dialogue.length === 0) && <div className="flex-grow"></div>}

        <div className="mt-4 text-xs text-gray-400 dark:text-gray-500 text-right">
            Visual: {panel.visualDescription.substring(0, 50)}...
        </div>
      </div>
    </div>
  );
};

export default ComicPanelPreview;
