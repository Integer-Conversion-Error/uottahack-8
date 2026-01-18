import { IsString, IsBoolean, IsEnum, IsArray, IsOptional } from 'class-validator';

export class UpdatePreferencesDTO {
    @IsBoolean()
    @IsOptional()
    voiceFeedback?: boolean;

    @IsBoolean()
    @IsOptional()
    liveTranscription?: boolean;

    @IsEnum(['beginner', 'intermediate', 'advanced'])
    @IsOptional()
    difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    focusAreas?: string[];
}
