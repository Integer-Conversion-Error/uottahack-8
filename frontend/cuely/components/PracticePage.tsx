'use client';

import React, { useState } from 'react';
import WebcamCapture from './Webcam/WebcamCapture';

import { Play, Pause } from 'lucide-react';

interface PracticePageProps {
  scenario: {
    context: string;
    description: string;
  };
  audioSample: {
    url: string;
    duration: number;
    tonalPrompt: string;
  };
  transcript: string;
  onNext: (blob: Blob) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
  isSubmitting?: boolean;
}

export default function PracticePage({
  scenario,
  audioSample,
  transcript,
  onNext,
  onBack,
  currentStep,
  totalSteps,
  isSubmitting = false,
}: PracticePageProps) {
  const [practicePhase, setPracticePhase] = useState<'listen' | 'respond'>('listen');
  const [isRecording, setIsRecording] = useState(false);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const steps = [
    { number: 1, label: 'Definition' },
    { number: 2, label: 'Practice' },
    { number: 3, label: 'Results' },
  ];

  const handleStartRecording = () => {
    setIsRecording(true);
  };

  const handleStopRecording = (blob: Blob) => {
    setIsRecording(false);
    setCapturedBlob(blob);
    console.log('Recorded blob size:', blob.size);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#E1D3BE]">
      {/* Progress Bar */}
      <div className="w-full py-6 px-8 backdrop-blur-sm">
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
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step.number <= currentStep
                    ? 'bg-[#5E7381] text-white'
                    : 'bg-white text-gray-600'
                    }`}
                >
                  {step.number}
                </div>
                <span
                  className={`mt-2 text-sm font-medium ${step.number <= currentStep
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
          <div className="pt-4 grid grid-cols-2 gap-8 h-full overflow-hidden">

            {/* Left Column - Scenario Context */}
            <div className="flex flex-col justify-center bg-white p-8 rounded-2xl shadow-sm">
              <h2 className="text-2xl font-bold text-[#5E7381] mb-6">The Scenario</h2>

              <div className="mb-6">
                <h3 className="text-lg uppercase tracking-wider text-gray-500 font-semibold mb-2">Context</h3>
                <p className="text-md text-black leading-relaxed font-medium">
                  {scenario.context}
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg uppercase tracking-wider text-gray-500 font-semibold mb-2">Situation</h3>
                <p className="text-md text-gray-700 leading-relaxed">
                  {scenario.description}
                </p>
              </div>

              <div className="mt-auto bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h3 className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-2">Tone Hint</h3>
                <p className="text-gray-600 italic">{audioSample.tonalPrompt}</p>
              </div>
            </div>

            {/* Right Column - Interaction */}
            <div className="flex flex-col bg-white p-8 rounded-2xl shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
                <div
                  className="h-full transition-all duration-500"
                  style={{ width: practicePhase === 'listen' ? '50%' : '100%' }}
                />
              </div>

              {/* Listen Phase */}
              {practicePhase === 'listen' && (
                <div className="flex-1 flex flex-col justify-center items-center text-center animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="w-16 h-16  rounded-full flex items-center justify-center mb-6 text-[#5E7381]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Listen to the Prompt</h3>
                  <p className="text-gray-500 mb-8">Hear what the other person is saying to you.</p>

                  <div className="w-full max-w-sm bg-gray-50 p-6 rounded-xl mb-8">
                    <p className="text-lg text-gray-800 font-medium">"{transcript}"</p>
                  </div>

                  {/* Audio Player */}
                  <div className="w-full max-w-sm mb-8 flex flex-col items-center">
                    <button
                      onClick={() => {
                        const audio = document.getElementById('audio-element') as HTMLAudioElement;
                        if (!audio) return;

                        if (isPlaying) {
                          audio.pause();
                        } else {
                          audio.play();
                        }
                        setIsPlaying(!isPlaying);
                      }}
                      className="w-16 h-16 bg-[#5E7381] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#4a5c6a] transition-all transform hover:scale-105 active:scale-95"
                    >
                      {isPlaying ? (
                        <Pause className="w-8 h-8 fill-current" />
                      ) : (
                        <Play className="w-8 h-8 fill-current ml-1" />
                      )}
                    </button>
                    <p className="mt-3 text-sm text-[#5E7381] font-medium opacity-80">
                      {isPlaying ? 'Listening...' : 'Play Audio'}
                    </p>

                    <audio
                      id="audio-element"
                      src={audioSample.url.startsWith('http') ? audioSample.url : `http://localhost:4000${audioSample.url}`}
                      onEnded={() => setIsPlaying(false)}
                      onPause={() => setIsPlaying(false)}
                      onPlay={() => setIsPlaying(true)}
                      className="hidden"
                    />
                  </div>

                  <button
                    onClick={() => setPracticePhase('respond')}
                    className="px-8 py-3 bg-[#5E7381] text-white rounded-xl font-semibold hover:bg-[#4a5c6a] transition-all transform hover:scale-105 shadow-lg"
                  >
                    I'm ready to respond
                  </button>
                </div>
              )}

              {/* Respond Phase */}
              {practicePhase === 'respond' && (
                <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300 h-full">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-[#5E7381] text-white rounded-full flex items-center justify-center text-sm mr-3">2</span>
                    Record Your Response
                  </h3>

                  <div className="flex-1 bg-black rounded-xl overflow-hidden mb-4 relative">
                    <WebcamCapture
                      onStartRecording={handleStartRecording}
                      onStopRecording={handleStopRecording}
                      isRecording={isRecording}
                      showControls={true}
                    />
                  </div>

                  {capturedBlob && (
                    <div className="flex items-center justify-between bg-green-50 p-4 rounded-xl border border-green-100 mb-4 animate-in fade-in slide-in-from-bottom-2">
                      <div className="flex items-center text-green-700">
                        <span className="mr-2">✓</span>
                        <span className="font-medium">Response Recorded</span>
                      </div>
                      <button
                        onClick={() => setCapturedBlob(null)}
                        className="text-sm text-gray-500 hover:text-gray-700 underline"
                      >
                        Retake
                      </button>
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                    <button
                      onClick={() => setPracticePhase('listen')}
                      className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                    >
                      ← Back to Prompt
                    </button>
                    <button
                      onClick={() => capturedBlob && onNext(capturedBlob)}
                      disabled={!capturedBlob || isSubmitting}
                      className={`px-8 py-3 rounded-xl font-semibold transition-all shadow-lg flex items-center ${capturedBlob && !isSubmitting
                        ? 'bg-[#5E7381] text-white hover:bg-[#4a5c6a] transform hover:scale-105'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Analyzing...
                        </>
                      ) : (
                        'Submit Response →'
                      )}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Global Navigation (Back Only) */}
          <div className="absolute bottom-8 left-8">
            <button
              onClick={onBack}
              className="px-6 py-2 bg-white/80 backdrop-blur text-gray-600 rounded-lg font-medium hover:bg-white transition-colors border border-gray-200"
            >
              Exit Lesson
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
