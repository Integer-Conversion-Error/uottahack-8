export enum PageType {
    Loading = 'loading',
    Definition = 'definition',
    Practice = 'practice',
    Results = 'results'
}

export interface DefinitionPageContentDTO {
    term: string;
    definition: string;
    visualCues: string[];
    toneCues: string[];
}

export interface PracticeScenarioDTO {
    context: string;
    description: string;
    imageUrl?: string;
}

export interface AudioSampleDTO {
    url: string;
    duration: number;
    tonalPrompt?: string;
    toneTag?: string;
}

export interface AppropriateResponseDTO {
    description: string;
    keyElements: string[];
}

export interface PracticePageContentDTO {
    scenario: PracticeScenarioDTO;
    audioSample: AudioSampleDTO;
    transcript: string;
    appropriateResponse: AppropriateResponseDTO;
}

export interface LessonPageDTO {
    pageType: PageType;
    pageOrder: number;
    definition?: DefinitionPageContentDTO;
    practice?: PracticePageContentDTO;
}

export interface CreateLessonDTO {
    lessonId: string;
    lessonNumber: number;
    lessonName: string;
    pages: LessonPageDTO[];
}
