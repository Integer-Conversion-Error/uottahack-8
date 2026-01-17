'use client';

import React from 'react';
import Link from 'next/link';

interface AnalysisItem {
  score: 'thumbs-up' | 'thumbs-sideways' | 'thumbs-down';
  feedback: string;
}

interface AnalysisResult {
  facial_expression: AnalysisItem;
  eye_contact: AnalysisItem;
  body_language: AnalysisItem;
  tone: AnalysisItem;
  token_usage?: any;
}

interface ResultsPageProps {
  analysis: AnalysisResult;
  onNext: () => void;
  onRetry?: () => void; // Optional retry logic
  isLastStep: boolean;
}

const ScoreIcon = ({ score }: { score: string }) => {
  if (score === 'thumbs-up') return <span className="text-2xl">👍</span>;
  if (score === 'thumbs-sideways') return <span className="text-2xl">😐</span>;
  return <span className="text-2xl">👎</span>;
};

const ScoreCard = ({ title, item }: { title: string, item: AnalysisItem }) => {
  const getBgColor = (score: string) => {
    if (score === 'thumbs-up') return 'bg-green-50 border-green-200';
    if (score === 'thumbs-sideways') return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className={`p-4 rounded-xl border ${getBgColor(item.score)}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-gray-800">{title}</h3>
        <ScoreIcon score={item.score} />
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{item.feedback}</p>
    </div>
  );
};

export default function ResultsPage({ analysis, onNext, onRetry, isLastStep }: ResultsPageProps) {
  if (!analysis) return <div>Loading results...</div>;

  return (
    <div className="min-h-screen bg-[#E1D3BE] flex items-center justify-center p-8">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="p-8 bg-white border-b border-gray-100">
          <h1 className="text-3xl font-bold text-[#5E7381] mb-2">Feedback</h1>
          <p className="text-gray-500">Here is how you did on this scenario.</p>
        </div>

        <div className="p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <ScoreCard title="Facial Expression" item={analysis.facial_expression} />
          <ScoreCard title="Eye Contact" item={analysis.eye_contact} />
          <ScoreCard title="Body Language" item={analysis.body_language} />
          <ScoreCard title="Tone of Voice" item={analysis.tone} />
          
          {analysis.token_usage && (
             <div className="col-span-full mt-4 text-xs text-gray-400 text-center">
                Estimated Cost: ${analysis.token_usage.estimatedCostUSD?.toFixed(6)}
             </div>
          )}
        </div>

        <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
          {onRetry && (
            <button 
                onClick={onRetry}
                className="text-gray-500 hover:text-gray-800 font-medium px-4 py-2"
            >
                Try Again
            </button>
          )}
          
          <button
            onClick={onNext}
            className="px-8 py-3 bg-[#5E7381] text-white rounded-xl font-semibold hover:bg-[#4a5c6a] transition-all transform hover:scale-105 shadow-lg ml-auto"
          >
            {isLastStep ? 'Finish Lesson' : 'Next Scenario →'}
          </button>
        </div>
      </div>
    </div>
  );
}
