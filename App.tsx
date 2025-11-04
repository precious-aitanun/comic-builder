import React, { useState, useEffect } from 'react';
import { useComics } from './hooks/useComics';
import { Comic, View } from './types';
import { Header } from './components/Header';
import Dashboard from './components/Dashboard';
import Library from './components/Library';
import PanelBuilder from './components/PanelBuilder';

function App() {
  const { comics, loading, addComic, updateComic, deleteComic, getComicById, clearAllComics } = useComics();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [currentComicId, setCurrentComicId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem('zenith_theme');
    if (storedTheme === 'dark') {
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

  const handleStartComic = async (newComicData: Omit<Comic, 'id' | 'storyState' | 'panels' | 'progress' | 'createdAt' | 'styleGuidePrompt'>, initialExcerpt: string) => {
    const newComic = await addComic(newComicData, initialExcerpt);
    setCurrentComicId(newComic.id);
    setCurrentView('builder');
  };
  
  const handleContinueComic = (comicId: string) => {
    setCurrentComicId(comicId);
    setCurrentView('builder');
  };

  const handleNavigate = (view: View) => {
    if (view !== 'builder') {
      setCurrentComicId(null);
    }
    setCurrentView(view);
  }

  const currentComic = getComicById(currentComicId);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Header 
        currentView={currentView} 
        onNavigate={handleNavigate}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        clearAllData={clearAllComics}
      />
      <main>
        {loading ? (
          <div className="flex justify-center items-center h-64">Loading...</div>
        ) : (
          <>
            {currentView === 'dashboard' && <Dashboard onStartComic={handleStartComic} />}
            {currentView === 'library' && <Library comics={comics} onContinue={handleContinueComic} onDelete={deleteComic} onNavigateToDashboard={() => setCurrentView('dashboard')} />}
            {currentView === 'builder' && currentComic && (
              <PanelBuilder 
                comic={currentComic} 
                onUpdateComic={updateComic} 
                onBackToLibrary={() => handleNavigate('library')}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
