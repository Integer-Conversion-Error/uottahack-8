// components/ResultsPage.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

export type FeedbackScore = 'thumbs-up' | 'thumbs-down' | 'thumbs-sideways';

export interface FeedbackMetric {
  score: FeedbackScore;
  feedback: string;
}

export interface SessionAnalysis {
  rawScore: number;
  facial_expression: FeedbackMetric;
  eye_contact: FeedbackMetric;
  body_language: FeedbackMetric;
  tone: FeedbackMetric;
  ai_notes?: string; // New field for AI notes
  strengths?: string[]; // New field for strengths
  areas_for_improvement?: string[]; // New field for improvements
}

interface ResultsPageProps {
  analysis: SessionAnalysis;
  onTryAgain: () => void;
  onNext: () => void;
  currentStep: number;
  totalSteps: number;
}

export default function ResultsPage({
  analysis,
  onTryAgain,
  onNext,
  currentStep,
  totalSteps,
}: ResultsPageProps) {
  const [expandedNote, setExpandedNote] = useState(false);
  
  // Refs for GSAP animations
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const aiNotesRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  const steps = [
    { number: 1, label: 'Definition' },
    { number: 2, label: 'Practice' },
    { number: 3, label: 'Results' },
  ];

  const getScoreIcon = (score: FeedbackScore): string => {
    switch (score) {
      case 'thumbs-up':
        return '👍';
      case 'thumbs-sideways':
        return '👍👎'; // Thumbs sideways representation
      case 'thumbs-down':
        return '👎';
      default:
        return '👍';
    }
  };

  const getScoreColor = (score: FeedbackScore): string => {
    switch (score) {
      case 'thumbs-up':
        return 'bg-green-100 text-green-800';
      case 'thumbs-sideways':
        return 'bg-yellow-100 text-yellow-800';
      case 'thumbs-down':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const feedbackSections = [
    {
      title: 'Facial Expression',
      metric: analysis.facial_expression,
    },
    {
      title: 'Eye Contact',
      metric: analysis.eye_contact,
    },
    {
      title: 'Body Language',
      metric: analysis.body_language,
    },
    {
      title: 'Tone',
      metric: analysis.tone,
    },
  ];

  // Add card to refs array
  const addToCardsRef = (el: HTMLDivElement | null) => {
    if (el && !cardsRef.current.includes(el)) {
      cardsRef.current.push(el);
    }
  };

  useEffect(() => {
    // Create animation timeline
    const tl = gsap.timeline({
      defaults: { ease: "power3.out" }
    });

    // Initial state
    gsap.set([headerRef.current, ...cardsRef.current, aiNotesRef.current, buttonsRef.current], {
      opacity: 0,
      y: 30
    });

    // Animate header
    tl.to(headerRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8
    });

    // Animate cards with stagger
    tl.to(cardsRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: "back.out(1.2)"
    }, "-=0.3");

    // Animate AI notes section
    tl.to(aiNotesRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      onComplete: () => {
        // Animate AI notes content if expanded
        if (expandedNote && aiNotesRef.current) {
          const noteContent = aiNotesRef.current.querySelector('.ai-notes-content');
          if (noteContent) {
            gsap.fromTo(noteContent,
              {
                opacity: 0,
                height: 0
              },
              {
                opacity: 1,
                height: 'auto',
                duration: 0.5,
                ease: "power2.inOut"
              }
            );
          }
        }
      }
    }, "-=0.4");

    // Animate buttons
    tl.to(buttonsRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.6
    }, "-=0.2");


    // Cleanup
    return () => {
      tl.kill();
      cardsRef.current.forEach(card => {
        card.removeEventListener('mouseenter', () => {});
        card.removeEventListener('mouseleave', () => {});
      });
    };
  }, [expandedNote]);

  const toggleExpandedNote = () => {
    setExpandedNote(!expandedNote);
  };

  return (
    <div ref={containerRef} className="h-screen flex flex-col  bg-[#E1D3BE] mt-5">
      
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-8 pb-8 overflow-hidden">
        <div className="max-w-6xl w-full h-full flex flex-col">
          {/* Header */}
          <h1 
            ref={headerRef}
            className="text-3xl font-bold text-[#5E7381] mb-8 opacity-0"
          >
            Performance Analysis
          </h1>

          {/* Two-column layout for feedback cards and AI notes */}
          <div className="flex-1 flex gap-6">
            {/* Left column - Feedback Cards */}
            <div className="flex-1  pr-4">
              <div className="grid grid-cols-2 gap-6 pb-6">
                {feedbackSections.map((section, index) => (
                  <div
                    key={section.title}
                    ref={addToCardsRef}
                    className="bg-white rounded-2xl p-6 shadow-lg relative transform-gpu will-change-transform opacity-0"
                  >
                    {/* Score Icon */}
                    <div className="absolute top-4 right-4">
                      <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(section.metric.score)}`}>
                        {getScoreIcon(section.metric.score)}
                      </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-semibold text-[#5E7381] mb-4 pr-16">
                      {section.title}
                    </h2>

                    {/* Feedback */}
                    <p className="text-gray-700 text-md leading-relaxed">
                      {section.metric.feedback}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column - AI Notes */}
            <div 
              ref={aiNotesRef}
              className="w-1/3 flex flex-col opacity-0"
            >
              <div className="bg-white rounded-2xl shadow-lg p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-[#5E7381]">
                    AI Analysis Notes
                  </h2>
                  <button
                    onClick={toggleExpandedNote}
                    className="text-sm text-[#5E7381] hover:text-[#4a5c6a] font-medium"
                  >
                    {expandedNote ? 'Show Less' : 'Show More'}
                  </button>
                </div>

                <div className="mb-6">
                  <div className={`ai-notes-content ${expandedNote ? '' : 'max-h-32 overflow-hidden'}`}>
                    <p className="text-gray-700 leading-relaxed">
                      {analysis.ai_notes || "No AI notes available for this session. The AI analyzes your video response for emotional expression, communication effectiveness, and social cues."}
                    </p>
                    
                    {/* Strengths and Improvements if available */}
                    {analysis.strengths && analysis.strengths.length > 0 && (
                      <div className="mt-6">
                        <h3 className="font-semibold text-[#5E7381] mb-2">Key Strengths:</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {analysis.strengths.map((strength, index) => (
                            <li key={index} className="text-gray-700">{strength}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysis.areas_for_improvement && analysis.areas_for_improvement.length > 0 && (
                      <div className="mt-6">
                        <h3 className="font-semibold text-[#5E7381] mb-2">Areas for Improvement:</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {analysis.areas_for_improvement.map((area, index) => (
                            <li key={index} className="text-gray-700">{area}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  {!expandedNote && analysis.ai_notes && analysis.ai_notes.length > 200 && (
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent"></div>
                  )}
                </div>
               
              </div>

              {/* Additional Insights */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <p className="text-sm text-gray-500">Response Time</p>
                  <p className="font-semibold text-[#5E7381]">Good</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <p className="text-sm text-gray-500">Emotional Match</p>
                  <p className="font-semibold text-[#5E7381]">85%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div 
            ref={buttonsRef}
            className="flex justify-between items-center mt-6 opacity-0"
          >
            <button
              onClick={onTryAgain}
              className="px-8 py-3 bg-white text-[#5E7381] rounded-xl font-semibold hover:bg-gray-100 transition-colors transform-gpu will-change-transform shadow-sm"
            >
              ← Try Again
            </button>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Lesson {currentStep} of {totalSteps}
              </div>
              <button
                onClick={onNext}
                className="px-8 py-3 bg-[#5E7381] text-white rounded-xl font-semibold hover:bg-[#4a5c6a] transition-colors transform-gpu will-change-transform shadow-lg"
              >
                Next Lesson →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}