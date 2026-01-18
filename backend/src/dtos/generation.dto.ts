import { IsString, IsOptional, IsNumber } from 'class-validator';

export class GenerateAudioDTO {
    @IsString()
    text: string;

    @IsString()
    @IsOptional()
    voiceId?: string;

    @IsString()
    @IsOptional()
    toneDescription?: string; // For prompting
}

export class GetLessonAudioDTO {
    @IsString()
    lessonId: string;

    @IsNumber()
    pageOrder: number;

    @IsString()
    @IsOptional()
    voiceId?: string;

    @IsString()
    @IsOptional()
    text?: string;

    @IsString()
    @IsOptional()
    tonalPrompt?: string;

    @IsString()
    @IsOptional()
    tone?: string;
}

export class GenerateImageDTO {
    @IsString()
    prompt: string;

    @IsString()
    @IsOptional()
    context?: string;
}
