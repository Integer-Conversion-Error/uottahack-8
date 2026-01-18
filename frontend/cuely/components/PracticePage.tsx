'use client';

import React, { useState, useEffect, useRef } from 'react';
import WebcamCapture from './Webcam/WebcamCapture';
import { Play, Pause } from 'lucide-react';
import gsap from 'gsap';

interface PracticePageProps {
  scenario: {
    context: string;
    description: string;
    imageUrl?: string;
  };
  audioSample: {
    url: string;
    duration: number;
    tonalPrompt?: string;
    imageUrl?: string;
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
  const safeScenario = scenario || { context: "Context missing", description: "Description missing", imageUrl: "" };
  const safeAudioSample = audioSample || { url: "", duration: 0, tonalPrompt: "" };

  const [practicePhase, setPracticePhase] = useState<'listen' | 'respond'>('listen');
  const [isRecording, setIsRecording] = useState(false);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Refs for GSAP animations
  const containerRef = useRef<HTMLDivElement>(null);
  const leftColumnRef = useRef<HTMLDivElement>(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);
  const phaseContentRef = useRef<HTMLDivElement>(null);
  const listenPhaseRef = useRef<HTMLDivElement>(null);
  const respondPhaseRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

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

  // Initial page load animation
  useEffect(() => {
    // Create timeline for initial animations
    const tl = gsap.timeline({
      defaults: { ease: "power3.out", duration: 0.8 }
    });

    // Initial state
    gsap.set([leftColumnRef.current, rightColumnRef.current, buttonsRef.current], {
      opacity: 0,
      y: 30
    });

    // Animate columns in
    tl
      .to(leftColumnRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.9
      })
      .to(rightColumnRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.9
      }, "-=0.5")
      .to(buttonsRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6
      }, "-=0.3");

    // Animate listen phase content
    if (practicePhase === 'listen' && listenPhaseRef.current) {
      const listenElements = listenPhaseRef.current.querySelectorAll('div, h3, p, button');
      gsap.fromTo(listenElements,
        {
          opacity: 0,
          y: 20
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          delay: 0.5
        }
      );
    }

    return () => {
      tl.kill();
    };
  }, []);

  // Phase transition animation
  useEffect(() => {
    if (!phaseContentRef.current) return;

    if (practicePhase === 'listen' && listenPhaseRef.current) {
      // Animate listen phase in
      const listenElements = listenPhaseRef.current.querySelectorAll('div, h3, p, button');
      gsap.fromTo(listenElements,
        {
          opacity: 0,
          x: 50,
          scale: 0.95
        },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.08,
          ease: "back.out(1.2)"
        }
      );
    } else if (practicePhase === 'respond' && respondPhaseRef.current) {
      // Animate respond phase in
      const respondElements = respondPhaseRef.current.querySelectorAll('div, h3, p, button');
      gsap.fromTo(respondElements,
        {
          opacity: 0,
          x: 50,
          scale: 0.95
        },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.05,
          ease: "back.out(1.2)"
        }
      );
    }
  }, [practicePhase]);

  // Animation for recorded blob state
  useEffect(() => {
    if (capturedBlob && respondPhaseRef.current) {
      const successMessage = respondPhaseRef.current.querySelector('.success-message');
      if (successMessage) {
        gsap.fromTo(successMessage,
          {
            opacity: 0,
            scale: 0.8,
            y: 20
          },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.5,
            ease: "back.out(1.5)"
          }
        );
      }
    }
  }, [capturedBlob]);

  // Audio button animation
  useEffect(() => {
    const audioButton = document.querySelector('.audio-button');
    if (audioButton) {
      audioButton.addEventListener('mouseenter', () => {
        gsap.to(audioButton, {
          scale: 1.1,
          duration: 0.2,
          ease: "power2.out"
        });
      });

      audioButton.addEventListener('mouseleave', () => {
        gsap.to(audioButton, {
          scale: 1,
          duration: 0.2,
          ease: "power2.out"
        });
      });

      // Pulsing animation when audio is playing
      if (isPlaying) {
        gsap.to(audioButton, {
          scale: 1.15,
          duration: 0.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      } else {
        gsap.killTweensOf(audioButton);
      }
    }

    return () => {
      if (audioButton) {
        audioButton.removeEventListener('mouseenter', () => {});
        audioButton.removeEventListener('mouseleave', () => {});
      }
    };
  }, [isPlaying]);

  // Submit button animation
  useEffect(() => {
    const submitButton = document.querySelector('.submit-button');
    if (submitButton) {
      submitButton.addEventListener('mouseenter', () => {
        if (capturedBlob && !isSubmitting) {
          gsap.to(submitButton, {
            scale: 1.05,
            duration: 0.2,
            ease: "power2.out"
          });
        }
      });

      submitButton.addEventListener('mouseleave', () => {
        if (capturedBlob && !isSubmitting) {
          gsap.to(submitButton, {
            scale: 1,
            duration: 0.2,
            ease: "power2.out"
          });
        }
      });
    }

    return () => {
      if (submitButton) {
        submitButton.removeEventListener('mouseenter', () => {});
        submitButton.removeEventListener('mouseleave', () => {});
      }
    };
  }, [capturedBlob, isSubmitting]);

  return (
    <div 
      ref={containerRef}
      className="h-screen flex flex-col overflow-hidden bg-[#E1D3BE]"
    >
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-8 pb-8 overflow-hidden">
        <div className="max-w-6xl w-full h-full flex flex-col">
          <div className="pt-4 grid grid-cols-2 gap-8 h-full overflow-hidden">
            {/* Left Column - Scenario Context */}
            <div 
              ref={leftColumnRef}
              className="flex flex-col justify-center bg-white p-8 rounded-2xl shadow-sm opacity-0 transform-gpu will-change-transform"
            >
              <h2 className="text-2xl font-bold text-[#5E7381] mb-6">
                The Scenario
              </h2>

              <div className="mb-6">
                <h3 className="text-lg uppercase tracking-wider text-gray-500 font-semibold mb-2">Context</h3>
                <p className="text-md text-black leading-relaxed font-medium">
                  {safeScenario.context}
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg uppercase tracking-wider text-gray-500 font-semibold mb-2">Situation</h3>
                {/* Scenario Image */}
                {/* @ts-ignore */}
                {safeScenario.imageUrl && (
                  <div className="mb-4 rounded-xl overflow-hidden shadow-sm">
                    <img
                      /* @ts-ignore */
                      src={safeScenario.imageUrl.startsWith('http') ? safeScenario.imageUrl : `http://localhost:4000${safeScenario.imageUrl}`}
                      alt="Scenario visualization"
                      className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <p className="text-md text-gray-700 leading-relaxed">
                  {safeScenario.description}
                </p>
              </div>

              <div className="mt-auto bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h3 className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-2">Tone Hint</h3>
                <p className="text-gray-600 italic">{audioSample.tonalPrompt}</p>
              </div>
            </div>

            {/* Right Column - Interaction */}
            <div 
              ref={rightColumnRef}
              className="flex flex-col bg-white p-8 rounded-2xl shadow-sm relative overflow-hidden opacity-0 transform-gpu will-change-transform"
            >
              {/* Listen Phase */}
              {practicePhase === 'listen' && (
                <div 
                  ref={listenPhaseRef}
                  className="flex-1 flex flex-col justify-center items-center text-center"
                >
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 text-[#5E7381]">
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
                      className="audio-button w-16 h-16 bg-[#5E7381] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#4a5c6a] transition-all transform-gpu will-change-transform"
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
                    className="px-8 py-3 bg-[#5E7381] text-white rounded-xl font-semibold hover:bg-[#4a5c6a] transition-all transform hover:scale-105 shadow-lg transform-gpu will-change-transform"
                  >
                    I'm ready to respond
                  </button>
                </div>
              )}

              {/* Respond Phase */}
              {practicePhase === 'respond' && (
                <div 
                  ref={respondPhaseRef}
                  className="flex-1 flex flex-col h-full"
                >
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
                    <div className="success-message flex items-center justify-between bg-green-50 p-4 rounded-xl border border-green-100 mb-4">
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
                      className="text-gray-500 hover:text-gray-700 text-sm font-medium transform-gpu will-change-transform"
                    >
                      ← Back to Prompt
                    </button>
                    <button
                      onClick={() => capturedBlob && onNext(capturedBlob)}
                      disabled={!capturedBlob || isSubmitting}
                      className={`submit-button px-8 py-3 rounded-xl font-semibold transition-all shadow-lg flex items-center transform-gpu will-change-transform ${capturedBlob && !isSubmitting
                        ? 'bg-[#5E7381] text-white hover:bg-[#4a5c6a]'
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

          {/* Global Navigation */}
          <div 
            ref={buttonsRef}
            className="flex justify-between items-center mt-6 opacity-0 transform-gpu will-change-transform"
          >
            <button
              onClick={onBack}
              className="px-6 py-3 bg-white text-[#5E7381] rounded-lg font-semibold hover:bg-gray-100 transition-colors transform-gpu will-change-transform"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}