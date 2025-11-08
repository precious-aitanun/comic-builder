import React, { useState, useEffect } from 'react';
import { useEpisodes } from './hooks/useComics';
import { Episode, View } from './types';
import { Header } from './components/Header';
import Library from './components/Library';
import EpisodeBuilder from './components/PanelBuilder';

function App() {
  const { episodes, loading, addEpisode, updateEpisode, deleteEpisode, getEpisodeById, clearAllEpisodes } = useEpisodes();
  const [currentView, setCurrentView] = useState<View>('library');
  const [currentEpisodeId, setCurrentEpisodeId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem('zenith_theme');
    if (storedTheme === 'dark' || (storedTheme === null && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('zenith_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('zenith_theme', 'light');
      }
      return newMode;
    });
  };

  const handleCreateEpisode = (topic: string, textbookContent: string, creativeDirection: string) => {
    const newEpisode = addEpisode(topic, textbookContent, creativeDirection);
    setCurrentEpisodeId(newEpisode.id);
    setCurrentView('builder');
  };
  
  const handleContinueEpisode = (episodeId: string) => {
    setCurrentEpisodeId(episodeId);
    setCurrentView('builder');
  };

  const handleNavigate = (view: View) => {
    if (view !== 'builder') {
      setCurrentEpisodeId(null);
    }
    setCurrentView(view);
  }

  const currentEpisode = getEpisodeById(currentEpisodeId);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Header 
        currentView={currentView} 
        onNavigate={handleNavigate}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        clearAllData={clearAllEpisodes}
      />
      <main>
        {loading ? (
          <div className="flex justify-center items-center h-64">Loading Episodes...</div>
        ) : (
          <>
            {currentView === 'library' && <Library episodes={episodes} onContinue={handleContinueEpisode} onDelete={deleteEpisode} onCreateEpisode={handleCreateEpisode} />}
            {currentView === 'builder' && currentEpisode && (
              <EpisodeBuilder 
                episode={currentEpisode} 
                onUpdateEpisode={updateEpisode} 
                onBackToLibrary={() => handleNavigate('library')}
              />
            )}
             {currentView === 'builder' && !currentEpisode && (
                <div className="text-center p-8">
                    <h2 className="text-2xl font-bold">No episode selected.</h2>
                    <button onClick={() => handleNavigate('library')} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md">Go to Library</button>
                </div>
             )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
