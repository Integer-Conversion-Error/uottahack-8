'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';

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
  currentStep,
  totalSteps,
}: DefinitionPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftColumnRef = useRef<HTMLDivElement>(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<HTMLHeadingElement>(null);
  const definitionRef = useRef<HTMLParagraphElement>(null);
  const toneCuesRef = useRef<HTMLDivElement>(null);
  const visualCuesRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  const handleBack = () => {
    return router.push("/lessons");
  }

  useEffect(() => {
    // Create a master timeline for sequential animations
    const tl = gsap.timeline({
      defaults: { ease: "power3.out" }
    });

    // Initial hide all elements
    gsap.set([
      termRef.current,
      leftColumnRef.current,
      rightColumnRef.current,
      buttonsRef.current
    ], {
      opacity: 0,
      y: 20
    });

    // Sequence of animations
    tl
      // Term appears first
      .to(termRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8
      })
      // Underline appears with term
      .to('.definition-underline', {
        width: '100%',
        duration: 0.8,
        ease: "power2.inOut"
      }, "-=0.4")
      // Left column content fades in
      .to(leftColumnRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8
      }, "-=0.2")
      // Right column appears with staggered items
      .to(rightColumnRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        onComplete: () => {
          // Animate tone cues items with stagger
          if (toneCuesRef.current) {
            const toneItems = toneCuesRef.current.querySelectorAll('li');
            gsap.fromTo(toneItems,
              {
                opacity: 0,
                x: -20
              },
              {
                opacity: 1,
                x: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: "back.out(1.2)"
              }
            );
          }

          // Animate visual cues items with stagger
          if (visualCuesRef.current) {
            const visualItems = visualCuesRef.current.querySelectorAll('li');
            gsap.fromTo(visualItems,
              {
                opacity: 0,
                x: -20
              },
              {
                opacity: 1,
                x: 0,
                duration: 0.6,
                stagger: 0.1,
                delay: 0.2,
                ease: "back.out(1.2)"
              }
            );
          }
        }
      }, "-=0.4")
      // Buttons fade in last
      .to(buttonsRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6
      }, "-=0.2");

    // Add hover animations for buttons
    const backButton = buttonsRef.current?.querySelector('button:first-child');
    const nextButton = buttonsRef.current?.querySelector('button:last-child');

    if (backButton) {
      backButton.addEventListener('mouseenter', () => {
        gsap.to(backButton, {
          scale: 1.05,
          x: -3,
          duration: 0.2,
          ease: "power2.out"
        });
      });

      backButton.addEventListener('mouseleave', () => {
        gsap.to(backButton, {
          scale: 1,
          x: 0,
          duration: 0.2,
          ease: "power2.out"
        });
      });
    }

    if (nextButton) {
      nextButton.addEventListener('mouseenter', () => {
        gsap.to(nextButton, {
          scale: 1.05,
          x: 3,
          duration: 0.2,
          ease: "power2.out"
        });
      });

      nextButton.addEventListener('mouseleave', () => {
        gsap.to(nextButton, {
          scale: 1,
          x: 0,
          duration: 0.2,
          ease: "power2.out"
        });
      });

      nextButton.addEventListener('mousedown', () => {
        gsap.to(nextButton, {
          scale: 0.95,
          duration: 0.1,
          ease: "power2.in"
        });
      });

      nextButton.addEventListener('mouseup', () => {
        gsap.to(nextButton, {
          scale: 1.05,
          duration: 0.1,
          ease: "power2.out"
        });
      });
    }

    // Add click animation for back button
    if (backButton) {
      backButton.addEventListener('mousedown', () => {
        gsap.to(backButton, {
          scale: 0.95,
          duration: 0.1,
          ease: "power2.in"
        });
      });

      backButton.addEventListener('mouseup', () => {
        gsap.to(backButton, {
          scale: 1,
          duration: 0.1,
          ease: "power2.out"
        });
      });
    }

    // Cleanup
    return () => {
      tl.kill();
      if (backButton) {
        backButton.removeEventListener('mouseenter', () => {});
        backButton.removeEventListener('mouseleave', () => {});
        backButton.removeEventListener('mousedown', () => {});
        backButton.removeEventListener('mouseup', () => {});
      }
      if (nextButton) {
        nextButton.removeEventListener('mouseenter', () => {});
        nextButton.removeEventListener('mouseleave', () => {});
        nextButton.removeEventListener('mousedown', () => {});
        nextButton.removeEventListener('mouseup', () => {});
      }
    };
  }, [term, definition, visualCues, toneCues]);

  return (
    <div 
      ref={containerRef}
      className="h-screen flex flex-col overflow-hidden pt-30"
    >
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-8 pb-8 overflow-hidden">
        <div className="max-w-6xl w-full h-full flex flex-col">
          {/* Two Column Layout */}
          <div className="pt-4 grid grid-cols-2 gap-8 overflow-hidden">
            {/* Left Column - Term and Definition */}
            <div ref={leftColumnRef} className="flex flex-col opacity-0">
              <h1 
                ref={termRef}
                className="text-4xl font-bold text-[#5E7381] mb-4 opacity-0"
              >
                {term}
              </h1>
              <hr className="border-[#5E7381] mb-4 definition-underline" style={{ width: '0%' }} />
              <p 
                ref={definitionRef}
                className="text-lg text-black leading-relaxed"
              >
                {definition}
              </p>
            </div>

            {/* Right Column - Cues */}
            <div ref={rightColumnRef} className="flex flex-col gap-6 overflow-hidden opacity-0">
              {/* Tone Cues */}
              <div ref={toneCuesRef}>
                <h2 className="text-2xl font-semibold text-[#5E7381] mb-4">
                  Tone Cues
                </h2>
                <ul className="space-y-3">
                  {(toneCues || []).map((cue, index) => (
                    <li key={index} className="text-md text-black flex items-start opacity-0">
                      <span className="text-[#5E7381] mr-3 mt-1">•</span>
                      <span>{cue}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual Cues */}
              <div ref={visualCuesRef}>
                <h2 className="text-2xl font-semibold text-[#5E7381] mb-4">
                  Visual Cues
                </h2>
                <ul className="space-y-3">
                  {(visualCues || []).map((cue, index) => (
                    <li key={index} className="text-md text-black flex items-start opacity-0">
                      <span className="text-[#5E7381] mr-3 mt-1">•</span>
                      <span>{cue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div 
            ref={buttonsRef}
            className="mt-8 flex justify-between items-center opacity-0"
          >
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-white text-[#5E7381] rounded-lg font-semibold hover:bg-gray-100 transition-colors transform-gpu will-change-transform"
            >
              ← Leave Lesson
            </button>
            <button
              onClick={onNext}
              className="px-6 py-3 bg-[#5E7381] text-white rounded-lg font-semibold hover:bg-[#4a5c6a] transition-colors transform-gpu will-change-transform shadow-md"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}