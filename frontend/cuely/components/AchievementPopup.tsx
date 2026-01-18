'use client';

import React, { useEffect, useState } from 'react';
import { Award, Star, X } from 'lucide-react';
import { gsap } from 'gsap';

interface Achievement {
    badgeId: string;
    name: string;
    description: string;
    iconUrl: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
}

interface AchievementPopupProps {
    badgeId: string;
    onClose: () => void;
}

export default function AchievementPopup({ badgeId, onClose }: AchievementPopupProps) {
    const [achievement, setAchievement] = useState<Achievement | null>(null);
    const popupRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchAchievement = async () => {
            try {
                const res = await fetch('/api/achievements');
                const data = await res.json();
                if (data.success) {
                    const found = data.data.find((a: Achievement) => a.badgeId === badgeId);
                    setAchievement(found);
                }
            } catch (err) {
                console.error('Failed to fetch achievement for popup', err);
            }
        };
        fetchAchievement();
    }, [badgeId]);

    useEffect(() => {
        if (achievement && popupRef.current) {
            const tl = gsap.timeline();
            tl.fromTo(popupRef.current, 
                { y: 100, opacity: 0, scale: 0.8 }, 
                { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.7)' }
            )
            .fromTo('.sparkle', 
                { scale: 0, rotate: 0 }, 
                { scale: 1, rotate: 180, duration: 0.5, stagger: 0.1, ease: 'back.out' },
                '-=0.4'
            );
        }
    }, [achievement]);

    if (!achievement) return null;

    const rarityColors = {
        common: 'text-slate-500',
        uncommon: 'text-blue-500',
        rare: 'text-purple-500',
        legendary: 'text-amber-500'
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pointer-events-none">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto" onClick={onClose} />
            
            <div 
                ref={popupRef}
                className="relative bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 max-w-sm w-full pointer-events-auto overflow-hidden"
            >
                {/* Background Sparkles */}
                <div className="absolute top-10 left-10 sparkle text-yellow-400 opacity-30"><Star size={20} fill="currentColor" /></div>
                <div className="absolute top-20 right-12 sparkle text-blue-400 opacity-30"><Star size={16} fill="currentColor" /></div>
                <div className="absolute bottom-20 left-12 sparkle text-purple-400 opacity-30"><Star size={24} fill="currentColor" /></div>

                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-500 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#5E7381]/20 to-transparent rounded-3xl animate-pulse" />
                        {achievement.iconUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={achievement.iconUrl} alt={achievement.name} className="w-16 h-16 object-contain relative z-10" />
                        ) : (
                            <Award size={48} className="text-[#5E7381] relative z-10" />
                        )}
                    </div>

                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${rarityColors[achievement.rarity]}`}>
                        New Achievement Unlocked
                    </span>
                    
                    <h2 className="text-2xl font-bold text-slate-800 mb-2 font-[family-name:var(--font-josefin_sans)]">
                        {achievement.name}
                    </h2>
                    
                    <p className="text-sm text-slate-500 leading-relaxed mb-8">
                        {achievement.description}
                    </p>

                    <button 
                        onClick={onClose}
                        className="w-full py-4 bg-[#5E7381] text-white rounded-2xl font-bold hover:bg-[#4a5c6a] transition-all shadow-lg active:scale-95"
                    >
                        Awesome!
                    </button>
                </div>
            </div>
        </div>
    );
}
