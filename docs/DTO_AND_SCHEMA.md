# DTO and Schema Specification

This document defines the TypeScript Data Transfer Objects (DTOs) and interfaces derived from the `lesson_schema.json`. These structures should be used in the backend to ensure type safety and consistency with the generated JSON content.

## Schema Overview

The core data model is a `Lesson`, which contains metadata and a list of `pages`. Pages can be of two types: `DefinitionPage` or `PracticePage`.

## TypeScript Interfaces

### Core Types

```typescript
export type PageType = 'definition' | 'practice';

export interface Lesson {
  lessonId: string;
  lessonNumber: number;
  lessonName: string;
  /**
   * Ordered list of pages in the lesson.
   * Must contain at least 4 pages.
   */
  pages: (DefinitionPage | PracticePage)[];
}
```

### Page Types

#### Definition Page
Used for introducing new terms and concepts.

```typescript
export interface DefinitionPage {
  pageType: 'definition';
  /**
   * Order in the lesson flow (0-based index)
   */
  pageOrder: number;
  /**
   * The term being defined (e.g., 'Sarcasm')
   */
  term: string;
  /**
   * Clear definition of the term
   */
  definition: string;
  /**
   * Visual cues to look for (min 1).
   * Mapped to the `name` field of the `FacialCue` collection.
   */
  visualCues: string[];
  /**
   * Tone and vocal cues to listen for (min 1).
   * Future: Map to `VocalCue` collection/enum.
   */
  toneCues: string[];
}
```

#### Practice Page
Used for interactive scenarios where the user needs to respond.

```typescript
export interface PracticePage {
  pageType: 'practice';
  /**
   * Order in the lesson flow (0-based index)
   */
  pageOrder: number;
  scenario: Scenario;
  audioSample: AudioSample;
  transcript: string;
  appropriateResponse: AppropriateResponse;
}
```

### Sub-objects

#### Scenario
Context for the practice exercise.

```typescript
export interface Scenario {
  /**
   * The situational context for the practice
   */
  context: string;
  /**
   * Additional details about the scenario
   */
  description: string;
}
```

#### Audio Sample
Metadata for the audio clip associated with the practice page.

```typescript
export interface AudioSample {
  /**
   * URL to the audio sample file
   */
  url: string;
  /**
   * Duration of audio in seconds
   */
  duration: number;
  /**
   * Description of the tone for TTS generation
   */
  tonalPrompt?: string; 
  /**
   * A bracketed tone tag (e.g., '[Sarcastic]')
   */
  toneTag?: string;
}
```

#### Appropriate Response
Criteria for evaluating the user's response.

```typescript
export interface AppropriateResponse {
  /**
   * Description of what an appropriate response looks/sounds like
   */
  description: string;
  /**
   * Key elements that should be present in the response
   */
  keyElements: string[];
}
```

## Validation

When consuming JSON data, use a runtime validator like `zod` to ensure it matches these interfaces.

```typescript
// Example Zod Snippet
import { z } from 'zod';

export const DefinitionPageSchema = z.object({
  pageType: z.literal('definition'),
  pageOrder: z.number().int(),
  term: z.string(),
  definition: z.string(),
  visualCues: z.array(z.string()).min(1), // TODO: .refine(val => checkFacialCueExists(val))
  toneCues: z.array(z.string()).min(1),
});

export const PracticePageSchema = z.object({
  pageType: z.literal('practice'),
  pageOrder: z.number().int(),
  // ... maps to PracticePage
});
```

## Backend Implementation Strategy

Integrating these DTOs into the existing backend requires addressing the following areas:

### 1. Model Unification & Schema Enforcement
Currently, there appears to be a conflict between `backend/src/models/Lesson.ts` (standalone model) and `backend/src/models/Module.ts` (which also defines and exports a `Lesson` model). The `Module.ts` version is currently used by controllers and uses a `Mixed` type for `content`.

**Recommended Changes:**
1.  **Resolve Model Conflict**: Consolidate the `Lesson` model definition. If `Module.ts` is the source of truth, `Lesson.ts` should be deprecated or merged.
2.  **Replace `Mixed` Type**: In `Module.ts`, the `content` field is currently `Schema.Types.Mixed`. This should be replaced with a strict Schema that matches the `Lesson` DTO above.
    - *Transition Step*: You can keep `Mixed` temporarily but add a `pre('save')` hook that validates the `content` against the Zod schemas defined above.

### 2. Service Layer Updates
Services that generate or process lessons (e.g., `GeminiService` or seed scripts) must ensure output conforms to these interfaces.
- **Generation**: When generating JSON via Python scripts, the output is already largely compliant.
- **Consumption**: The backend service consuming this JSON should parse it into the `Lesson` DTO.

### 3. API Consistency
The `learning.controller.ts` returns raw Mongoose documents. By enforcing the schema at the database level (or via Zod on write), the API guarantees that the `content` field in the response matches the `Lesson` interface, providing a strictly typed contract for the frontend.
