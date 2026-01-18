import { IsString, IsInt, IsEnum, IsArray, ValidateNested, IsOptional, Min, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

// Enums
export enum PageType {
    Definition = 'definition',
    Practice = 'practice',
}

// Sub-DTOs for practice pages
export class PracticeScenarioDTO {
    @IsString()
    context: string;

    @IsString()
    description: string;

    @IsString()
    @IsOptional()
    imageUrl?: string;
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
    toneTag?: string;
}

export class AppropriateResponseDTO {
    @IsString()
    description: string;

    @IsArray()
    @IsString({ each: true })
    keyElements: string[];
}

// Flat Page DTO - matches MongoDB schema exactly
export class LessonPageDTO {
    @IsEnum(PageType)
    pageType: PageType;

    @IsInt()
    pageOrder: number;

    // Definition page fields (present when pageType === 'definition')
    @IsString()
    @IsOptional()
    term?: string;

    @IsString()
    @IsOptional()
    definition?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    visualCues?: string[];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    toneCues?: string[];

    // Practice page fields (present when pageType === 'practice')
    @ValidateNested()
    @IsOptional()
    @Type(() => PracticeScenarioDTO)
    scenario?: PracticeScenarioDTO;

    @ValidateNested()
    @IsOptional()
    @Type(() => AudioSampleDTO)
    audioSample?: AudioSampleDTO;

    @IsString()
    @IsOptional()
    transcript?: string;

    @ValidateNested()
    @IsOptional()
    @Type(() => AppropriateResponseDTO)
    appropriateResponse?: AppropriateResponseDTO;
}

// Main Lesson DTO
export class CreateLessonDTO {
    @IsString()
    lessonId: string;

    @IsInt()
    @Min(1)
    lessonNumber: number;

    @IsString()
    lessonName: string;

    @IsString()
    @IsOptional()
    difficulty?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LessonPageDTO)
    pages: LessonPageDTO[];
}
