# Audio Generation Integration Guide

This guide explains how to integrate the backend's tone-aware audio generation into the frontend application.

## Overview

The backend provides a smart caching endpoint `POST /api/audio/get-or-create`. 
- **On Demand**: If the audio file for a specific lesson page does not exist, it generates it using ElevenLabs + Gemini (for tone).
- **Cached**: If the file already exists, it streams it immediately, saving costs and latency.
- **Easy**: The frontend doesn't need to know if the file exists or not; it just requests it.

## API Endpoint

**URL**: `POST /api/audio/get-or-create`

**Body (`application/json`)**:
```json
{
  "lessonId": "lesson-sarcasm-001",    // Required: Unique lesson ID
  "pageOrder": 1,                      // Required: Page index (used for filename)
  "text": "Oh, absolutely lovely weather...", // Required: The text to speak
  "tonalPrompt": "[Sarcastic] ...",    // Optional: Pre-defined tone tag from lesson JSON
  "voiceId": "21m00Tcm4TlvDq8ikWAM",   // Optional: Defaults to Rachel
  "tone": "Sarcastic"                  // Optional: Fallback tone if no tonalPrompt
}
```

**Response**:
- Returns the binary `.mp3` file stream directly.

## Frontend Integration (React Example)

You can create a reusable hook or utility function to fetch and play the audio.

### `playLessonAudio` Utility

```javascript
export const playLessonAudio = async (lessonId, page, text, tonalPrompt) => {
  try {
    const response = await fetch('http://localhost:4000/api/audio/get-or-create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lessonId,
        pageOrder: page.pageOrder,
        text,
        tonalPrompt,
      }),
    });

    if (!response.ok) throw new Error('Failed to fetch audio');

    // Convert response to Blob and play
    const blob = await response.blob();
    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);
    
    audio.play();
    return audio; // Return instance if you need to pause/stop later

  } catch (error) {
    console.error("Audio playback error:", error);
  }
};
```

### Usage in Component

```javascript
// Inside your Lesson Page component
const handlePlayAudio = () => {
    playLessonAudio(
        lesson.lessonId, 
        currentPage, 
        currentPage.transcript, 
        currentPage.audioSample?.tonalPrompt
    );
};

return (
    <button onClick={handlePlayAudio}>
        Play Audio Sample
    </button>
);
```

## How it works for ALL lessons

Since the endpoint relies on `lessonId` and `pageOrder` to name the files (e.g., `audio/lesson-sarcasm-001_1.mp3`), it automatically scales to any new lesson content you add. 
1. Add new JSON to `frontend/data`.
2. Frontend renders it.
3. User clicks "Play".
4. Backend generates and caches the new file automatically.
