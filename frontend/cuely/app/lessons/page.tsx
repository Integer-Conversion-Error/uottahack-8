'use client';

import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

interface Lesson {
  _id: string;
  lessonId: string;
  lessonNumber: number;
  lessonName: string;
}

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const headerRef = useRef<HTMLDivElement>(null);

  const addToCardsRef = (el: HTMLDivElement | null) => {
    if (el && !cardsRef.current.includes(el)) {
      cardsRef.current.push(el);
    }
  };

  useEffect(() => {
    // Set mounted state to true after component mounts
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only run animations when lessons are loaded and component is mounted
    if (!mounted || lessons.length === 0 || cardsRef.current.length === 0) return;

    // Animate header
    gsap.fromTo(headerRef.current,
      { 
        opacity: 0, 
        y: -30 
      },
      { 
        opacity: 1, 
        y: 0, 
        duration: 1, 
        ease: "power3.out" 
      }
    );

    // Staggered card animation with 3D effect
    if (cardsRef.current.length > 0) {
      // Set initial state
      gsap.set(cardsRef.current, {
        opacity: 0,
        y: 60,
        rotationX: 5,
        scale: 0.9,
        transformPerspective: 1000
      });

      // Animate in with stagger
      gsap.to(cardsRef.current, {
        opacity: 1,
        y: 0,
        rotationX: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: "back.out(1.4)",
        delay: 0.3,
        onComplete: () => {
          // Add hover effects after initial animation
          cardsRef.current.forEach(card => {
            const button = card.querySelector('.lesson-button');
            
            card.addEventListener('mouseenter', () => {
              gsap.to(card, {
                y: -8,
                duration: 0.3,
                ease: "power2.out"
              });
              
              if (button) {
                gsap.to(button, {
                  backgroundColor: '#f3f4f6',
                  duration: 0.3
                });
              }
            });

            card.addEventListener('mouseleave', () => {
              gsap.to(card, {
                y: 0,
                duration: 0.3,
                ease: "power2.out"
              });
              
              if (button) {
                gsap.to(button, {
                  backgroundColor: '#ffffff',
                  duration: 0.3
                });
              }
            });
          });
        }
      });
    }

    return () => {
      // Cleanup
      cardsRef.current.forEach(card => {
        card.removeEventListener('mouseenter', () => {});
        card.removeEventListener('mouseleave', () => {});
      });
      cardsRef.current = []; // Reset cards ref
    };
  }, [mounted, lessons]); // Re-run when lessons change

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/lessons');
        const data = await res.json();
        if (data.success) {
          setLessons(data.data);
        } else {
          setError('Failed to load lessons');
        }
      } catch (err) {
        console.error('Error fetching lessons:', err);
        setError('Failed to connect to server');
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, []);

  if (loading) {
    return (
      <div className="p-10 min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading lessons...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-10" ref={containerRef}>
      <div className="max-w-6xl mx-auto">
        <header ref={headerRef} className="mb-10 text-center">
            <h1 className="text-4xl font-bold mb-4 text-black">Explore Lessons</h1>
            <p className="text-black max-w-2xl mx-auto text-xl">
                Browse our library of social scenarios designed to help you master nuanced interactions.
            </p>
        </header>

        {lessons.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600 text-lg">No lessons available yet.</p>
            <p className="text-gray-500 mt-2">Generate some lessons to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson) => (
              <div
                key={lesson._id}
                className="bg-slate-500 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col transform-gpu will-change-transform"
                ref={addToCardsRef}
              >
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-white mb-2">{lesson.lessonName}</h3>
                    <p className="text-white text-sm">Lesson {lesson.lessonNumber}</p>
                </div>

                <div className="mt-auto pt-4 border-t border-white">
                    <Link
                      href={`/lessons/${lesson.lessonId}`}
                      className="lesson-button block w-full text-center py-2.5 bg-white text-slate-500 rounded-xl hover:bg-gray-300 active:bg-gray-400 transition-all font-bold shadow-lg shadow-black/20 transform-gpu will-change-transform"
                    >
                      Start Lesson
                    </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}