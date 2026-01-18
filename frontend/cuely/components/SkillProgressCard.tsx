'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SkillProgressCardProps {
    skillName: string;
    currentScore: number;
    icon: React.ReactNode;
    color: string;
    nextMilestone?: {
        name: string;
        threshold: number;
    };
}

export default function SkillProgressCard({
    skillName,
    currentScore,
    icon,
    color,
    nextMilestone
}: SkillProgressCardProps) {
    const percentage = Math.min(Math.round(currentScore), 100);
    
    // Calculate progress to next milestone
    const milestoneProgress = nextMilestone 
        ? Math.min((currentScore / nextMilestone.threshold) * 100, 100)
        : 100;
    
    const pointsToGo = nextMilestone 
        ? Math.max(nextMilestone.threshold - currentScore, 0)
        : 0;

    // Determine trend (mock for now - could be calculated from historical data)
    const trend = currentScore > 50 ? 'up' : currentScore > 30 ? 'stable' : 'down';

    return (
        <div className="bg-white rounded-2xl p-6 border border-[#5E7381]/10 shadow-sm hover:shadow-md transition-all">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                        {icon}
                    </div>
                    <div>
                        <h3 className="font-bold text-[#5E7381]">{skillName}</h3>
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                            {trend === 'up' && <TrendingUp size={12} className="text-green-500" />}
                            {trend === 'down' && <TrendingDown size={12} className="text-red-500" />}
                            {trend === 'stable' && <Minus size={12} className="text-slate-400" />}
                            <span className={
                                trend === 'up' ? 'text-green-500' : 
                                trend === 'down' ? 'text-red-500' : 
                                'text-slate-400'
                            }>
                                {trend === 'up' ? 'Improving' : trend === 'down' ? 'Needs work' : 'Stable'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-[#5E7381]">{percentage}</div>
                    <div className="text-xs text-slate-400">/ 100</div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-500 ${color.replace('bg-', 'bg-').replace('/10', '')}`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>

            {/* Next Milestone */}
            {nextMilestone && pointsToGo > 0 && (
                <div className="bg-slate-50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-slate-600">Next: {nextMilestone.name}</span>
                        <span className="text-xs font-bold text-[#5E7381]">{Math.round(milestoneProgress)}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                        <div 
                            className="h-full bg-[#5E7381] transition-all duration-500"
                            style={{ width: `${milestoneProgress}%` }}
                        />
                    </div>
                    <p className="text-xs text-slate-500">
                        {Math.round(pointsToGo)} points to go!
                    </p>
                </div>
            )}

            {nextMilestone && pointsToGo === 0 && (
                <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                    <p className="text-xs font-medium text-green-700">
                        ✅ Ready to unlock: {nextMilestone.name}
                    </p>
                </div>
            )}
        </div>
    );
}
