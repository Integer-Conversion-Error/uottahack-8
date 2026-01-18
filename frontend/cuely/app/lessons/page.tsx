'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';

interface Lesson {
  _id: string;
  lessonId: string;
  lessonNumber: number;
  lessonName: string;
  difficulty?: string;
}

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <div className="p-10">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-center">
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
                className="bg-slate-500 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="mb-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide mb-3 uppercase
                      ${lesson.difficulty === 'beginner' ? 'bg-green-50 text-green-700' :
                        lesson.difficulty === 'intermediate' ? 'bg-yellow-50 text-yellow-700' :
                        'bg-red-50 text-red-700'}`}>
                      {lesson.difficulty || 'beginner'}
                    </span>
                    <h3 className="text-xl font-bold text-white mb-2">{lesson.lessonName}</h3>
                    <p className="text-white text-sm">Lesson {lesson.lessonNumber}</p>
                </div>

                <div className="mt-auto pt-4 border-t border-white">
                    <Link
                      href={`/lessons/${lesson.lessonId}`}
                      className="block w-full text-center py-2.5 bg-white text-slate-500 rounded-xl hover:bg-gray-300 active:bg-gray-400 transition-all font-bold shadow-lg shadow-black/20"
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
