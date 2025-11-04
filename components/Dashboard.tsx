
import React, { useState } from 'react';
import { Character } from '../types';
import { PREDEFINED_CHARACTERS } from '../constants/characters';
import { PlusIcon, TrashIcon } from './Icons';

interface DashboardProps {
  onStartComic: (
    newComicData: Omit<
      import('../types').Comic,
      'id' | 'storyState' | 'panels' | 'progress' | 'createdAt'
    >,
    initialExcerpt: string
  ) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onStartComic }) => {
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [ward, setWard] = useState('');
  const [characters, setCharacters] = useState<Character[]>([PREDEFINED_CHARACTERS[0], PREDEFINED_CHARACTERS[1]]);
  const [initialExcerpt, setInitialExcerpt] = useState('');
  
  const [newCharName, setNewCharName] = useState('');
  const [newCharDesc, setNewCharDesc] = useState('');

  const handleAddCharacter = (char: Character) => {
    if (char.name && !characters.some(c => c.name === char.name)) {
        setCharacters([...characters, char]);
    }
  };
  
  const handleAddNewCustomCharacter = () => {
    if (newCharName && !characters.some(c => c.name === newCharName)) {
        setCharacters([...characters, {name: newCharName, description: newCharDesc}]);
        setNewCharName('');
        setNewCharDesc('');
    }
  }

  const handleRemoveCharacter = (charName: string) => {
    setCharacters(characters.filter(c => c.name !== charName));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !topic || !ward || characters.length < 1 || !initialExcerpt) {
      alert('Please fill in all fields to start a new comic.');
      return;
    }
    onStartComic({ subject, topic, ward, characters }, initialExcerpt);
  };

  const availableChars = PREDEFINED_CHARACTERS.filter(pc => !characters.some(c => c.name === pc.name));

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white">Create a New Medical Comic</h2>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          Transform complex medical scenarios into engaging, easy-to-understand comic strips with the power of AI.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">1. Story Setup</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
              <input type="text" id="subject" value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g., Cardiology" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
            </div>
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Topic</label>
              <input type="text" id="topic" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g., Managing Acute Myocardial Infarction" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="ward" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ward / Setting</label>
              <input type="text" id="ward" value={ward} onChange={e => setWard(e.target.value)} placeholder="e.g., Emergency Department" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">2. Characters</h3>
          <div className="space-y-4">
            {characters.map(char => (
              <div key={char.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{char.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{char.description}</p>
                </div>
                <button type="button" onClick={() => handleRemoveCharacter(char.name)} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"><TrashIcon /></button>
              </div>
            ))}
             <div className="pt-4 space-y-3">
                <h4 className="font-medium text-gray-700 dark:text-gray-300">Add Characters</h4>
                <div className="flex flex-wrap gap-2">
                    {availableChars.map(char => (
                        <button key={char.name} type="button" onClick={() => handleAddCharacter(char)} className="flex items-center px-2 py-1 bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 rounded-full text-sm hover:bg-primary-200 dark:hover:bg-primary-900">
                           <PlusIcon/> <span className="ml-1">{char.name}</span>
                        </button>
                    ))}
                </div>
                 <div className="flex items-end gap-4 pt-2">
                    <div className="flex-grow">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Custom Character Name</label>
                        <input value={newCharName} onChange={e => setNewCharName(e.target.value)} placeholder="e.g., Paramedic Rishi" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"/>
                    </div>
                    <div className="flex-grow">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                        <input value={newCharDesc} onChange={e => setNewCharDesc(e.target.value)} placeholder="Brief role description" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"/>
                    </div>
                    <button type="button" onClick={handleAddNewCustomCharacter} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 h-10">Add</button>
                </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">3. Initial Excerpt</h3>
          <div>
            <label htmlFor="initial-excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Paste the first piece of text to turn into comic panels.
            </label>
            <textarea
              id="initial-excerpt"
              value={initialExcerpt}
              onChange={e => setInitialExcerpt(e.target.value)}
              rows={6}
              placeholder="e.g., A 65-year-old male arrives in the ED with crushing chest pain radiating to his left arm. He is diaphoretic and short of breath. Nurse Jamie immediately connects him to a cardiac monitor..."
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div className="pt-5">
          <div className="flex justify-end">
            <button
              type="submit"
              className="w-full md:w-auto inline-flex justify-center py-3 px-8 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Start Building Comic
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Dashboard;
