export interface Character {
  name: string;
  description: string;
}

export interface DialogueLine {
  character: string;
  line: string;
}

export interface Panel {
  id: string;
  observation: string;
  reasoning: string;
  action: string;
  expectation: string;
  visualDescription: string;
  caption: string;
  dialogue: DialogueLine[];
  suggestions: string;
  imageGenerationPrompt?: string;
}

export interface StoryState {
  lastPanelSummary: string;
  completedExcerpts: number;
}

export interface Comic {
  id: string;
  subject: string;
  topic: string;
  ward: string;
  characters: Character[];
  styleGuidePrompt: string;
  storyState: StoryState;
  panels: Panel[];
  progress: number;
  createdAt: string;
}

export type View = 'dashboard' | 'library' | 'builder';

export type AIPanelData = Omit<Panel, 'id' | 'imageGenerationPrompt'>;
