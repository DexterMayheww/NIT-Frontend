// components/HomeClient.tsx
'use client';

import { useState } from 'react';

// --- NOTICE BOARD COMPONENT ---
export function NoticeBoard() {
    const [activeTab, setActiveTab] = useState('p1');

    const tabs = [
        { id: 'p1', label: 'News Board', icon: '/photo/information-button 1.svg' },
        { id: 'p2', label: 'Academic Notice', icon: '/photo/information-button 2.svg' },
        { id: 'p5', label: 'Upcoming Events', icon: '/photo/information-button 5.svg' },
        { id: 'p3', label: 'Tender', icon: '/photo/information-button 3.svg' },
        { id: 'p4', label: 'Vacancies', icon: '/photo/information-button 4.svg' },
        { id: 'p6', label: 'Office orders & Circulars', icon: '/photo/information-button 6.svg' },
    ];

    return (
        <div className="flex flex-col lg:flex-row gap-6 w-full h-full text-white">
            {/* Left Side: Tabs */}
            <div className="w-full lg:w-1/3 flex flex-col gap-3">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-300 border-2
                            ${activeTab === tab.id
                                ? 'bg-[#006A58] border-[#00FFCC] shadow-[0_0_15px_rgba(0,255,204,0.3)] scale-105'
                                : 'bg-[#013A33] border-[#006A58] hover:bg-[#004e42]'}
                        `}
                    >
                        <img src={tab.icon} alt="icon" className="w-6 h-6 invert" />
                        <span className="font-bold text-sm tracking-wide">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Right Side: Content */}
            <div className="w-full lg:w-2/3 bg-[#001D1B] border-2 border-[#006A58] rounded-xl p-6 h-[400px] lg:h-auto overflow-y-auto shadow-inner custom-scrollbar">
                <div className="animate-fadeIn">
                    {activeTab === 'p1' && (
                        <p className="text-lg font-light leading-relaxed text-justify">
                            NIT Manipur is one of the ten new National Institutes of Technology established by the Government of India in 2010...
                            <br /><br />
                            The institute focuses on producing skilled engineers...
                        </p>
                    )}
                    {activeTab === 'p2' && <p className="text-lg">Latest Academic Notices will appear here.</p>}
                    {activeTab === 'p3' && <p className="text-lg">Active Tenders and procurements.</p>}
                    {activeTab === 'p4' && <p className="text-lg">Current Job Vacancies.</p>}
                    {activeTab === 'p5' && <p className="text-lg">Upcoming Cultural and Tech Events.</p>}
                    {activeTab === 'p6' && <p className="text-lg">Official circulars for staff and students.</p>}
                </div>
            </div>
        </div>
    );
}

// --- ADMISSION TABS COMPONENT ---
interface AdmissionTabsProps {
    btech: { title?: string; details?: string | null; fileLink?: string } | null;
    mtech: { title?: string; details?: string | null; fileLink?: string } | null;
    msc: { title?: string; details?: string | null; fileLink?: string } | null;
    phd: { title?: string; details?: string | null; fileLink?: string } | null;
}

export function AdmissionTabs({ btech, mtech, msc, phd }: AdmissionTabsProps) {
    const [activeTab, setActiveTab] = useState('btech');

    const tabClasses = (tabName: string) => `
        px-6 py-3 text-sm md:text-base font-bold transition-colors duration-300 border-b-4
        ${activeTab === tabName
            ? 'border-[#00FFCC] bg-[#00463C] text-white'
            : 'border-transparent hover:bg-[#00312E] text-gray-300'}
    `;

    const programs = { btech, mtech, msc, phd };
    const content = programs[activeTab as keyof typeof programs];

    return (
        <div className="w-full max-w-5xl mx-auto bg-[#00312E] rounded-2xl overflow-hidden shadow-2xl mt-10">
            {/* Tab Headers */}
            <div className="flex flex-wrap border-b border-[#00463C]">
                {['btech', 'mtech', 'msc', 'phd'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 ${tabClasses(tab)} uppercase`}
                    >
                        {tab === 'btech' ? 'B.Tech' : tab === 'mtech' ? 'M.Tech' : tab === 'msc' ? 'M.Sc' : 'PhD'}
                    </button>
                ))}
            </div>

            {/* Tab Body */}
            <div className="p-8 min-h-[300px] text-gray-100">
                <h3 className="text-3xl font-bold mb-4 text-[#00FFCC]">{content?.title}</h3>
                <p className="leading-relaxed text-lg font-light opacity-90">
                    {content?.details || "Select a program to view details."}
                </p>
                <a className='underline' href={`${content?.fileLink}`}>Get the Academic form for {content?.title}</a>
            </div>
        </div>
    );
}
