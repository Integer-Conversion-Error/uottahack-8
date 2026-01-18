import { IsString, IsInt, IsEnum, IsNumber, ValidateNested, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSessionDTO {
    @IsString()
    @IsOptional()
    userId?: string; // Optional for single-user mode (defaults to generic user)

    @IsString()
    @IsOptional()
    lessonId?: string;

    @IsString()
    @IsOptional()
    scenarioId?: string;

    @IsEnum(['practice', 'retry', 'assessment'])
    @IsOptional()
    sessionType?: 'practice' | 'retry' | 'assessment';

    @IsEnum(['beginner', 'intermediate', 'advanced'])
    @IsOptional()
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export class AnalysisFeedbackDTO {
    @IsString()
    score: string; // "Good", "Needs Improvement"

    @IsString()
    feedback: string;
}

export class PracticeAnalysisDTO {
    @IsNumber()
    rawScore: number;

    @ValidateNested()
    @Type(() => AnalysisFeedbackDTO)
    facial_expression: AnalysisFeedbackDTO;

    @ValidateNested()
    @Type(() => AnalysisFeedbackDTO)
    eye_contact: AnalysisFeedbackDTO;

    @ValidateNested()
    @Type(() => AnalysisFeedbackDTO)
    body_language: AnalysisFeedbackDTO;

    @ValidateNested()
    @Type(() => AnalysisFeedbackDTO)
    tone: AnalysisFeedbackDTO;
}

export class SubmitPracticeResultDTO {
    @IsInt()
    practiceIndex: number;

    @IsString()
    scenarioContext: string;

    @IsString()
    transcript: string; // User's spoken text

    @IsString()
    @IsOptional()
    videoUrl?: string;

    @IsNumber()
    durationSeconds: number;

    @ValidateNested()
    @Type(() => PracticeAnalysisDTO)
    analysis: PracticeAnalysisDTO;
}

export class SessionResponseDTO {
    @IsString()
    _id: string;

    @IsString()
    userId: string;

    @IsEnum(['in-progress', 'completed'])
    status: 'in-progress' | 'completed';
}
