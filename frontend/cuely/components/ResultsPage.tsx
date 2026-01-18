// components/ResultsPage.tsx
'use client';

import React from 'react';

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

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-8 pb-8 overflow-hidden">
        <div className="max-w-6xl w-full h-full flex flex-col">
          {/* Header */}
          <h1 className="text-2xl font-bold text-[#5E7381] mb-8">
            Here's How You Did
          </h1>

          {/* Feedback Cards Grid */}
          <div className="flex-1 grid grid-cols-2 gap-6 overflow-y-auto pb-6">
            {feedbackSections.map((section) => (
              <div
                key={section.title}
                className="bg-[#5E7381] rounded-lg p-6 shadow-lg relative"
              >
                {/* Score Icon */}
                <div className="absolute top-4 right-4">
                  <span className="text-3xl">
                    {getScoreIcon(section.metric.score)}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-1xl font-semibold text-white mb-4 pr-10">
                  {section.title}
                </h2>

                {/* Feedback */}
                <p className="text-white text-md leading-relaxed">
                  {section.metric.feedback}
                </p>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-1">
            <button
              onClick={onTryAgain}
              className="px-6 py-3 bg-white text-[#5E7381] rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              ← Try Again
            </button>
            <button
              onClick={onNext}
              className="px-6 py-3 bg-[#5E7381] text-white rounded-lg font-semibold hover:bg-[#4a5c6a] transition-colors"
            >
              Next Lesson →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
