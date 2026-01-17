'use client';

import Link from 'next/link';
import React from 'react';

// Manually defining the available lessons for now
const AVAILABLE_LESSONS = [
  {
    id: 'empathy_beg_001',
    title: 'Empathy: Introduction',
    description: 'Learn the basics of understanding and sharing emotions, focusing on reciprocal empathy and facial mirroring.',
    difficulty: 'beginner'
  },
  {
    id: 'lesson-sarcasm-001',
    title: 'Sarcasm',
    description: 'Master the art of recognizing and responding to sarcasm, understanding the mismatch between words and tone.',
    difficulty: 'intermediate'
  }
];

export default function LessonsPage() {
  return (
    <div className="p-10">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-center">
            <h1 className="text-4xl font-bold mb-4 text-white">Explore Lessons</h1>
            <p className="text-blue-100/70 max-w-2xl mx-auto text-xl">
                Browse our library of social scenarios designed to help you master nuanced interactions.
            </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {AVAILABLE_LESSONS.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-slate-500 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide mb-3 uppercase
                    ${lesson.difficulty === 'beginner' ? 'bg-green-500/20 text-green-300' : 
                      lesson.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-300' : 
                      'bg-red-500/20 text-red-300'}`}>
                    {lesson.difficulty}
                  </span>
                  <h3 className="text-xl font-bold text-white mb-2">{lesson.title}</h3>
                  <p className="text-white text-sm line-clamp-3">{lesson.description}</p>
              </div>
              
              <div className="mt-auto pt-4 border-t border-white/5">
                  <Link 
                    href={`/lessons/${lesson.id}`} 
                    className="block w-full text-center py-2.5 bg-[#5E7381] text-white rounded-xl hover:bg-[#4a5c6a] transition-all font-bold shadow-lg shadow-black/20"
                  >
                    Start Lesson
                  </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
