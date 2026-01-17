'use client';

import React from 'react';

interface DefinitionPageProps {
  term: string;
  definition: string;
  visualCues: string[];
  toneCues: string[];
  onNext: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

export default function DefinitionPage({
  term,
  definition,
  visualCues,
  toneCues,
  onNext,
  onBack,
  currentStep,
  totalSteps,
}: DefinitionPageProps) {
  const steps = [
    { number: 1, label: 'Definition' },
    { number: 2, label: 'Practice' },
    { number: 3, label: 'Results' },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Progress Bar */}
      <div className="w-full py-6 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-5 left-10 right-10 h-1 bg-white -z-10" />
            <div 
              className="absolute top-5 left-0 h-1 bg-[#5E7381] -z-10 transition-all duration-500"
              style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            />

            {steps.map((step) => (
              <div key={step.number} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    step.number <= currentStep
                      ? 'bg-[#5E7381] text-white'
                      : 'bg-white text-gray-600'
                  }`}
                >
                  {step.number}
                </div>
                <span
                  className={`mt-2 text-sm font-medium ${
                    step.number <= currentStep
                      ? 'text-[#5E7381]'
                      : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-8 pb-8 overflow-hidden">
        <div className="max-w-6xl w-full h-full flex flex-col">
          {/* Two Column Layout */}
          <div className="pt-4 grid grid-cols-2 gap-8 overflow-hidden">
            {/* Left Column - Term and Definition */}
            <div className="flex flex-col">
              <h1 className="text-4xl font-bold text-[#5E7381] mb-4">
                {term}
              </h1>
              <hr className="border-[#5E7381] mb-4"/>
              <p className="text-lg text-black leading-relaxed">
                {definition}
              </p>
            </div>

            {/* Right Column - Cues */}
            <div className="flex flex-col gap-6 overflow-hidden">
              {/* Tone Cues */}
              <div>
                <h2 className="text-1xl font-semibold text-[#5E7381] mb-4">
                  Tone Cues
                </h2>
 
                  <ul className="space-y-3">
                    {toneCues.map((cue, index) => (
                      <li key={index} className="text-md text-black flex items-start">
                        <span className="text-[#5E7381] mr-3 mt-1">•</span>
                        <span>{cue}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              {/* Visual Cues */}
              <div>
                <h2 className="text-1xl font-semibold text-[#5E7381] mb-4">
                  Visual Cues
                </h2>
                  <ul className="space-y-3">
                    {visualCues.map((cue, index) => (
                      <li key={index} className="text-md text-black flex items-start">
                        <span className="text-[#5E7381] mr-3 mt-1">•</span>
                        <span>{cue}</span>
                      </li>
                    ))}
                  </ul>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={onBack}
              className="px-6 py-3 bg-white text-[#5E7381] rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={onNext}
              className="px-6 py-3 bg-[#5E7381] text-white rounded-lg font-semibold hover:bg-[#4a5c6a] transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}