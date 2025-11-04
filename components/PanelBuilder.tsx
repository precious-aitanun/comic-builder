
import React, { useState } from 'react';
import { Comic, Panel } from '../types';
import PanelForm from './PanelForm';
import { generateUUID, downloadFile, comicToMarkdown } from '../utils/helpers';
import { ArrowLeftIcon, DownloadIcon, SparklesIcon } from './Icons';
import { generateStoryPanels } from '../services/geminiService';

interface PanelBuilderProps {
  comic: Comic;
  onUpdateComic: (updatedComic: Comic) => void;
  onBackToLibrary: () => void;
}

const PanelBuilder: React.FC<PanelBuilderProps> = ({ comic, onUpdateComic, onBackToLibrary }) => {
  const [currentExcerpt, setCurrentExcerpt] = useState('');
  const [draftPanels, setDraftPanels] = useState<Panel[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePanels = async () => {
    if (!currentExcerpt) {
        setError("Please enter an excerpt first.");
        return;
    }
    setIsGenerating(true);
    setError(null);
    setDraftPanels([]);

    try {
        const aiPanels = await generateStoryPanels(comic, currentExcerpt);
        const newDrafts: Panel[] = aiPanels.map(p => ({
            ...p,
            id: generateUUID(),
        }));
        setDraftPanels(newDrafts);
    } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleSavePanel = (panelData: Panel) => {
    setDraftPanels(prev => prev.map(p => p.id === panelData.id ? panelData : p));
  };
  
  const handleFinishExcerpt = () => {
      // Basic validation
      if (draftPanels.some(p => !p.visualDescription)) {
          alert('Please fill at least the Visual Description for all panels.');
          return;
      }

      const updatedPanels = [...comic.panels, ...draftPanels];
      const newProgress = Math.min(100, comic.panels.length > 0 ? (updatedPanels.length / (comic.panels.length * 1.5)) * 100 : 10);

      const lastPanel = draftPanels[draftPanels.length - 1];
      const newSummary = lastPanel?.caption || lastPanel?.dialogue?.[0]?.line || lastPanel?.observation || comic.storyState.lastPanelSummary;

      const updatedComic: Comic = {
          ...comic,
          panels: updatedPanels,
          progress: Math.round(newProgress),
          storyState: {
              ...comic.storyState,
              lastPanelSummary: newSummary,
              completedExcerpts: comic.storyState.completedExcerpts + 1
          }
      };
      onUpdateComic(updatedComic);
      
      // Reset for next excerpt
      setCurrentExcerpt('');
      setDraftPanels([]);
  }

  const handleExportJson = () => {
    const jsonString = JSON.stringify(comic, null, 2);
    downloadFile(jsonString, `${comic.topic.replace(/\s+/g, '_')}.json`, 'application/json');
  }

  const handleExportMarkdown = () => {
    const markdownString = comicToMarkdown(comic);
    downloadFile(markdownString, `${comic.topic.replace(/\s+/g, '_')}.md`, 'text/markdown');
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
            <button onClick={onBackToLibrary} className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                <ArrowLeftIcon />
                <span className="ml-2">Back to Library</span>
            </button>
            <div className="flex items-center space-x-2">
                <button onClick={handleExportJson} className="flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <DownloadIcon/> <span className="ml-2">JSON</span>
                </button>
                <button onClick={handleExportMarkdown} className="flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <DownloadIcon/> <span className="ml-2">MD</span>
                </button>
            </div>
        </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{comic.topic}</h2>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-gray-600 dark:text-gray-400">
          <p><strong>Subject:</strong> {comic.subject}</p>
          <p><strong>Ward:</strong> {comic.ward}</p>
          <p><strong>Characters:</strong> {comic.characters.map(c => c.name).join(', ')}</p>
        </div>
        <div className="mt-4 bg-gray-100 dark:bg-gray-700/50 p-4 rounded-md">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">Story Context</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 italic">"{comic.storyState.lastPanelSummary}"</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add New Excerpt</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="new-excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Excerpt Text</label>
            <textarea
              id="new-excerpt"
              value={currentExcerpt}
              onChange={e => setCurrentExcerpt(e.target.value)}
              rows={4}
              placeholder="Enter the next part of your story or medical text here..."
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="text-right">
              <button
                onClick={handleGeneratePanels}
                disabled={isGenerating || !currentExcerpt}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 dark:disabled:bg-gray-600"
              >
                  <SparklesIcon />
                  <span className="ml-2">{isGenerating ? 'Generating Story...' : 'Generate Panels with AI'}</span>
              </button>
          </div>
        </div>
      </div>
      
      {isGenerating && (
        <div className="mt-8 text-center text-gray-600 dark:text-gray-400">
            <p className="text-lg">AI is crafting your story...</p>
            <p className="text-sm">This may take a moment.</p>
        </div>
      )}

      {error && <div className="mt-8 text-center text-red-500 bg-red-100 dark:bg-red-900/50 p-4 rounded-md">{error}</div>}

      {draftPanels.length > 0 && (
        <div className="mt-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Generated Panels (Editable)</h3>
          {draftPanels.map((panel, index) => (
            <PanelForm key={panel.id} comic={comic} panelNumber={comic.panels.length + index + 1} initialData={panel} onSave={handleSavePanel} />
          ))}
          <div className="text-center mt-6">
            <button
                onClick={handleFinishExcerpt}
                className="inline-flex justify-center py-3 px-8 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
                Finish Excerpt & Save Panels
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PanelBuilder;
