'use client';

import React from 'react';
import { Lock, CheckCircle, Target } from 'lucide-react';

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

interface MilestoneTrackerProps {
    achievements: Achievement[];
    userAchievements: { badgeId: string; unlockedAt: string }[];
    userStats: {
        scenariosCompleted: number;
        currentStreakDays: number;
        overallEmpathyScore: number;
    };
    userSkills: {
        facialExpression: number;
        toneControl: number;
        eyeContact: number;
        bodyLanguage: number;
    };
}

export default function MilestoneTracker({
    achievements,
    userAchievements,
    userStats,
    userSkills
}: MilestoneTrackerProps) {
    const unlockedBadgeIds = new Set(userAchievements.map(ua => ua.badgeId));

    // Calculate progress for each achievement
    const achievementsWithProgress = achievements.map(achievement => {
        const isUnlocked = unlockedBadgeIds.has(achievement.badgeId);
        
        let currentValue = 0;
        switch (achievement.criteria.type) {
            case 'lessons_completed':
                currentValue = userStats.scenariosCompleted;
                break;
            case 'streak':
                currentValue = userStats.currentStreakDays;
                break;
            case 'overall_score':
                currentValue = userStats.overallEmpathyScore;
                break;
            case 'facial_expression':
                currentValue = userSkills.facialExpression;
                break;
            case 'tone_control':
                currentValue = userSkills.toneControl;
                break;
            default:
                currentValue = 0;
        }

        const progress = Math.min((currentValue / achievement.criteria.threshold) * 100, 100);
        const remaining = Math.max(achievement.criteria.threshold - currentValue, 0);

        return {
            ...achievement,
            isUnlocked,
            currentValue,
            progress,
            remaining
        };
    });

    // Sort: unlocked first, then by progress (highest first)
    const sortedAchievements = [...achievementsWithProgress].sort((a, b) => {
        if (a.isUnlocked && !b.isUnlocked) return -1;
        if (!a.isUnlocked && b.isUnlocked) return 1;
        return b.progress - a.progress;
    });

    // Find next milestone (highest progress that's not unlocked)
    const nextMilestone = achievementsWithProgress
        .filter(a => !a.isUnlocked)
        .sort((a, b) => b.progress - a.progress)[0];

    const rarityColors = {
        common: 'border-slate-200 bg-slate-50',
        uncommon: 'border-blue-200 bg-blue-50',
        rare: 'border-purple-200 bg-purple-50',
        legendary: 'border-amber-200 bg-amber-50'
    };

    const getCriteriaText = (type: string, threshold: number) => {
        const typeMap: Record<string, string> = {
            'lessons_completed': 'Complete',
            'streak': 'Maintain',
            'overall_score': 'Achieve',
            'facial_expression': 'Facial expression',
            'tone_control': 'Tone control'
        };
        const unit = type.includes('score') || type.includes('expression') || type.includes('control') ? '' : type === 'streak' ? ' day streak' : ' lessons';
        return `${typeMap[type] || type} ${threshold}${unit}`;
    };

    return (
        <div className="space-y-6">
            {/* Next Milestone Highlight */}
            {nextMilestone && (
                <div className="bg-gradient-to-r from-[#5E7381] to-[#4a5c6a] rounded-3xl p-6 text-white">
                    <div className="flex items-center gap-3 mb-4">
                        <Target size={24} />
                        <h3 className="text-xl font-bold">Next Milestone</h3>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                            {nextMilestone.iconUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={nextMilestone.iconUrl} alt={nextMilestone.name} className="w-10 h-10" />
                            ) : (
                                <Lock size={32} />
                            )}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-lg mb-1">{nextMilestone.name}</h4>
                            <p className="text-sm text-white/80 mb-2">{nextMilestone.description}</p>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-white transition-all duration-500"
                                        style={{ width: `${nextMilestone.progress}%` }}
                                    />
                                </div>
                                <span className="text-sm font-bold">{Math.round(nextMilestone.progress)}%</span>
                            </div>
                            <p className="text-xs text-white/70 mt-2">
                                {Math.round(nextMilestone.remaining)} more to go!
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* All Milestones */}
            <div>
                <h3 className="text-xl font-bold text-[#5E7381] mb-4">All Milestones</h3>
                <div className="space-y-3">
                    {sortedAchievements.map(achievement => (
                        <div 
                            key={achievement.badgeId}
                            className={`p-4 rounded-2xl border-2 transition-all ${
                                achievement.isUnlocked 
                                    ? `${rarityColors[achievement.rarity]} border-opacity-100` 
                                    : 'border-dashed border-slate-200 bg-slate-50/50'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                {/* Icon */}
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                                    achievement.isUnlocked ? 'bg-white' : 'bg-slate-100'
                                }`}>
                                    {achievement.isUnlocked ? (
                                        <CheckCircle size={28} className="text-green-500" />
                                    ) : achievement.iconUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={achievement.iconUrl} alt={achievement.name} className="w-8 h-8 opacity-40" />
                                    ) : (
                                        <Lock size={28} className="text-slate-300" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className={`font-bold ${achievement.isUnlocked ? 'text-[#5E7381]' : 'text-slate-400'}`}>
                                            {achievement.name}
                                        </h4>
                                        <span className="text-xs font-bold text-slate-400">{achievement.points} pts</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mb-2">{achievement.description}</p>
                                    
                                    {!achievement.isUnlocked && (
                                        <>
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-[#5E7381] transition-all duration-500"
                                                        style={{ width: `${achievement.progress}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold text-[#5E7381]">{Math.round(achievement.progress)}%</span>
                                            </div>
                                            <p className="text-xs text-slate-400">
                                                {getCriteriaText(achievement.criteria.type, achievement.criteria.threshold)} 
                                                {' • '}
                                                {Math.round(achievement.currentValue)}/{achievement.criteria.threshold}
                                            </p>
                                        </>
                                    )}

                                    {achievement.isUnlocked && (
                                        <p className="text-xs font-medium text-green-600">✅ Unlocked!</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
