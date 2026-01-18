// Enums
export enum PageType {
    Definition = 'definition',
    Practice = 'practice',
}

// Sub-types for practice pages
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

// Flat Page structure - matches MongoDB schema exactly
export interface LessonPageDTO {
    _id?: string;
    pageType: 'definition' | 'practice';
    pageOrder: number;

    // Definition page fields (present when pageType === 'definition')
    term?: string;
    definition?: string;
    visualCues?: string[];
    toneCues?: string[];

    // Practice page fields (present when pageType === 'practice')
    scenario?: PracticeScenarioDTO;
    audioSample?: AudioSampleDTO;
    transcript?: string;
    appropriateResponse?: AppropriateResponseDTO;
}

// Main Lesson DTO
export interface CreateLessonDTO {
    _id?: string;
    lessonId: string;
    lessonNumber: number;
    lessonName: string;
    difficulty?: string;
    pages: LessonPageDTO[];
}
