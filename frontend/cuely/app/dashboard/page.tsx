'use client';

import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Link from 'next/link';
import { 
    LayoutDashboard, 
    BookOpen, 
    TrendingUp, 
    Award, 
    Clock, 
    ChevronRight,
    Search,
    Filter
} from 'lucide-react';
import AchievementsSection from '@/components/AchievementsSection';

interface Session {
    _id: string;
    lessonId?: string;
    scenarioId?: {
        title: string;
        category: string;
    };
    startedAt: string;
    completedAt?: string;
    completedPractices: number;
    totalPractices: number;
    difficulty: string;
    analysis?: {
        facial_expression: { score: string };
        eye_contact: { score: string };
        body_language: { score: string };
        tone: { score: string };
    };
}

export default function DashboardPage() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalSessions: 0,
        avgScore: 0,
        completionRate: 0,
        hoursPracticed: 0
    });

    const headerRef = useRef(null);
    const statsRef = useRef(null);
    const sessionsRef = useRef(null);

    useEffect(() => {
        fetchSessions();
    }, []);

    useEffect(() => {
        if (!loading) {
            const tl = gsap.timeline();
            tl.fromTo(headerRef.current, 
                { opacity: 0, y: -20 }, 
                { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
            )
            .fromTo('.stat-card', 
                { opacity: 0, scale: 0.95 }, 
                { opacity: 1, scale: 1, duration: 0.4, stagger: 0.1, ease: 'back.out(1.2)' },
                '-=0.3'
            )
            .fromTo('.session-row', 
                { opacity: 0, x: -10 }, 
                { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' },
                '-=0.2'
            );
        }
    }, [loading]);

    const fetchSessions = async () => {
        try {
            const userId = '65a000000000000000000000'; // Mock User ID
            const res = await fetch(`http://localhost:4000/api/sessions/user/${userId}`);
            const data = await res.json();
            
            if (data.success) {
                setSessions(data.data);
                calculateStats(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch sessions', err);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (sessionList: Session[]) => {
        const total = sessionList.length;
        const complete = sessionList.filter(s => s.completedAt).length;
        const rate = total > 0 ? (complete / total) * 100 : 0;
        
        // Mock avg score calculation based on thumbs
        const scoreSum = sessionList.reduce((acc, s) => {
            if (!s.analysis) return acc;
            const scoreMap: Record<string, number> = { 'thumbs-up': 100, 'thumbs-sideways': 50, 'thumbs-down': 0 };
            const sScores = [
                scoreMap[s.analysis.facial_expression?.score] || 0,
                scoreMap[s.analysis.eye_contact?.score] || 0,
                scoreMap[s.analysis.body_language?.score] || 0,
                scoreMap[s.analysis.tone?.score] || 0
            ];
            return acc + (sScores.reduce((a, b) => a + b, 0) / 4);
        }, 0);

        setStats({
            totalSessions: total,
            avgScore: total > 0 ? Math.round(scoreSum / total) : 0,
            completionRate: Math.round(rate),
            hoursPracticed: Math.round(total * 0.5) // Mock: each session ~30 mins
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getScoreColor = (score: string) => {
        switch (score) {
            case 'thumbs-up': return 'text-green-500';
            case 'thumbs-sideways': return 'text-yellow-500';
            case 'thumbs-down': return 'text-red-500';
            default: return 'text-gray-300';
        }
    };

    return (
        <main className="p-10">
            <header ref={headerRef} className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-[#5E7381] mb-1">Welcome back, Alex!</h1>
                    <p className="text-[#5E7381]/70">Track your progress and improve your social confidence.</p>
                </div>
                <div className="flex gap-3">
                    <button className="p-2.5 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors">
                        <Search size={20} />
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-[#5E7381] text-white rounded-xl font-bold hover:bg-[#4a5c6a] transition-all shadow-lg shadow-black/20">
                        Start Practice
                    </button>
                </div>
            </header>

                {/* Stats Grid */}
                <section ref={statsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {[
                        { label: 'Total Sessions', value: stats.totalSessions, icon: LayoutDashboard, bgColor: 'bg-white' },
                        { label: 'Average Score', value: `${stats.avgScore}%`, icon: TrendingUp, bgColor: 'bg-white' },
                        { label: 'Completion Rate', value: `${stats.completionRate}%`, icon: Award, bgColor: 'bg-white' },
                        { label: 'Hours Practiced', value: stats.hoursPracticed, icon: Clock, bgColor: 'bg-white' }
                    ].map((stat, i) => (
                        <div key={i} className={`stat-card ${stat.bgColor} p-6 rounded-2xl shadow-sm border border-[#5E7381]/10 hover:shadow-md transition-shadow`}>
                            <div className="w-12 h-12 bg-[#5E7381]/10 text-[#5E7381] rounded-xl flex items-center justify-center mb-4">
                                <stat.icon size={24} />
                            </div>
                            <p className="text-[#5E7381]/60 text-sm font-medium mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-[#5E7381]">{stat.value}</h3>
                        </div>
                    ))}
                </section>

                <div className="mb-10">
                    <AchievementsSection userId="65a000000000000000000000" />
                </div>

                {/* Recent Sessions */}
                <section ref={sessionsRef} className="bg-white rounded-2xl shadow-sm border border-[#5E7381]/10 overflow-hidden">
                    <div className="p-6 border-b border-[#5E7381]/10 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-[#5E7381]">Recent Sessions</h2>
                        <button className="flex items-center gap-1 text-sm font-bold text-[#5E7381] hover:gap-2 transition-all">
                            View All <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-[#5E7381]/5 text-[#5E7381]/50 text-xs font-bold uppercase tracking-wider">
                                    <th className="px-6 py-4">Session Date</th>
                                    <th className="px-6 py-4">Lesson / Scenario</th>
                                    <th className="px-6 py-4">Difficulty</th>
                                    <th className="px-6 py-4">Progress</th>
                                    <th className="px-6 py-4">Analysis</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#5E7381]/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-[#5E7381]/40">Loading sessions...</td>
                                    </tr>
                                ) : sessions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-[#5E7381]/40">No sessions found. Start practicing to see results!</td>
                                    </tr>
                                ) : (
                                    sessions.map((session) => (
                                        <tr key={session._id} className="session-row hover:bg-[#5E7381]/5 transition-colors group">
                                            <td className="px-6 py-5">
                                                <span className="font-medium text-[#5E7381]">{formatDate(session.startedAt)}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-[#5E7381]">
                                                        {session.scenarioId?.title || session.lessonId || 'Custom Practice'}
                                                    </span>
                                                    <span className="text-xs text-[#5E7381]/50">
                                                        {session.scenarioId?.category || 'Sarcasm'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase
                                                    ${session.difficulty === 'beginner' ? 'bg-green-50 text-green-700' : 
                                                      session.difficulty === 'intermediate' ? 'bg-yellow-50 text-yellow-700' : 
                                                      'bg-red-50 text-red-700'}`}>
                                                    {session.difficulty}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-24 h-2 bg-[#5E7381]/10 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-[#5E7381]" 
                                                            style={{ width: `${(session.completedPractices / session.totalPractices) * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-bold text-[#5E7381]">
                                                        {session.completedPractices}/{session.totalPractices}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex gap-2">
                                                    {session.analysis ? (
                                                        <>
                                                            <div className={`p-1 ${getScoreColor(session.analysis.facial_expression?.score)} transition-transform hover:scale-125`} title="Facial">F</div>
                                                            <div className={`p-1 ${getScoreColor(session.analysis.eye_contact?.score)} transition-transform hover:scale-125`} title="Eye">E</div>
                                                            <div className={`p-1 ${getScoreColor(session.analysis.body_language?.score)} transition-transform hover:scale-125`} title="Body">B</div>
                                                            <div className={`p-1 ${getScoreColor(session.analysis.tone?.score)} transition-transform hover:scale-125`} title="Tone">T</div>
                                                        </>
                                                    ) : (
                                                        <span className="text-[#5E7381]/30 text-xs italic">Pending</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <button className="p-2 text-[#5E7381]/40 hover:text-[#5E7381] transition-colors opacity-0 group-hover:opacity-100">
                                                    <ChevronRight size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
    );
}
