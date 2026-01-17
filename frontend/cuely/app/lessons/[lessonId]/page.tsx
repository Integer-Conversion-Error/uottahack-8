// app/lessons/[lessonId]/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import DefinitionPage from '@/components/DefinitionPage';
import Image from 'next/image';

interface LessonPageProps {
  params: {
    lessonId: string;
  };
}

type PageType = 'loading' | 'definition' | 'practice' | 'results';

export default function LessonPage({ params }: LessonPageProps) {
  const [currentPage, setCurrentPage] = useState<PageType>('loading');
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (currentPage === 'loading') {
      const tl = gsap.timeline({
        onComplete: () => {
          // Auto-advance to definition page after animation
          setTimeout(() => setCurrentPage('definition'), 1000);
        }
      });

      tl.to(titleRef.current, {
        opacity: 1,
        duration: 1,
        ease: 'power2.inOut'
      })
      .to(descriptionRef.current, {
        opacity: 1,
        duration: 1,
        ease: 'power2.inOut'
      }, '-=0.3');

      return () => {
        tl.kill();
      };
    }
  }, [currentPage]);

  // Mock lesson data - later this would come from your JSON/API
  const lessonData = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "lessonId": "empathy-101-beginner",
  "lessonNumber": 1,
  "lessonName": "Empathy: Shared Emotion",
  "pages": [
    {
      "pageType": "definition",
      "pageOrder": 0,
      "term": "Empathy",
      "definition": "The ability to understand and share the feelings of another. In this beginner lesson, we focus on 'reciprocal empathy,' where the emotion is overtly mirrored and shared between people. It is not just listening; it is feeling the emotion alongside the other person.",
      "visualCues": [
        "Head tilted to the side",
        "Soft, watery, or wide eyes depending on the emotion",
        "Leaning forward significantly",
        "Open hand gestures (palms up)",
        "Mirroring facial expressions (sadness or joy)"
      ],
      "toneCues": [
        "Softened volume for sadness / Heightened volume for joy",
        "Elongated vowels to show care ('Oh nooo', 'Wooow')",
        "Warm, breathy quality to the voice",
        "Matching the tempo of the other person exactly"
      ]
    },
    {
      "pageType": "practice",
      "pageOrder": 1,
      "scenario": {
        "context": "A close friend tells you their puppy has gone missing. You are sharing in their distress completely.",
        "description": "The goal is to mirror the high level of distress and sadness. The empathy here is loud and obvious."
      },
      "audioSample": {
        "url": "",
        "duration": 5.5,
        "tonalPrompt": "Voice is trembling, slightly higher pitch due to distress, very slow tempo, emphasized emotional words."
      },
      "transcript": "Oh no! That is absolutely heartbreaking! I am so worried too. We are going to find him, I promise.",
      "appropriateResponse": {
        "description": "A response that matches the intensity of the sadness and offers immediate shared support.",
        "keyElements": [
          "Match the sad facial expression",
          "Use a gentle, concerned tone",
          "Validate the feeling ('heartbreaking')",
          "Use 'We' language to show shared burden"
        ]
      }
    },
    {
      "pageType": "practice",
      "pageOrder": 2,
      "scenario": {
        "context": "Your sibling just got engaged. You are sharing in their overwhelming joy.",
        "description": "Empathy applies to joy as well. You are not just observing their happiness; you are amplifying it."
      },
      "audioSample": {
        "url": "",
        "duration": 4.2,
        "tonalPrompt": "High energy, loud volume, wide pitch variation, laughter in the voice, fast tempo."
      },
      "transcript": "Oh my gosh!! I am literally crying happy tears right now! I am so, so incredibly happy for you both!",
      "appropriateResponse": {
        "description": "An enthusiastic, high-energy response that validates the excitement.",
        "keyElements": [
          "Wide smile and open eyes",
          "Higher pitch and faster pace",
          "Exaggerated positive affirmations",
          "Physical excitement (clapping or hands to face)"
        ]
      }
    },
    {
      "pageType": "practice",
      "pageOrder": 3,
      "scenario": {
        "context": "A partner admits they are feeling overwhelmed and scared about the future. You are validating their vulnerability with your own.",
        "description": "This scenario focuses on deep, quiet connection. The tone is hushed and intimate."
      },
      "audioSample": {
        "url": "",
        "duration": 6.0,
        "tonalPrompt": "Very quiet, breathy, slow, lower pitch, extremely gentle and soothing."
      },
      "transcript": "I can feel how heavy that is for you. It scares me too, honestly. But I am right here in this with you, holding your hand.",
      "appropriateResponse": {
        "description": "A quiet, reassuring response that acknowledges the shared fear while offering stability.",
        "keyElements": [
          "Maintain intense, soft eye contact",
          "Slow down speech significantly",
          "Acknowledge the specific emotion (fear/heaviness)",
          "Reaffirm physical or emotional presence"
        ]
      }
    }
  ]
};

  const handleNext = () => {
    if (currentPage === 'definition') {
      setCurrentPage('practice');
    } else if (currentPage === 'practice') {
      setCurrentPage('results');
    }
  };

  const handleBack = () => {
    if (currentPage === 'definition') {
      setCurrentPage('loading');
    } else if (currentPage === 'practice') {
      setCurrentPage('definition');
    } else if (currentPage === 'results') {
      setCurrentPage('practice');
    }
  };

  const getStepNumber = () => {
    switch (currentPage) {
      case 'definition': return 1;
      case 'practice': return 2;
      case 'results': return 3;
      default: return 1;
    }
  };

  // Render different pages based on state
  if (currentPage === 'loading') {
    return (
       <div className="min-h-screen flex items-center justify-center bg-[#E1D3BE]">
       
        <div className="text-center">
          <h1 
            ref={titleRef}
            className="text-6xl font-bold text-[#5E7381] mb-4 opacity-0 font-[family-name:var(--font-josefin_sans)]"
          >
            Lesson {lessonData.lessonNumber}
          </h1>
          <p 
            ref={descriptionRef}
            className="text-3xl text-black opacity-0"
          >
            {lessonData.lessonName}
          </p>
        </div>
      </div>
     
    );
  }

  if (currentPage === 'definition') {
    return (
      <DefinitionPage
        term={lessonData.pages[0].term  || ""}
        definition={lessonData.pages[0].definition  || ""}
        visualCues={lessonData.pages[0].visualCues || []}
        toneCues={lessonData.pages[0].toneCues  || []}
        onNext={handleNext}
        onBack={handleBack}
        currentStep={getStepNumber()}
        totalSteps={4}
      />
    );
  }

  if (currentPage === 'practice') {
    return <div className="min-h-screen bg-[#E1D3BE] flex items-center justify-center">
      <h1 className="text-4xl">Practice Page (Coming Soon)</h1>
    </div>;
  }

  if (currentPage === 'results') {
    return <div className="min-h-screen bg-[#E1D3BE] flex items-center justify-center">
      <h1 className="text-4xl">Results Page (Coming Soon)</h1>
    </div>;
  }

  return null;
}