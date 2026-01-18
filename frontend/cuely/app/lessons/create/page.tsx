// app/lessons/create/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ChevronLeft, Loader2 } from 'lucide-react';

const EXISTING_LESSONS = [
  { value: 'sarcasm', label: 'Sarcasm', description: 'Detect and respond to sarcastic remarks' },
  { value: 'passive-aggression', label: 'Passive Aggressiveness', description: 'Navigate indirect communication patterns' },
  { value: 'empathy-intro', label: 'Introduction to Empathy', description: 'Understanding and sharing emotions' },
  { value: 'active-listening', label: 'Active Listening', description: 'Engaged and responsive listening skills' },
  { value: 'conflict-resolution', label: 'Conflict Resolution', description: 'Managing disagreements effectively' },
  { value: 'assertiveness', label: 'Assertiveness', description: 'Express needs confidently and respectfully' },
];

const DIFFICULTY_LEVELS = [
  { value: 'easy', label: 'Easy', description: 'Clear social cues, supportive scenarios' },
  { value: 'intermediate', label: 'Intermediate', description: 'More subtle cues, realistic situations' },
  { value: 'hard', label: 'Hard', description: 'Complex interactions, challenging scenarios' },
];

export default function CreateLessonPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    baseLessonType: '',
    numberOfModules: 3,
    difficulty: 'easy',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      // API call to generate custom lesson
      const response = await fetch('http://localhost:4000/api/lessons/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: '65a000000000000000000000', // Mock User ID
          baseLessonType: formData.baseLessonType,
          numberOfModules: formData.numberOfModules,
          difficulty: formData.difficulty,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Redirect to the newly created lesson
        router.push(`/lessons/${data.data.lessonId}`);
      } else {
        alert('Failed to generate lesson: ' + data.message);
      }
    } catch (err) {
      console.error('Error generating lesson:', err);
      alert('Failed to generate lesson. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedLesson = EXISTING_LESSONS.find(l => l.value === formData.baseLessonType);

  return (
    <div className="min-h-screen bg-[#E1D3BE] p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#5E7381] hover:text-[#4a5c6a] mb-4 font-medium transition-colors"
          >
            <ChevronLeft size={20} />
            Back
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center">
              <Sparkles size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-[#5E7381]">Create Custom Lesson</h1>
              <p className="text-[#5E7381]/70">AI-powered personalized practice scenarios</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-lg p-8">
          {/* Lesson Type Selection */}
          <div className="mb-8">
            <label className="block text-lg font-bold text-[#5E7381] mb-3">
              1. Choose Your Focus Area
            </label>
            <p className="text-sm text-gray-600 mb-4">
              Select which social skill you'd like to practice
            </p>
            
            <div className="grid grid-cols-1 gap-3">
              {EXISTING_LESSONS.map((lesson) => (
                <label
                  key={lesson.value}
                  className={`relative flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.baseLessonType === lesson.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="baseLessonType"
                    value={lesson.value}
                    checked={formData.baseLessonType === lesson.value}
                    onChange={(e) => setFormData({ ...formData, baseLessonType: e.target.value })}
                    className="sr-only"
                    required
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#5E7381]">{lesson.label}</span>
                      {formData.baseLessonType === lesson.value && (
                        <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                            <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" fill="none" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Number of Modules */}
          <div className="mb-8">
            <label className="block text-lg font-bold text-[#5E7381] mb-3">
              2. Number of Practice Modules
            </label>
            <p className="text-sm text-gray-600 mb-4">
              How many scenarios would you like to practice? (1-10)
            </p>
            
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.numberOfModules}
                onChange={(e) => setFormData({ ...formData, numberOfModules: parseInt(e.target.value) })}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="w-16 h-16 bg-purple-500 text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg">
                {formData.numberOfModules}
              </div>
            </div>
            
            <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
              <span>Quick (1-3)</span>
              <span>Standard (4-6)</span>
              <span>Comprehensive (7-10)</span>
            </div>
          </div>

          {/* Difficulty Level */}
          <div className="mb-8">
            <label className="block text-lg font-bold text-[#5E7381] mb-3">
              3. Select Difficulty Level
            </label>
            <p className="text-sm text-gray-600 mb-4">
              Choose the challenge level that matches your skill
            </p>
            
            <div className="grid grid-cols-3 gap-3">
              {DIFFICULTY_LEVELS.map((level) => (
                <label
                  key={level.value}
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all text-center ${
                    formData.difficulty === level.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="difficulty"
                    value={level.value}
                    checked={formData.difficulty === level.value}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="sr-only"
                  />
                  <div className="font-bold text-[#5E7381] mb-2">{level.label}</div>
                  <p className="text-xs text-gray-600">{level.description}</p>
                  {formData.difficulty === level.value && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                        <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" fill="none" />
                      </svg>
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Preview Summary */}
          {formData.baseLessonType && (
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 mb-8 border border-purple-200">
              <h3 className="font-bold text-[#5E7381] mb-3 flex items-center gap-2">
                <Sparkles size={20} className="text-purple-500" />
                Lesson Preview
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-700">
                  <span className="font-semibold">Focus:</span> {selectedLesson?.label}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Modules:</span> {formData.numberOfModules} practice scenarios
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Difficulty:</span> {formData.difficulty.charAt(0).toUpperCase() + formData.difficulty.slice(1)}
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              disabled={isGenerating}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating || !formData.baseLessonType}
              className={`flex-1 px-6 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                isGenerating || !formData.baseLessonType
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-purple-700 text-white hover:from-purple-600 hover:to-purple-800 shadow-lg hover:shadow-xl'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Generating with AI...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Generate Custom Lesson
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}