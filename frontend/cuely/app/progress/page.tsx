'use client';

import React, { useState, useEffect } from 'react';
import { Smile, Mic, Eye, User, Trophy, Flame, Target, Clock } from 'lucide-react';
import SkillProgressCard from '@/components/SkillProgressCard';
import MilestoneTracker from '@/components/MilestoneTracker';

export default function ProgressPage() {
    const [userData, setUserData] = useState<any>(null);
    const [achievements, setAchievements] = useState<any[]>([]);
    const [userAchievements, setUserAchievements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const userId = '65a000000000000000000000';

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch user data
                const userRes = await fetch(`http://localhost:4000/api/sessions/user/${userId}`);
                const userData = await userRes.json();
                
                // Fetch all achievements
                const achievementsRes = await fetch('http://localhost:4000/api/achievements');
                const achievementsData = await achievementsRes.json();
                
                // Fetch user achievements
                const userAchievementsRes = await fetch(`http://localhost:4000/api/achievements/user/${userId}`);
                const userAchievementsData = await userAchievementsRes.json();

                if (userData.success && userData.data.length > 0) {
                    setUserData(userData.data[0]);
                }
                if (achievementsData.success) {
                    setAchievements(achievementsData.data);
                }
                if (userAchievementsData.success) {
                    setUserAchievements(userAchievementsData.data);
                }
            } catch (error) {
                console.error('Error fetching progress data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#E1D3BE] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#5E7381] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[#5E7381] font-medium">Loading your progress...</p>
                </div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="min-h-screen bg-[#E1D3BE] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-[#5E7381] font-medium">No user data found</p>
                </div>
            </div>
        );
    }

    const stats = userData.stats || {};
    const skills = userData.skills || {};

    // Calculate completion percentage
    const totalAchievements = achievements.length;
    const unlockedAchievements = userAchievements.length;
    const completionPercentage = totalAchievements > 0 
        ? Math.round((unlockedAchievements / totalAchievements) * 100) 
        : 0;

    return (
        <div className="min-h-screen bg-[#E1D3BE]">
            <main className="p-10">
                {/* Header */}
                <header className="flex flex-col mb-10">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#5E7381] to-[#4a5c6a] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[#5E7381]/30">
                            <Trophy size={32} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-[#5E7381]">Your Progress</h1>
                            <p className="text-[#5E7381]/70 text-lg">Track your improvement and upcoming achievements</p>
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        {/* Scenarios Completed */}
                        <div className="bg-white rounded-2xl p-6 border border-[#5E7381]/10 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <Target size={20} className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wide">Scenarios</p>
                                    <p className="text-2xl font-bold text-[#5E7381]">{stats.scenariosCompleted || 0}</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500">Completed</p>
                        </div>

                        {/* Current Streak */}
                        <div className="bg-white rounded-2xl p-6 border border-[#5E7381]/10 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                                    <Flame size={20} className="text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wide">Streak</p>
                                    <p className="text-2xl font-bold text-[#5E7381]">{stats.currentStreakDays || 0}</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500">Days in a row</p>
                        </div>

                        {/* Overall Score */}
                        <div className="bg-white rounded-2xl p-6 border border-[#5E7381]/10 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                    <Trophy size={20} className="text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wide">Overall</p>
                                    <p className="text-2xl font-bold text-[#5E7381]">{Math.round(stats.overallEmpathyScore || 0)}</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500">Empathy score</p>
                        </div>

                        {/* Achievement Progress */}
                        <div className="bg-white rounded-2xl p-6 border border-[#5E7381]/10 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                    <Trophy size={20} className="text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wide">Achievements</p>
                                    <p className="text-2xl font-bold text-[#5E7381]">{completionPercentage}%</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500">{unlockedAchievements}/{totalAchievements} unlocked</p>
                        </div>
                    </div>
                </header>

                <div className="space-y-8">
                    {/* Skills Section */}
                    <div>
                    <h2 className="text-2xl font-bold text-[#5E7381] mb-4">Your Skills</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <SkillProgressCard
                            skillName="Facial Expression"
                            currentScore={skills.facialExpression || 0}
                            icon={<Smile size={24} className="text-pink-600" />}
                            color="bg-pink-100"
                            nextMilestone={{
                                name: "Facial Pro",
                                threshold: 80
                            }}
                        />
                        <SkillProgressCard
                            skillName="Tone Control"
                            currentScore={skills.toneControl || 0}
                            icon={<Mic size={24} className="text-blue-600" />}
                            color="bg-blue-100"
                        />
                        <SkillProgressCard
                            skillName="Eye Contact"
                            currentScore={skills.eyeContact || 0}
                            icon={<Eye size={24} className="text-green-600" />}
                            color="bg-green-100"
                        />
                        <SkillProgressCard
                            skillName="Body Language"
                            currentScore={skills.bodyLanguage || 0}
                            icon={<User size={24} className="text-purple-600" />}
                            color="bg-purple-100"
                        />
                    </div>
                </div>

                {/* Milestones Section */}
                <div>
                    <MilestoneTracker
                        achievements={achievements}
                        userAchievements={userAchievements}
                        userStats={{
                            scenariosCompleted: stats.scenariosCompleted || 0,
                            currentStreakDays: stats.currentStreakDays || 0,
                            overallEmpathyScore: stats.overallEmpathyScore || 0
                        }}
                        userSkills={{
                            facialExpression: skills.facialExpression || 0,
                            toneControl: skills.toneControl || 0,
                            eyeContact: skills.eyeContact || 0,
                            bodyLanguage: skills.bodyLanguage || 0
                        }}
                    />
                </div>
            </div>
            </main>
        </div>
    );
}
