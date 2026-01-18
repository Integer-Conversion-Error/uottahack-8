'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AchievementBadge from './AchievementBadge';
import { Award, ChevronRight } from 'lucide-react';

interface Achievement {
    badgeId: string;
    name: string;
    description: string;
    iconUrl: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
}

interface UserAchievement {
    badgeId: string;
    unlockedAt: string;
    metadata?: Achievement;
}

export default function AchievementsSection({ userId }: { userId: string }) {
    const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
    const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all available achievements
                const allRes = await fetch('http://localhost:4000/api/achievements');
                const allData = await allRes.json();
                
                // Fetch user unlocked achievements
                const userRes = await fetch(`http://localhost:4000/api/achievements/user/${userId}`);
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

    if (loading) {
        return (
            <div className="bg-white rounded-3xl p-8 border border-[#5E7381]/10 shadow-sm animate-pulse">
                <div className="h-6 w-32 bg-slate-100 rounded-lg mb-6" />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-40 bg-slate-50 rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <section className="bg-white rounded-3xl p-8 border border-[#5E7381]/10 shadow-sm transition-all hover:shadow-md">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#5E7381]/10 text-[#5E7381] rounded-xl flex items-center justify-center">
                        <Award size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-[#5E7381]">Achievements</h2>
                        <p className="text-xs text-[#5E7381]/50">{userAchievements.length} of {allAchievements.length} unlocked</p>
                    </div>
                </div>
                <Link href="/achievements" className="flex items-center gap-1 text-sm font-bold text-[#5E7381] hover:gap-2 transition-all group">
                    View Gallery <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {allAchievements.map((achievement) => {
                    const userEarned = userAchievements.find(ua => ua.badgeId === achievement.badgeId);
                    return (
                        <AchievementBadge
                            key={achievement.badgeId}
                            name={achievement.name}
                            description={achievement.description}
                            iconUrl={achievement.iconUrl}
                            unlocked={!!userEarned}
                            unlockedAt={userEarned?.unlockedAt}
                            rarity={achievement.rarity}
                        />
                    );
                })}
            </div>
        </section>
    );
}
