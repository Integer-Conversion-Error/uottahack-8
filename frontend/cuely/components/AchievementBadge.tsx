'use client';

import React from 'react';
import { Award } from 'lucide-react';

interface AchievementBadgeProps {
    name: string;
    description: string;
    iconUrl?: string;
    unlocked?: boolean;
    unlockedAt?: string;
    rarity?: 'common' | 'uncommon' | 'rare' | 'legendary';
}

export default function AchievementBadge({ 
    name, 
    description, 
    iconUrl, 
    unlocked = false, 
    unlockedAt,
    rarity = 'common' 
}: AchievementBadgeProps) {
    const rarityColors = {
        common: 'border-slate-200 text-slate-500 bg-slate-50',
        uncommon: 'border-blue-200 text-blue-600 bg-blue-50',
        rare: 'border-purple-200 text-purple-600 bg-purple-50',
        legendary: 'border-amber-200 text-amber-600 bg-amber-50'
    };

    return (
        <div className={`
            relative group p-4 rounded-2xl border-2 transition-all duration-300
            ${unlocked 
                ? `${rarityColors[rarity]} shadow-sm hover:shadow-md hover:scale-[1.02] cursor-default` 
                : 'border-dashed border-slate-200 opacity-40 grayscale'}
        `}>
            {unlocked && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#5E7381] text-white rounded-full flex items-center justify-center shadow-sm">
                    <Award size={12} />
                </div>
            )}
            
            <div className="flex flex-col items-center text-center gap-3">
                <div className={`
                    w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6
                    ${unlocked ? 'bg-white shadow-inner' : 'bg-slate-100'}
                `}>
                    {iconUrl ? (
                         // eslint-disable-next-line @next/next/no-img-element
                        <img src={iconUrl} alt={name} className="w-10 h-10 object-contain" />
                    ) : (
                        <Award size={32} className={unlocked ? 'text-[#5E7381]' : 'text-slate-300'} />
                    )}
                </div>
                
                <div>
                    <h4 className={`text-sm font-bold ${unlocked ? 'text-[#5E7381]' : 'text-slate-400'}`}>
                        {name}
                    </h4>
                    <p className="text-[10px] leading-tight text-slate-400 mt-1 max-w-[120px]">
                        {description}
                    </p>
                </div>

                {unlocked && unlockedAt && (
                    <span className="text-[9px] font-medium text-slate-300 uppercase tracking-wider">
                        Earned {new Date(unlockedAt).toLocaleDateString()}
                    </span>
                )}
            </div>

            {/* Tooltip on hover if locked */}
            {!unlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl backdrop-blur-[1px]">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Locked</span>
                </div>
            )}
        </div>
    );
}
