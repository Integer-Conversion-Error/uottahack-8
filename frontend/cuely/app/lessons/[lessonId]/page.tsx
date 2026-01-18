// app/lessons/[lessonId]/page.tsx
"use client";

import Link from "next/link";
import React, { useState, useEffect, useRef, use } from "react";
import { gsap } from "gsap";
import DefinitionPage from "@/components/DefinitionPage";
import ResultsPage, { SessionAnalysis } from "@/components/ResultsPage";
import Image from "next/image";

import PracticePage from "@/components/PracticePage";
import AchievementPopup from "@/components/AchievementPopup";

interface LessonPageProps {
  params: Promise<{
    lessonId: string;
  }>;
}

import { CreateLessonDTO, PageType } from "@/types/dto";

// Progress Bar Component
function ProgressBar({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full px-8">
      <div className="max-w-6xl mx-auto">
        <div className="w-full bg-white rounded-full h-2">
          <div
            className="bg-[#5E7381] h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function LessonPage({ params }: LessonPageProps) {
  // Unwrap params using React.use()
  const { lessonId } = use(params);

  const [lessonData, setLessonData] = useState<CreateLessonDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState<number>(-1);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [practiceIndex, setPracticeIndex] = useState<number>(0);
  const [newAchievement, setNewAchievement] = useState<string | null>(null);

  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);

  // Fetch lesson data
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await fetch(
          `http://localhost:4000/api/lessons/${lessonId}`,
        );
        const data = await res.json();
        if (data.success) {
          setLessonData(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch lesson:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId]);

  // Count total practice pages
  const totalPractices =
    lessonData?.pages.filter((p) => p.pageType === "practice").length || 0;

  useEffect(() => {
    // Only run animation if we have data and are in loading state
    if (pageIndex === -1 && lessonData) {
      if (titleRef.current && descriptionRef.current) {
        const tl = gsap.timeline({
          onComplete: () => {
            setTimeout(() => setPageIndex(0), 1000);
          },
        });
        tl.to(titleRef.current, {
          opacity: 1,
          duration: 1,
          ease: "power2.inOut",
        }).to(
          descriptionRef.current,
          { opacity: 1, duration: 1, ease: "power2.inOut" },
          "-=0.3",
        );
        return () => {
          tl.kill();
        };
      } else {
        setTimeout(() => setPageIndex(0), 1000);
      }
    }
  }, [pageIndex, lessonData]);

  // Start session once when lesson loads (not per practice)
  useEffect(() => {
    if (lessonData && !sessionId && pageIndex >= 0) {
      startSession();
    }
  }, [lessonData, pageIndex]);

  const startSession = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/sessions/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "65a000000000000000000000", // Mock User ID
          lessonId: lessonId,
          difficulty: "beginner",
          title: lessonData?.lessonName || "Practice Session",
          totalPractices: totalPractices,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSessionId(data.data.sessionId);
        console.log(
          "Session started:",
          data.data.sessionId,
          "Total practices:",
          totalPractices,
        );
      }
    } catch (err) {
      console.error("Failed to start session", err);
    }
  };

  const handlePracticeSubmit = async (blob: Blob) => {
    if (!sessionId) {
      console.error("No active session ID");
      return;
    }
    setIsSubmitting(true);

    const currentPage = lessonData?.pages[pageIndex];
    if (!currentPage) return;

    const formData = new FormData();
    formData.append("video", blob, "practice.webm");
    formData.append("transcript", currentPage.transcript || "");
    formData.append("practiceIndex", String(practiceIndex));
    formData.append("scenarioContext", currentPage.scenario?.context || "");
    formData.append("targetTone", lessonData?.lessonName || "Social Cue");
    formData.append(
      "promptContext",
      currentPage.scenario?.context || "Social interaction practice",
    );

    try {
      const res = await fetch(
        `http://localhost:4000/api/sessions/${sessionId}/complete`,
        {
          method: "PUT",
          body: formData,
        },
      );
      const data = await res.json();

      if (data.success) {
        console.log("Practice complete:", data.data);
        setAnalysisResult(data.data.analysis);
        setPracticeIndex((prev) => prev + 1);
        setShowFeedback(true);

        if (data.data.newlyUnlocked && data.data.newlyUnlocked.length > 0) {
          setNewAchievement(data.data.newlyUnlocked[0]);
        }
      } else {
        console.error("Analysis failed:", data.message);
        alert("Analysis failed: " + data.message);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!lessonData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Lesson not found: {lessonId}
      </div>
    );
  }

  const handleNext = () => {
    if (pageIndex < lessonData.pages.length - 1) {
      setPageIndex(pageIndex + 1);
    } else {
      setPageIndex(lessonData.pages.length); // Results phase
    }
  };

  const handleBack = () => {
    if (pageIndex > 0) {
      setPageIndex(pageIndex - 1);
    } else {
      setPageIndex(-1);
    }
  };

  const handleFeedbackNext = () => {
    setShowFeedback(false);
    setAnalysisResult(null);
    handleNext();
  };

  const currentPageData = lessonData?.pages?.[pageIndex];

  return (
    <div className="relative">
      {/* Container for content */}
      <div className="min-h-screen">
        {pageIndex === -1 && (
          <div className="min-h-screen flex items-center justify-center bg-[#E1D3BE]">
            <div className="text-center">
              <h1
                ref={titleRef}
                className="text-6xl font-bold text-black mb-4 opacity-0 font-[family-name:var(--font-josefin_sans)]"
              >
                Lesson {lessonData.lessonNumber}
              </h1>
              <p ref={descriptionRef} className="text-3xl text-black opacity-0">
                {lessonData.lessonName}
              </p>
            </div>
          </div>
        )}

        {pageIndex >= 0 &&
          pageIndex < lessonData.pages.length &&
          !showFeedback && (
            <div className="h-screen flex flex-col overflow-hidden pt-30">
              <ProgressBar
                currentStep={pageIndex + 1}
                totalSteps={lessonData.pages.length + 1}
              />
              {currentPageData.pageType === "definition" ? (
                <DefinitionPage
                  term={currentPageData.term}
                  definition={currentPageData.definition}
                  visualCues={currentPageData.visualCues}
                  toneCues={currentPageData.toneCues}
                  onNext={handleNext}
                  currentStep={pageIndex + 1}
                  totalSteps={lessonData.pages.length + 1}
                />
              ) : (
                <PracticePage
                  scenario={currentPageData.scenario}
                  audioSample={currentPageData.audioSample}
                  transcript={currentPageData.transcript}
                  onNext={handlePracticeSubmit}
                  onBack={handleBack}
                  currentStep={pageIndex + 1}
                  totalSteps={lessonData.pages.length + 1}
                  isSubmitting={isSubmitting}
                />
              )}
            </div>
          )}

        {showFeedback && analysisResult && (
          <div className="h-screen flex flex-col overflow-hidden">
            <ProgressBar
              currentStep={pageIndex + 1}
              totalSteps={lessonData.pages.length + 1}
            />
            <ResultsPage
              analysis={analysisResult}
              onNext={handleFeedbackNext}
              onTryAgain={() => setShowFeedback(false)}
              currentStep={pageIndex + 1}
              totalSteps={lessonData.pages.length + 1}
            />
          </div>
        )}

        {pageIndex === lessonData.pages.length && (
          <div className="min-h-screen bg-[#E1D3BE] flex items-center justify-center flex-col gap-6 text-center p-8">
            <h1 className="text-5xl font-bold text-[#5E7381]">
              Lesson Complete!
            </h1>
            <p className="text-xl text-gray-700">
              You have completed all scenarios.
            </p>
            <div className="flex gap-4 mt-8">
              <a
                href="/lessons"
                className="px-8 py-3 bg-white text-[#5E7381] rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm"
              >
                Back to Lessons
              </a>
              <a
                href="/dashboard"
                className="px-8 py-3 bg-[#5E7381] text-white rounded-xl font-bold hover:bg-[#4a5c6a] transition-colors shadow-lg"
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        )}
      </div>

      {newAchievement && (
        <AchievementPopup
          badgeId={newAchievement}
          onClose={() => setNewAchievement(null)}
        />
      )}
    </div>
  );
}
