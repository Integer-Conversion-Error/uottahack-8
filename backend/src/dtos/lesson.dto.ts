import { IsString, IsInt, IsEnum, IsArray, ValidateNested, IsOptional, Min, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

// Enums
export enum PageType {
    Loading = 'loading',
    Definition = 'definition',
    Practice = 'practice',
    Results = 'results'
}

// Sub-DTOs
export class DefinitionPageContentDTO {
    @IsString()
    term: string;

    @IsString()
    definition: string;

    @IsArray()
    @IsString({ each: true })
    visualCues: string[];

    @IsArray()
    @IsString({ each: true })
    toneCues: string[];
}

export class PracticeScenarioDTO {
    @IsString()
    context: string;

    @IsString()
    description: string;
}

export class AudioSampleDTO {
    @IsString()
    url: string;

    @IsNumber()
    duration: number;

    @IsString()
    @IsOptional()
    tonalPrompt?: string;

    @IsString()
    @IsOptional()
    toneTag?: string; // e.g. [Sarcastic]
}

export class AppropriateResponseDTO {
    @IsString()
    description: string;

    @IsArray()
    @IsString({ each: true })
    keyElements: string[];
}

export class PracticePageContentDTO {
    @ValidateNested()
    @Type(() => PracticeScenarioDTO)
    scenario: PracticeScenarioDTO;

    @ValidateNested()
    @Type(() => AudioSampleDTO)
    audioSample: AudioSampleDTO;

    @IsString()
    transcript: string;

    @ValidateNested()
    @Type(() => AppropriateResponseDTO)
    appropriateResponse: AppropriateResponseDTO;
}

// Main Page DTO
export class LessonPageDTO {
    @IsEnum(PageType)
    pageType: PageType;

    @IsInt()
    pageOrder: number;

    // Content fields are optional based on pageType
    @ValidateNested()
    @IsOptional()
    @Type(() => DefinitionPageContentDTO)
    definition?: DefinitionPageContentDTO;

    @ValidateNested()
    @IsOptional()
    @Type(() => PracticePageContentDTO)
    practice?: PracticePageContentDTO;
}

// Main Lesson DTO
export class CreateLessonDTO {
    @IsString()
    lessonId: string; // e.g., "sarcasm-101"

    @IsInt()
    @Min(1)
    lessonNumber: number;

    @IsString()
    lessonName: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LessonPageDTO)
    pages: LessonPageDTO[];
}
