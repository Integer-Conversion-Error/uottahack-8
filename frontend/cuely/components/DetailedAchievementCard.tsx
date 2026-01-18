'use client';

import React from 'react';
import { Award, Lock, TrendingUp, Calendar, Star } from 'lucide-react';

interface DetailedAchievementCardProps {
    name: string;
    description: string;
    iconUrl?: string;
    unlocked?: boolean;
    unlockedAt?: string;
    rarity?: 'common' | 'uncommon' | 'rare' | 'legendary';
    points?: number;
    criteria?: {
        type: string;
        threshold: number;
    };
    progress?: number;
}

export default function DetailedAchievementCard({ 
    name, 
    description, 
    iconUrl, 
    unlocked = false, 
    unlockedAt,
    rarity = 'common',
    points = 0,
    criteria,
    progress = 0
}: DetailedAchievementCardProps) {
    const rarityConfig = {
        common: {
            border: 'border-slate-200',
            accent: 'bg-slate-100',
            text: 'text-slate-600',
            badge: 'bg-slate-100 text-slate-700',
            iconBg: 'bg-slate-50'
        },
        uncommon: {
            border: 'border-blue-200',
            accent: 'bg-blue-100',
            text: 'text-blue-600',
            badge: 'bg-blue-100 text-blue-700',
            iconBg: 'bg-blue-50'
        },
        rare: {
            border: 'border-purple-200',
            accent: 'bg-purple-100',
            text: 'text-purple-600',
            badge: 'bg-purple-100 text-purple-700',
            iconBg: 'bg-purple-50'
        },
        legendary: {
            border: 'border-amber-200',
            accent: 'bg-amber-100',
            text: 'text-amber-600',
            badge: 'bg-amber-100 text-amber-700',
            iconBg: 'bg-amber-50'
        }
    };

    const config = rarityConfig[rarity];

    const getCriteriaText = () => {
        if (!criteria) return null;
        const typeMap: Record<string, string> = {
            'lessons_completed': 'Complete lessons',
            'streak': 'Maintain streak',
            'mastery': 'Master scenarios',
            'overall_score': 'Achieve score',
            'facial_expression': 'Facial expression score',
            'tone_control': 'Tone control score'
        };
        return `${typeMap[criteria.type] || criteria.type}: ${criteria.threshold}`;
    };

    return (
        <div className={`
            relative p-6 rounded-3xl border transition-all duration-300 bg-white
            ${unlocked 
                ? `${config.border} shadow-sm hover:shadow-md hover:scale-[1.01]` 
                : 'border-dashed border-slate-200 opacity-60'}
        `}>
            {/* Rarity Badge */}
            <div className="absolute -top-3 -right-3 flex gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${config.badge} shadow-sm`}>
                    {rarity}
                </span>
                {unlocked && (
                    <div className="w-8 h-8 bg-[#5E7381] text-white rounded-full flex items-center justify-center shadow-md">
                        <Award size={16} />
                    </div>
                )}
            </div>

            <div className="flex gap-6">
                {/* Icon Section */}
                <div className={`
                    flex-shrink-0 w-24 h-24 rounded-2xl flex items-center justify-center transition-transform hover:rotate-6
                    ${unlocked ? config.iconBg : 'bg-slate-100'}
                `}>
                    {iconUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={iconUrl} alt={name} className="w-16 h-16 object-contain" />
                    ) : unlocked ? (
                        <Award size={48} className="text-[#5E7381]" />
                    ) : (
                        <Lock size={48} className="text-slate-300" />
                    )}
                </div>

                {/* Content Section */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                            <h3 className={`text-xl font-bold mb-1 ${unlocked ? 'text-[#5E7381]' : 'text-slate-400'}`}>
                                {name}
                            </h3>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                {description}
                            </p>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex flex-wrap gap-4 mt-4">
                        {/* Points */}
                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${unlocked ? config.accent : 'bg-slate-100'}`}>
                                <Star size={16} className={unlocked ? config.text : 'text-slate-400'} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 uppercase tracking-wide">Points</p>
                                <p className={`text-sm font-bold ${unlocked ? config.text : 'text-slate-400'}`}>{points}</p>
                            </div>
                        </div>

                        {/* Unlock Date or Criteria */}
                        {unlocked && unlockedAt ? (
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.accent}`}>
                                    <Calendar size={16} className={config.text} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wide">Earned</p>
                                    <p className={`text-sm font-bold ${config.text}`}>
                                        {new Date(unlockedAt).toLocaleDateString('en-US', { 
                                            month: 'short', 
                                            day: 'numeric', 
                                            year: 'numeric' 
                                        })}
                                    </p>
                                </div>
                            </div>
                        ) : criteria && (
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                    <TrendingUp size={16} className="text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wide">Requirement</p>
                                    <p className="text-sm font-bold text-slate-500">{getCriteriaText()}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Progress Bar for Locked Achievements */}
                    {!unlocked && progress > 0 && (
                        <div className="mt-4">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-medium text-slate-500">Progress</span>
                                <span className="text-xs font-bold text-slate-600">{Math.round(progress)}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-[#5E7381] transition-all duration-500 rounded-full"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Locked Overlay */}
                    {!unlocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/60 opacity-0 hover:opacity-100 transition-opacity rounded-3xl backdrop-blur-sm">
                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-full shadow-lg">
                                <Lock size={16} />
                                <span className="text-sm font-bold">Locked</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
