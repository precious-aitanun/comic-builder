
import React from 'react';
import { View } from '../types';
import { SunIcon, MoonIcon } from './Icons';

interface HeaderProps {
  currentView: View;
  onNavigate: (view: View) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  clearAllData: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, isDarkMode, toggleDarkMode, clearAllData }) => {
  const NavButton: React.FC<{ view: View; label: string }> = ({ view, label }) => (
    <button
      onClick={() => onNavigate(view)}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        currentView === view
          ? 'bg-primary-500 text-white'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {label}
    </button>
  );

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to delete all comic data? This action cannot be undone.')) {
        clearAllData();
    }
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">Zenith Comic Builder</h1>
            <nav className="hidden md:flex ml-10 space-x-4">
              <NavButton view="dashboard" label="Dashboard" />
              <NavButton view="library" label="Library" />
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleClearData}
              className="px-3 py-2 rounded-md text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
            >
              Clear All Data
            </button>
            <button onClick={toggleDarkMode} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              {isDarkMode ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
