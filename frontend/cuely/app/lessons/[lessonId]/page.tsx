// app/lessons/[lessonId]/page.tsx
'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import { gsap } from 'gsap';
import DefinitionPage from '@/components/DefinitionPage';
import ResultsPage, { SessionAnalysis } from '@/components/ResultsPage';
import Image from 'next/image';

import PracticePage from '@/components/PracticePage';

import EmpathyLesson from '@/data/Empathy_Introduction.json';
import SarcasmLesson from '@/data/Sarcasm.json';

interface LessonPageProps {
  params: Promise<{
    lessonId: string;
  }>;
}

const LESSON_MAP: Record<string, any> = {
  [EmpathyLesson.lessonId]: EmpathyLesson,
  [SarcasmLesson.lessonId]: SarcasmLesson,
  'empathy-beg-001': EmpathyLesson, // Fallback ID matching file
  'lesson-sarcasm-001': SarcasmLesson // Fallback ID matching file
};

const getLesson = (id: string) => LESSON_MAP[id] || null;

export default function LessonPage({ params }: LessonPageProps) {
  // Unwrap params using React.use()
  const { lessonId } = use(params);

  // Use index to track progress: -1 (loading), 0...N (pages), N+1 (results)
  const [pageIndex, setPageIndex] = useState<number>(-1);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);

  const lessonData = getLesson(lessonId);

  useEffect(() => {
    // Only run animation if we have data and are in loading state
    if (pageIndex === -1 && lessonData) {
       // ... animation logic ...
       if (titleRef.current && descriptionRef.current) {
          const tl = gsap.timeline({
            onComplete: () => {
              // Auto-advance to definition page (index 0) after animation
              setTimeout(() => setPageIndex(0), 1000);
            }
          });
          tl.to(titleRef.current, { opacity: 1, duration: 1, ease: 'power2.inOut' })
            .to(descriptionRef.current, { opacity: 1, duration: 1, ease: 'power2.inOut' }, '-=0.3');
          return () => { tl.kill(); };
       } else {
           setTimeout(() => setPageIndex(0), 1000);
       }
    }
  }, [pageIndex, lessonData]);

  // Start session when entering a practice page
  useEffect(() => {
      if (lessonData && pageIndex >= 0 && pageIndex < lessonData.pages.length) {
          const currentPage = lessonData.pages[pageIndex];
          if (currentPage.pageType === 'practice' && !sessionId) {
              startSession(currentPage);
          }
      }
  }, [pageIndex, lessonData, sessionId]);


  const startSession = async (pageData: any) => {
      try {
          const res = await fetch('http://localhost:4000/api/sessions/start', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  userId: '65a000000000000000000000', // Mock User ID
                  lessonId: lessonId,
                  difficulty: 'beginner', // Could come from lessonData
                  title: pageData.scenario?.context || 'Practice Session'
              })
          });
          const data = await res.json();
          if (data.success) {
              setSessionId(data.data.sessionId);
              console.log('Session started:', data.data.sessionId);
          }
      } catch (err) {
          console.error('Failed to start session', err);
      }
  };

  const handlePracticeSubmit = async (blob: Blob) => {
      if (!sessionId) {
          console.error("No active session ID");
          return;
      }
      setIsSubmitting(true);
      
      const currentPage = lessonData.pages[pageIndex];
      const formData = new FormData();
      formData.append('video', blob, 'practice.webm');
      formData.append('transcript', currentPage.transcript || '');
      // Pass context for analysis
      formData.append('targetTone', lessonData.lessonName || 'Social Cue');
      formData.append('promptContext', currentPage.scenario?.context || 'Social interaction practice');

      try {
          const res = await fetch(`http://localhost:4000/api/sessions/${sessionId}/complete`, {
              method: 'PUT',
              body: formData
          });
          const data = await res.json();
          
          if (data.success) {
              console.log('Analysis complete:', data.data.analysis);
              setAnalysisResult(data.data.analysis);
              // Clear session ID so next practice page starts a new one
              setSessionId(null); 
              // Show feedback instead of auto-advancing
              setShowFeedback(true);
          } else {
              console.error('Analysis failed:', data.message);
              alert("Analysis failed: " + data.message);
          }
      } catch (err) {
          console.error('Upload error:', err);
          alert("Upload failed.");
      } finally {
          setIsSubmitting(false);
      }
  };

  if (!lessonData) {
     return <div className="min-h-screen flex items-center justify-center">Lesson not found: {lessonId}</div>;
  }

const sessionData = {
  "_id": {
    "$oid": "696bc7af5a00353cadbbcbee"
  },
  "scenarioId": {
    "$oid": "696ba192bc3ace181383e4cb"
  },
  "durationSeconds": 104,
  "sessionType": "practice",
  "difficulty": "intermediate",
  "response": {
    "webcamSnapshots": [],
    "audioUrl": "uploads\\1768671219629.webm",
    "transcript": "User response transcript here"
  },
  "startedAt": {
    "$date": "2026-01-17T17:32:31.587Z"
  },
  "createdAt": {
    "$date": "2026-01-17T17:32:31.590Z"
  },
  "updatedAt": {
    "$date": "2026-01-17T17:34:15.802Z"
  },
  "__v": 0,
  "analysis": {
    "rawScore": 0,
    "facial_expression": {
      "score": "thumbs-down",
      "feedback": "Your expression remained neutral and focused on your own actions rather than the friend's distress. To show empathy, try furrowing your brows slightly or offering a sympathetic look to validate their feelings of failure."
    },
    "eye_contact": {
      "score": "thumbs-down",
      "feedback": "You spent the majority of the interaction looking up and away while fixing your hair. Consistent eye contact is crucial when someone is vulnerable, as looking away signals that you are distracted or uninterested."
    },
    "body_language": {
      "score": "thumbs-down",
      "feedback": "Grooming yourself while a friend shares devastating news can appear dismissive. Instead of tying your hair, you should face the person fully with an open posture and still hands to show they are your priority."
    },
    "tone": {
      "score": "thumbs-down",
      "feedback": "The visual distraction suggests a lack of immediate verbal support. Even if you were speaking, multi-tasking dilutes the sincerity of your tone. Ensure your voice is the primary focus and sounds warm, attentive, and undistracted."
    }
  },
  "completedAt": {
    "$date": "2026-01-17T17:34:15.799Z"
  }
}   

    const parsedAnalysis = {
        "analysis": {"facial_expression": {
      "score": "thumbs-down",
      "feedback": "Your expression remained neutral and focused on your own actions rather than the friend's distress. To show empathy, try furrowing your brows slightly or offering a sympathetic look to validate their feelings of failure."
    },
    "eye_contact": {
      "score": "thumbs-down",
      "feedback": "You spent the majority of the interaction looking up and away while fixing your hair. Consistent eye contact is crucial when someone is vulnerable, as looking away signals that you are distracted or uninterested."
    },
    "body_language": {
      "score": "thumbs-down",
      "feedback": "Grooming yourself while a friend shares devastating news can appear dismissive. Instead of tying your hair, you should face the person fully with an open posture and still hands to show they are your priority."
    },
    "tone": {
      "score": "thumbs-down",
      "feedback": "The visual} distraction suggests a lack of immediate verbal support. Even if you were speaking, multi-tasking dilutes the sincerity of your tone. Ensure your voice is the primary focus and sounds warm, attentive, and undistracted."
    }
}
    }

  const handleNext = () => {
    if (pageIndex < lessonData.pages.length - 1) {
      setPageIndex(pageIndex + 1);
    } else {
      setPageIndex(lessonData.pages.length); // Results phase
    }
  };

  const handleBack = () => {
    if (pageIndex > 0) {
      setPageIndex(pageIndex - 1);
    } else {
       setPageIndex(-1);
    }
  };

  const handleFeedbackNext = () => {
      setShowFeedback(false);
      setAnalysisResult(null);
      handleNext();
  };

  // Loading Screen
  if (pageIndex === -1) {
      // ... existing loading screen ...
       return (
       <div className="min-h-screen flex items-center justify-center bg-[#E1D3BE]">
        <div className="text-center">
          <h1 ref={titleRef} className="text-6xl font-bold text-[#5E7381] mb-4 opacity-0 font-[family-name:var(--font-josefin_sans)]">
            Lesson {lessonData.lessonNumber}
          </h1>
          <p ref={descriptionRef} className="text-3xl text-black opacity-0">
            {lessonData.lessonName}
          </p>
        </div>
      </div>
    );
  }

  // Intercept for Feedback/Results View
  if (showFeedback && analysisResult) {
      return (
          <ResultsPage 
            analysis={analysisResult} 
            onNext={handleFeedbackNext}
            isLastStep={pageIndex === lessonData.pages.length - 1}
            onRetry={() => setShowFeedback(false)} // Simple retry just hides feedback
          />
      );
  }

  // Final Completion Screen (End of lesson) - Only reached after last feedback
  if (pageIndex === lessonData.pages.length) {
    return (
        <div className="min-h-screen bg-[#E1D3BE] flex items-center justify-center flex-col gap-6 text-center p-8">
            <h1 className="text-5xl font-bold text-[#5E7381]">Lesson Complete!</h1>
            <p className="text-xl text-gray-700">You have completed all scenarios.</p>
            <div className="flex gap-4 mt-8">
                <a href="/lessons" className="px-8 py-3 bg-white text-[#5E7381] rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm">
                    Back to Lessons
                </a>
                <a href="/dashboard" className="px-8 py-3 bg-[#5E7381] text-white rounded-xl font-bold hover:bg-[#4a5c6a] transition-colors shadow-lg">
                    Go to Dashboard
                </a>
            </div>
        </div>
    );
  }

  // Content Pages
  const currentPageData = lessonData.pages[pageIndex];
  if (!currentPageData) return <div>Error: Page data missing</div>;

  if (currentPageData.pageType === 'definition') {
    return (
      <DefinitionPage
        term={currentPageData.term}
        definition={currentPageData.definition}
        visualCues={currentPageData.visualCues}
        toneCues={currentPageData.toneCues}
        onNext={handleNext}
        onBack={handleBack}
        currentStep={pageIndex + 1}
        totalSteps={lessonData.pages.length + 1}
      />
    );
  }

  if (currentPageData.pageType === 'practice') {
    return (
      <PracticePage
        scenario={currentPageData.scenario}
        audioSample={currentPageData.audioSample}
        transcript={currentPageData.transcript}
        onNext={handlePracticeSubmit} // Pass submit handler instead of generic next
        onBack={handleBack}
        currentStep={pageIndex + 1}
        totalSteps={lessonData.pages.length + 1}
        isSubmitting={isSubmitting} // Pass submitting state
      />
    );
  }

  if (currentPageData.pageType === 'results') {
    return (
      <ResultsPage
        analysis={sessionData.analysis as SessionAnalysis}
        onTryAgain={() => console.log('Go back to practice')}
        onNext={() => console.log('Next lesson')}
        currentStep={3}
        totalSteps={3}
        />
    )
  }

  return null;
}