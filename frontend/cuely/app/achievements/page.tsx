'use client';

import React, { useEffect, useState } from 'react';
import DetailedAchievementCard from '@/components/DetailedAchievementCard';
import { Award, Trophy, Star, Filter, ChevronDown } from 'lucide-react';
import Link from 'next/link';

interface Achievement {
    badgeId: string;
    name: string;
    description: string;
    iconUrl: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
    points: number;
    criteria: {
        type: string;
        threshold: number;
    };
}

interface UserAchievement {
    badgeId: string;
    unlockedAt: string;
    progress?: number;
}

type FilterType = 'all' | 'unlocked' | 'locked';
type RarityFilter = 'all' | 'common' | 'uncommon' | 'rare' | 'legendary';

export default function AchievementsPage() {
    const userId = '65a000000000000000000000'; // Mock User ID matching dashboard
    
    const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
    const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>('all');
    const [rarityFilter, setRarityFilter] = useState<RarityFilter>('all');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const allRes = await fetch('/api/achievements');
                const allData = await allRes.json();
                
                const userRes = await fetch(`/api/achievements/user/${userId}`);
                const userData = await userRes.json();

                if (allData.success) setAllAchievements(allData.data);
                if (userData.success) setUserAchievements(userData.data);
            } catch (err) {
                console.error('Failed to fetch achievements', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    const unlockedBadgeIds = new Set(userAchievements.map(ua => ua.badgeId));
    const totalPoints = allAchievements
        .filter(a => unlockedBadgeIds.has(a.badgeId))
        .reduce((sum, a) => sum + a.points, 0);
    
    const completionPercentage = allAchievements.length > 0 
        ? Math.round((userAchievements.length / allAchievements.length) * 100)
        : 0;

    const rarityBreakdown = {
        common: 0,
        uncommon: 0,
        rare: 0,
        legendary: 0
    };

    userAchievements.forEach(ua => {
        const achievement = allAchievements.find(a => a.badgeId === ua.badgeId);
        if (achievement) {
            rarityBreakdown[achievement.rarity]++;
        }
    });

    const filteredAchievements = allAchievements.filter(achievement => {
        const isUnlocked = unlockedBadgeIds.has(achievement.badgeId);
        
        if (filter === 'unlocked' && !isUnlocked) return false;
        if (filter === 'locked' && isUnlocked) return false;
        if (rarityFilter !== 'all' && achievement.rarity !== rarityFilter) return false;
        
        return true;
    });

    if (loading) {
        return (
            <main className="p-10">
                <div className="animate-pulse space-y-6">
                    <div className="h-12 w-64 bg-slate-200 rounded-lg" />
                    <div className="grid grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-32 bg-slate-100 rounded-2xl" />
                        ))}
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-40 bg-slate-100 rounded-3xl" />
                        ))}
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="p-10">
            {/* Header */}
            <header className="flex flex-col mb-10">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#5E7381] to-[#4a5c6a] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[#5E7381]/30">
                        <Award size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-[#5E7381]">Achievement Gallery</h1>
                        <p className="text-[#5E7381]/70 text-lg">Track your milestones and unlock new badges</p>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-2xl border border-[#5E7381]/10 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                <Trophy size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 uppercase tracking-wide">Unlocked</p>
                                <p className="text-2xl font-bold text-[#5E7381]">
                                    {userAchievements.length}/{allAchievements.length}
                                </p>
                            </div>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-blue-500 transition-all duration-500"
                                style={{ width: `${completionPercentage}%` }}
                            />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-[#5E7381]/10 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                                <Star size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 uppercase tracking-wide">Total Points</p>
                                <p className="text-2xl font-bold text-[#5E7381]">{totalPoints}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-[#5E7381]/10 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                                <Award size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 uppercase tracking-wide">Rare+</p>
                                <p className="text-2xl font-bold text-[#5E7381]">
                                    {rarityBreakdown.rare + rarityBreakdown.legendary}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-[#5E7381]/10 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                                <Trophy size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 uppercase tracking-wide">Completion</p>
                                <p className="text-2xl font-bold text-[#5E7381]">{completionPercentage}%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-[#5E7381]/10 shadow-sm">
                        <Filter size={16} className="text-[#5E7381]" />
                        <span className="text-sm font-medium text-[#5E7381]">Status:</span>
                        <select 
                            value={filter} 
                            onChange={(e) => setFilter(e.target.value as FilterType)}
                            className="text-sm font-bold text-[#5E7381] bg-transparent border-none outline-none cursor-pointer"
                        >
                            <option value="all">All</option>
                            <option value="unlocked">Unlocked</option>
                            <option value="locked">Locked</option>
                        </select>
                        <ChevronDown size={16} className="text-[#5E7381]" />
                    </div>

                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-[#5E7381]/10 shadow-sm">
                        <Filter size={16} className="text-[#5E7381]" />
                        <span className="text-sm font-medium text-[#5E7381]">Rarity:</span>
                        <select 
                            value={rarityFilter} 
                            onChange={(e) => setRarityFilter(e.target.value as RarityFilter)}
                            className="text-sm font-bold text-[#5E7381] bg-transparent border-none outline-none cursor-pointer"
                        >
                            <option value="all">All</option>
                            <option value="common">Common</option>
                            <option value="uncommon">Uncommon</option>
                            <option value="rare">Rare</option>
                            <option value="legendary">Legendary</option>
                        </select>
                        <ChevronDown size={16} className="text-[#5E7381]" />
                    </div>
                </div>
            </header>

            {/* Achievements Grid */}
            <div className="space-y-4">
                {filteredAchievements.length === 0 ? (
                    <div className="text-center py-20">
                        <Award size={64} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-xl text-slate-400">No achievements found with current filters</p>
                    </div>
                ) : (
                    filteredAchievements.map((achievement) => {
                        const userEarned = userAchievements.find(ua => ua.badgeId === achievement.badgeId);
                        return (
                            <DetailedAchievementCard
                                key={achievement.badgeId}
                                name={achievement.name}
                                description={achievement.description}
                                iconUrl={achievement.iconUrl}
                                unlocked={!!userEarned}
                                unlockedAt={userEarned?.unlockedAt}
                                rarity={achievement.rarity}
                                points={achievement.points}
                                criteria={achievement.criteria}
                                progress={userEarned?.progress || 0}
                            />
                        );
                    })
                )}
            </div>
        </main>
    );
}
