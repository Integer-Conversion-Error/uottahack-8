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
            <p className="text-[#5E7381] max-w-2xl mx-auto text-xl font-medium">
                Browse our library of social scenarios designed to help you master nuanced interactions.
            </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {AVAILABLE_LESSONS.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col group"
            >
              <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide mb-3 uppercase
                    ${lesson.difficulty === 'beginner' ? 'bg-green-50 text-green-700' : 
                      lesson.difficulty === 'intermediate' ? 'bg-yellow-50 text-yellow-700' : 
                      'bg-red-50 text-red-700'}`}>
                    {lesson.difficulty}
                  </span>
                  <h3 className="text-xl font-bold text-[#5E7381] mb-2 group-hover:text-[#4a5c6a] transition-colors">{lesson.title}</h3>
                  <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed">{lesson.description}</p>
              </div>
              
              <div className="mt-auto pt-4 border-t border-gray-50">
                  <Link 
                    href={`/lessons/${lesson.id}`} 
                    className="block w-full text-center py-2.5 bg-[#5E7381] text-white rounded-xl hover:bg-[#4a5c6a] transition-all font-bold shadow-lg shadow-[#5E7381]/10"
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
