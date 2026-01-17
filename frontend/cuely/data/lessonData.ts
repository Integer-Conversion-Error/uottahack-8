import { LessonStep } from '@/types/lesson';

export const lessonSteps: LessonStep[] = [
  {
    type: 'intro',
    title: "That Sounds *Great*: Recognizing Sarcasm",
    content: "Sarcasm is when someone says the opposite of what they mean, usually to be funny, make a point, or express frustration. It relies heavily on tone of voice, facial expressions, and context."
  },
  {
    type: 'video',
    sceneA: {
      id: 'genuine',
      title: 'Genuine Meaning',
      description: 'Person smiles brightly, light tone, slightly relieved sigh.',
      hudMetrics: [
        { type: 'tone', value: 'Genuine/Relieved', label: 'Warm and positive tone' },
        { type: 'face', value: '😊', label: 'Consistent smile' },
        { type: 'context', value: 'Receiving Help', label: 'Positive situation' }
      ],
      explanation: "Here, the words match the situation. Tone is light, expression is positive. They mean it literally."
    },
    sceneB: {
      id: 'sarcastic',
      title: 'Sarcastic Meaning',
      description: 'Person rolls eyes, tone is flat/dry, makes exasperated gesture as coffee spills.',
      hudMetrics: [
        { type: 'tone', value: 'Sarcastic/Dry', label: 'Flat, exaggerated tone' },
        { type: 'face', value: '😐', label: 'Neutral with eye roll' },
        { type: 'context', value: 'Minor Frustration', label: 'Negative situation' }
      ],
      explanation: "The tone is flat, the eye roll is a classic clue. The words are positive but the situation is negative. This is sarcasm."
    }
  },
  {
    type: 'challenge',
    question: "Audio: 'Wow, you're a *real* genius.' Is this more likely to be:",
    options: [
      {
        id: 'option1',
        text: 'Said to a friend who just solved a difficult puzzle?',
        isCorrect: false,
        feedback: 'Let\'s see why this might be sarcasm. The exaggerated emphasis on "real genius" in a negative situation points to sarcasm. A genuine compliment would have a warmer tone.'
      },
      {
        id: 'option2',
        text: 'Said to someone who forgot their keys for the third time this week?',
        isCorrect: true,
        feedback: 'Correct! The exaggerated emphasis on "real genius" in a negative situation points to sarcasm. Good spotting!'
      }
    ]
  },
  {
    type: 'practice',
    scenario: 'Your coworker says after a messy, failed group presentation: "Well, that was a *smashing* success." Their tone is flat, arms are crossed.',
    options: [
      {
        id: 'resp1',
        text: 'Ugh, tell me about it. What a disaster.',
        type: 'acknowledge',
        feedback: 'Good for showing solidarity! This acknowledges the shared frustration behind the sarcasm.'
      },
      {
        id: 'resp2',
        text: 'I\'m sensing some sarcasm... you\'re pretty frustrated, huh?',
        type: 'check',
        feedback: 'Excellent approach! Gently checking intent shows you\'re tuned in to the emotional subtext.'
      },
      {
        id: 'resp3',
        text: 'Yeah, that didn\'t go as planned. Want to debrief on what went wrong?',
        type: 'solve',
        feedback: 'Good pivot to problem-solving! This addresses the real issue while moving forward constructively.'
      }
    ]
  },
  {
    type: 'recap',
    points: [
      'Mismatch: Words and situation/tone don\'t align.',
      'Exaggeration: Over-the-top word choice ("perfect", "fantastic" disaster).',
      'Non-Verbal Cues: Eye rolls, flat tone, deadpan expression.'
    ]
  }
];