'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex min-h-screen bg-[#E1D3BE]">
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            {/* Main Content Area */}
            <div 
                className={`flex-1 transition-all duration-300 ease-in-out ${
                    isSidebarOpen ? 'pl-64' : 'pl-20'
                }`}
            >
                {children}
            </div>
        </div>
    );
}
