'use client';

import React from 'react';
import AchievementsSection from '@/components/AchievementsSection';
import { Award, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AchievementsPage() {
    const userId = '65a000000000000000000000'; // Mock User ID matching dashboard

    return (
        <main className="p-10">
            <header className="flex flex-col mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#5E7381] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[#5E7381]/20">
                        <Award size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-[#5E7381]">Achievement Gallery</h1>
                        <p className="text-[#5E7381]/70">Track your milestones and social skills badges.</p>
                    </div>
                </div>
            </header>

            <div className="space-y-10">
                <AchievementsSection userId={userId} />
            </div>
        </main>
    );
}
