'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    LayoutDashboard, 
    BookOpen, 
    TrendingUp, 
    Award, 
    ChevronLeft,
    ChevronRight,
    LogOut,
    Settings
} from 'lucide-react';

import Image from 'next/image';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
    const pathname = usePathname();

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
        { name: 'Lessons', icon: BookOpen, href: '/lessons' },
        { name: 'Progress', icon: TrendingUp, href: '#' },
        { name: 'Achievements', icon: Award, href: '#' },
    ];

    return (
        <aside 
            className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-100 flex flex-col transition-all duration-300 ease-in-out ${
                isOpen ? 'w-64' : 'w-20'
            }`}
        >
            {/* Header / Logo */}
            <div className={`flex items-center gap-3 px-6 py-8 h-20 ${isOpen ? 'justify-center' : 'justify-center px-0'}`}>
                <div className="min-w-[40px] flex items-center justify-center">
                    <Image
                        src="/Cuely-logo-bg-removed.png"
                        alt="Cuely Logo"
                        width={isOpen ? 55 : 45}
                        height={isOpen ? 55 : 45}
                        className="transition-all"
                    />
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 flex flex-col gap-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link 
                            key={item.name}
                            href={item.href} 
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group ${
                                isActive 
                                    ? 'bg-[#5E7381] text-white shadow-lg shadow-[#5E7381]/20' 
                                    : 'text-gray-500 hover:bg-slate-50 hover:text-[#5E7381]'
                            } ${!isOpen && 'justify-center px-0'}`}
                            title={!isOpen ? item.name : ''}
                        >
                            <item.icon size={22} className={isActive ? 'text-white' : 'group-hover:text-[#5E7381]'} />
                            {isOpen && <span className="whitespace-nowrap">{item.name}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="p-4 border-t border-gray-50 flex flex-col gap-2">
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-slate-50 hover:text-[#5E7381] rounded-xl font-medium transition-all w-full"
                    title={isOpen ? 'Collapse' : 'Expand'}
                >
                    {isOpen ? (
                        <>
                            <ChevronLeft size={20} />
                            <span>Collapse</span>
                        </>
                    ) : (
                        <div className="w-full flex justify-center">
                            <ChevronRight size={20} />
                        </div>
                    )}
                </button>
                
                <Link 
                    href="#"
                    className={`flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-slate-50 hover:text-[#5E7381] rounded-xl font-medium transition-all ${!isOpen && 'justify-center px-0'}`}
                    title={!isOpen ? 'Settings' : ''}
                >
                    <Settings size={20} />
                    {isOpen && <span>Settings</span>}
                </Link>
                
                <Link 
                    href="/"
                    className={`flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-medium transition-all ${!isOpen && 'justify-center px-0'}`}
                    title={!isOpen ? 'Logout' : ''}
                >
                    <LogOut size={20} />
                    {isOpen && <span>Logout</span>}
                </Link>
            </div>
        </aside>
    );
}