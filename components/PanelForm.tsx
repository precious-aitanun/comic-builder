import React, { useState, useEffect } from 'react';
import { Panel, DialogueLine, Comic, AIPanelData } from '../types';
import { TrashIcon, SparklesIcon, PencilIcon } from './Icons';
import { regeneratePanelField } from '../services/geminiService';
import { generateImagePromptForPanel, generateEditedImagePromptForPanel } from '../utils/helpers';


interface PanelFormProps {
    panelNumber: number;
    initialData: Panel;
    onSave: (updatedPanel: Panel) => void;
    comic: Comic;
}

const PanelForm: React.FC<PanelFormProps> = ({ panelNumber, initialData, onSave, comic }) => {
    const [panel, setPanel] = useState<Panel>(initialData);
    const [regeneratingField, setRegeneratingField] = useState<string | null>(null);
    const [editInstruction, setEditInstruction] = useState('');


    useEffect(() => {
        setPanel(initialData);
    }, [initialData]);

    const handleSave = (updatedPanel: Panel) => {
        setPanel(updatedPanel);
        onSave(updatedPanel);
    }

    const handleChange = (field: keyof Omit<Panel, 'dialogue' | 'id'>, value: string) => {
        handleSave({ ...panel, [field]: value });
    };
    
    const handleDialogueChange = (index: number, field: keyof DialogueLine, value: string) => {
        const newDialogue = [...panel.dialogue];
        newDialogue[index] = { ...newDialogue[index], [field]: value };
        handleSave({ ...panel, dialogue: newDialogue });
    };

    const addDialogueLine = () => {
        const newDialogue = [...panel.dialogue, { character: comic.characters[0]?.name || '', line: '' }];
        handleSave({ ...panel, dialogue: newDialogue });
    };

    const removeDialogueLine = (index: number) => {
        const newDialogue = panel.dialogue.filter((_, i) => i !== index);
        handleSave({ ...panel, dialogue: newDialogue });
    };

    const handleRegenerateField = async (field: keyof Omit<AIPanelData, 'dialogue'>) => {
        setRegeneratingField(field);
        try {
            const newContent = await regeneratePanelField(comic, panel, field);
            handleChange(field, newContent);
        } catch (error) {
            console.error(`Failed to regenerate ${field}`, error);
            alert(`An error occurred while regenerating the ${field}. Please check the console.`);
        } finally {
            setRegeneratingField(null);
        }
    };

    const handleGeneratePrompt = () => {
        const prompt = generateImagePromptForPanel(panel);
        handleSave({ ...panel, imageGenerationPrompt: prompt });
    };
    
    const handleEditPrompt = () => {
        if (!panel.imageGenerationPrompt || !editInstruction) {
            alert("A prompt must be generated and an edit instruction provided.");
            return;
        }
        const newPrompt = generateEditedImagePromptForPanel(panel.imageGenerationPrompt, editInstruction);
        handleSave({ ...panel, imageGenerationPrompt: newPrompt });
        setEditInstruction('');
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            alert('Prompt copied to clipboard!');
        }, (err) => {
            console.error('Could not copy text: ', err);
            alert('Failed to copy prompt.');
        });
    };

    const FormTextArea: React.FC<{label: string, field: keyof Omit<AIPanelData, 'dialogue'>, rows?: number, placeholder?: string}> = ({label, field, rows=2, placeholder=""}) => (
         <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
            <div className="flex items-center space-x-2">
                <textarea
                    value={panel[field]}
                    onChange={e => handleChange(field, e.target.value)}
                    rows={rows}
                    placeholder={placeholder}
                    className="flex-grow px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:text-gray-100"
                />
                <button
                    type="button"
                    onClick={() => handleRegenerateField(field)}
                    disabled={!!regeneratingField}
                    title={`Regenerate ${label}`}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                    {regeneratingField === field ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div> : <SparklesIcon />}
                </button>
            </div>
        </div>
    );

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6 border border-gray-200 dark:border-gray-700">
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Panel {panelNumber}</h4>
            
            {/* Image Prompt Section */}
            <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image Generation Prompt</label>
                 {panel.imageGenerationPrompt ? (
                    <div className="relative">
                        <textarea
                            readOnly
                            value={panel.imageGenerationPrompt}
                            className="w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-sm font-mono text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600"
                        />
                        <button onClick={() => copyToClipboard(panel.imageGenerationPrompt || '')} className="absolute top-2 right-2 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500">Copy</button>
                    </div>
                ) : (
                    <div className="w-full h-32 bg-gray-100 dark:bg-gray-700 flex items-center justify-center rounded-lg">
                        <p className="text-gray-500">Click "Generate Prompt" to create an image prompt.</p>
                    </div>
                )}
                 <div className="mt-4 flex flex-col sm:flex-row gap-2">
                    <button
                        type="button"
                        onClick={handleGeneratePrompt}
                        className="flex-grow inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        <SparklesIcon />
                        <span className="ml-2">{panel.imageGenerationPrompt ? 'Re-generate Prompt' : 'Generate Image Prompt'}</span>
                    </button>
                    {panel.imageGenerationPrompt && (
                        <div className="flex-grow flex space-x-2">
                            <input
                                type="text"
                                value={editInstruction}
                                onChange={(e) => setEditInstruction(e.target.value)}
                                placeholder="e.g., Make the background darker..."
                                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:text-gray-100"
                            />
                            <button
                                type="button"
                                onClick={handleEditPrompt}
                                disabled={!editInstruction}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 dark:disabled:bg-gray-600"
                            >
                                <PencilIcon />
                                <span className="ml-2">Edit Prompt</span>
                            </button>
                        </div>
                    )}
                 </div>
            </div>

            {/* Text Fields Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                   <FormTextArea label="Visual Description" field="visualDescription" rows={3} placeholder="A detailed description for the artist..."/>
                </div>
                 <FormTextArea label="Observation (O)" field="observation" />
                 <FormTextArea label="Reasoning (R)" field="reasoning" />
                 <FormTextArea label="Action (A)" field="action" />
                 <FormTextArea label="Expectation (E)" field="expectation" />
                 <FormTextArea label="Caption" field="caption" placeholder="A short narrative caption (optional)"/>
                 <FormTextArea label="Suggestions / Corrections" field="suggestions" />

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dialogue</label>
                    <div className="space-y-3">
                    {panel.dialogue.map((d, i) => (
                        <div key={i} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                            <select
                                value={d.character}
                                onChange={e => handleDialogueChange(i, 'character', e.target.value)}
                                className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:text-gray-100"
                            >
                                {comic.characters.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                            </select>
                            <input
                                type="text"
                                value={d.line}
                                onChange={e => handleDialogueChange(i, 'line', e.target.value)}
                                placeholder="Character's line"
                                className="flex-grow px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:text-gray-100"
                            />
                            <button type="button" onClick={() => removeDialogueLine(i)} className="text-gray-400 hover:text-red-500"><TrashIcon/></button>
                        </div>
                    ))}
                    <button type="button" onClick={addDialogueLine} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                        + Add Dialogue Line
                    </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PanelForm;
