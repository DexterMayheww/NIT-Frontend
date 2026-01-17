// components/HomeClient.tsx
'use client';

import React, { useState } from 'react';
import { useSnack } from "@/app/SnackProvider";
import { Calendar } from "@/components/Calendar";

import Image from 'next/image';
import Link from 'next/link';

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// --- CALENDAR COMPONENT (Refactored for nesting) ---
function AcademicCalendar() {
    const { createSnack } = useSnack();

    const onClickHandler = (day: number, month: number, year: number) => {
        const snackMessage = `Clicked on ${monthNames[month]} ${day}, ${year}`;
        createSnack(snackMessage, 'success');
    };

    return (
        <div className="w-full h-full flex flex-col items-center">
            {/* Removed h-screen and mt-34 to fit inside the NoticeBoard container */}
            <div className="w-full">
                <Calendar onClick={onClickHandler} />
            </div>
        </div>
    );
}

// --- NOTICE BOARD COMPONENT ---
export function NoticeBoard() {
    const [activeTab, setActiveTab] = useState('p1');

    const tabs = [
        { id: 'p1', label: 'News Board', icon: '/photo/information-button 1.svg' },
        { id: 'p2', label: 'Academic Notice', icon: '/photo/information-button 2.svg' },
        { id: 'p3', label: 'Upcoming Events', icon: '/photo/information-button 5.svg' },
        { id: 'p4', label: 'Tender', icon: '/photo/information-button 3.svg' },
        { id: 'p5', label: 'Vacancies', icon: '/photo/information-button 4.svg' },
        { id: 'p6', label: 'Office orders & Circulars', icon: '/photo/information-button 6.svg' },
    ];

    return (
        <div className="flex flex-col lg:flex-row gap-6 w-full h-full text-white">
            {/* Left Side: Tabs */}
            <div className="w-full lg:w-1/5 flex flex-col gap-3">
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
            <div className="w-full lg:w-4/5 bg-[#001D1B] border-2 border-[#006A58] rounded-xl p-6 h-[500px] lg:h-[800px] overflow-y-auto shadow-inner custom-scrollbar">
                <div className="animate-fadeIn h-full">
                    {activeTab === 'p1' && (
                        <p className="text-lg font-light leading-relaxed text-justify">
                            NIT Manipur is one of the ten new National Institutes of Technology established by the Government of India in 2010...
                            <br /><br />
                            The institute focuses on producing skilled engineers...
                        </p>
                    )}
                    {activeTab === 'p2' && <p className="text-lg">Latest Academic Notices will appear here.</p>}
                    
                    {/* UPDATED: Integrated Calendar into p3 */}
                    {activeTab === 'p3' && (
                        <div className="flex flex-col h-full overflow-hidden">
                            <h2 className="text-xl font-bold mb-4 text-[#00FFCC]">Event Calendar</h2>
                            <AcademicCalendar />
                        </div>
                    )}
                    
                    {activeTab === 'p4' && <p className="text-lg">Active Tenders and procurements.</p>}
                    {activeTab === 'p5' && <p className="text-lg">Current Job Vacancies.</p>}
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
        <div className="w-full bg-[#00312E] rounded-2xl overflow-hidden shadow-2xl mt-10">
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

            <div className="p-8 min-h-[300px] text-gray-100">
                <h3 className="text-3xl font-bold mb-4 text-[#00FFCC]">{content?.title}</h3>
                <p className="leading-relaxed text-lg font-light opacity-90">
                    {content?.details || "Select a program to view details."}
                </p>
                {content?.fileLink && (
                    <a className='underline mt-4 block' href={`${content.fileLink}`}>
                        Get the Academic form for {content.title}
                    </a>
                )}
            </div>
        </div>
    );
}

export function PlacementSection() {
  return (
    <section className="py-20 bg-[#002A28] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-12">
        <h2 className="text-5xl font-bold text-center text-white mb-4">Our Placements</h2>
        <div className="w-24 h-1 bg-[#00FFCC] mx-auto rounded-full"></div>
      </div>

      <div className="flex overflow-x-auto gap-8 px-8 pb-10 scrollbar-hide snap-x snap-mandatory">
        {placements.map((student, idx) => (
          <Link 
            key={idx} 
            href={`/placement-details?student=${student.slug}`}
            className="group min-w-[300px] md:min-w-[350px] bg-[#013A33] rounded-3xl overflow-hidden border border-[#006A58] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(0,255,204,0.1)] snap-center"
          >
            <div className="relative h-64 w-full overflow-hidden">
              <Image
                src={student.image}
                alt={student.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute top-4 right-4 bg-[#00FFCC] text-[#002A28] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {student.badge}
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-[#00FFCC] transition-colors">
                {student.name}
              </h3>
              <p className="text-[#00FFCC] font-semibold text-sm mb-3">
                {student.company} • {student.package}
              </p>
              <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-2">
                {student.desc}
              </p>
              <div className="pt-4 border-t border-[#006A58] text-xs text-gray-400 font-medium">
                {student.dept}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}