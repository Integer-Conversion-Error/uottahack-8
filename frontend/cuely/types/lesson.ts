export type HUDMetric = {
  type: 'tone' | 'face' | 'context' | 'pace';
  value: string;
  label: string;
};

export type VideoScene = {
  id: string;
  title: string;
  description: string;
  videoUrl?: string; // In demo, we'll simulate with text
  hudMetrics: HUDMetric[];
  explanation: string;
};

export type ChallengeOption = {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback: string;
};

export type ResponseOption = {
  id: string;
  text: string;
  feedback: string;
  type: 'acknowledge' | 'check' | 'solve';
};

export type LessonStep = 
  | { type: 'intro'; title: string; content: string }
  | { type: 'video'; sceneA: VideoScene; sceneB: VideoScene }
  | { type: 'challenge'; question: string; options: ChallengeOption[] }
  | { type: 'practice'; scenario: string; options: ResponseOption[] }
  | { type: 'recap'; points: string[] };