import React, { useState, useEffect, useRef } from 'react';
import { Episode } from '../types';
import { ArrowLeftIcon, SparklesIcon } from './Icons';
import { continueEpisodeGeneration } from '../services/geminiService';
import { downloadFile } from '../utils/helpers';

interface EpisodeBuilderProps {
  episode: Episode;
  onUpdateEpisode: (updatedEpisode: Episode) => void;
  onBackToLibrary: () => void;
}

const LoadingIndicator: React.FC<{ text: string }> = ({ text }) => (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">{text}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">This may take a moment...</p>
    </div>
);

const EpisodeBuilder: React.FC<EpisodeBuilderProps> = ({ episode, onUpdateEpisode, onBackToLibrary }) => {
    const [userInput, setUserInput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [episode.history]);

    const handleInitialGeneration = async () => {
        const initialPrompt = `
EPISODE REQUEST

Episode Number: ${episode.episodeNumber}
Topic: ${episode.topic}

Textbook Content:
---
${episode.textbookContent}
---

Generate story arc proposal first.
`;
        await advanceState('arc_proposal_pending', initialPrompt);
    };

    useEffect(() => {
        if (episode.generationPhase === 'start' && episode.history.length === 0) {
            handleInitialGeneration();
        }
    }, [episode]);

    const advanceState = async (nextPhase: Episode['generationPhase'], prompt: string) => {
        setError(null);
        let updatedEpisode = { ...episode, generationPhase: nextPhase };
        onUpdateEpisode(updatedEpisode);

        try {
            const modelResponse = await continueEpisodeGeneration(updatedEpisode, prompt);

            const newHistory = [
                ...updatedEpisode.history,
                { role: 'user' as const, parts: [{ text: prompt }] },
                { role: 'model' as const, parts: [{ text: modelResponse }] },
            ];

            let finalEpisodeState: Episode = { ...updatedEpisode, history: newHistory };
            
            // Logic to transition to the next review phase
            switch(nextPhase) {
                case 'arc_proposal_pending':
                    finalEpisodeState.generationPhase = 'arc_proposal_review';
                    finalEpisodeState.storyArcProposal = modelResponse;
                    break;
                case 'episode_writing_pending':
                    finalEpisodeState.generationPhase = 'episode_review';
                    // Simple parsing assuming "CHARACTER DATABASE UPDATE" is the separator
                    const scriptEndMarker = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📊 CHARACTER DATABASE UPDATE';
                    const dbUpdateIndex = modelResponse.lastIndexOf(scriptEndMarker);
                    if (dbUpdateIndex !== -1) {
                        finalEpisodeState.fullEpisodeScript = modelResponse.substring(0, dbUpdateIndex);
                        finalEpisodeState.characterDatabaseUpdate = modelResponse.substring(dbUpdateIndex);
                    } else {
                        finalEpisodeState.fullEpisodeScript = modelResponse; // Fallback
                    }
                    break;
                case 'panel_breakdown_pending':
                    finalEpisodeState.generationPhase = 'panel_breakdown_review';
                    finalEpisodeState.panelBreakdown = modelResponse;
                    break;
            }
            onUpdateEpisode(finalEpisodeState);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(errorMessage);
            onUpdateEpisode({ ...episode, generationPhase: 'arc_proposal_review' }); // Revert to a stable state
        }
    };

    const handleUserResponse = async () => {
        if (!userInput.trim()) return;

        let nextPhase: Episode['generationPhase'] | null = null;
        if (episode.generationPhase === 'arc_proposal_review') {
            nextPhase = 'episode_writing_pending';
        } else if (episode.generationPhase === 'episode_review') {
            if (userInput.toLowerCase().includes('generate panels')) {
                nextPhase = 'panel_breakdown_pending';
            }
        }
        
        if (nextPhase) {
            await advanceState(nextPhase, userInput);
            setUserInput('');
        }
    };

    const renderContent = () => {
        return (
            <div className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none space-y-4 whitespace-pre-wrap font-mono p-4 bg-gray-100 dark:bg-gray-900 rounded-md">
                {episode.history.map((turn, index) => (
                    <div key={index}>
                        <h4 className={`font-bold ${turn.role === 'user' ? 'text-primary-600' : 'text-gray-800 dark:text-gray-200'}`}>
                            {turn.role === 'user' ? 'You' : 'AI Writer'}
                        </h4>
                        <p>{turn.parts[0].text}</p>
                    </div>
                ))}
            </div>
        );
    }
    
    const renderUserInput = () => {
        let placeholder = "Type your feedback or approval...";
        let buttonText = "Send";
        if (episode.generationPhase === 'arc_proposal_review') {
             placeholder = `Type "Write it", "Looks good", or request changes...`;
             buttonText = "Approve & Write Episode";
        } else if (episode.generationPhase === 'episode_review') {
             placeholder = `Type "Generate panels" to get the comic breakdown...`;
             buttonText = "Generate Panels";
        }

        return (
             <div className="mt-6 flex gap-4">
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleUserResponse()}
                    placeholder={placeholder}
                    className="flex-grow w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
                <button
                    onClick={handleUserResponse}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                    <SparklesIcon/>
                    <span className="ml-2">{buttonText}</span>
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-8">
            <div className="flex justify-between items-center mb-6">
                <button onClick={onBackToLibrary} className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                    <ArrowLeftIcon />
                    <span className="ml-2">Back to Library</span>
                </button>
                <div className="flex gap-2">
                    {episode.fullEpisodeScript && <button onClick={() => downloadFile(episode.fullEpisodeScript || '', `${episode.topic}_script.txt`, 'text/plain')} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">Download Script</button>}
                    {episode.panelBreakdown && <button onClick={() => downloadFile(episode.panelBreakdown || '', `${episode.topic}_panels.txt`, 'text/plain')} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">Download Panels</button>}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Episode {episode.episodeNumber}: {episode.topic}</h2>
            </div>
            
            <div className="space-y-6">
                {renderContent()}

                {episode.generationPhase === 'arc_proposal_pending' && <LoadingIndicator text="Generating Story Arc Proposal..." />}
                {episode.generationPhase === 'episode_writing_pending' && <LoadingIndicator text="Writing Full Episode..." />}
                {episode.generationPhase === 'panel_breakdown_pending' && <LoadingIndicator text="Generating Panel Breakdown..." />}
                
                {error && <div className="mt-4 text-center text-red-500 bg-red-100 dark:bg-red-900/50 p-4 rounded-md">{error}</div>}
                
                {(episode.generationPhase === 'arc_proposal_review' || episode.generationPhase === 'episode_review') && renderUserInput()}
            </div>
            <div ref={bottomRef} />
        </div>
    );
};

export default EpisodeBuilder;
