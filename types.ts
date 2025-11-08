export type View = 'library' | 'builder';

export type GenerationPhase = 
  | 'start' 
  | 'arc_proposal_pending'
  | 'arc_proposal_review'
  | 'episode_writing_pending'
  | 'episode_review'
  | 'panel_breakdown_pending'
  | 'panel_breakdown_review'
  | 'complete';

export interface Episode {
  id: string;
  episodeNumber: number;
  topic: string;
  createdAt: string;
  generationPhase: GenerationPhase;

  // AI interaction history
  history: { role: 'user' | 'model'; parts: { text: string }[] }[];

  // Stored artifacts from the conversation
  textbookContent?: string;
  storyArcProposal?: string;
  fullEpisodeScript?: string;
  characterDatabaseUpdate?: string;
  panelBreakdown?: string;
}
