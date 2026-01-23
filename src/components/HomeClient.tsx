// components/HomeClient.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useSnack } from "@/app/provider-pages/SnackProvider";
import { Calendar } from "@/components/Calendar";

import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import NoticeItem from './NoticeItem';
import { getDrupalDomain } from '@/lib/drupal/customFetch';
import parse from 'node-html-parser';

interface Notice {
    id: string;
    nid?: number;
    title: string;
    createdAt: string;
    editor?: string;
}

interface NoticeBoardProps {
    notices: Notice[];
    newsFiles?: { url: string; filename: string }[];
}

const DRUPAL_DOMAIN = getDrupalDomain();

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
export function NoticeBoard({ notices: initialNotices = [], newsFiles = [] }: NoticeBoardProps) {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState('p1');

    // Optimistic State Management
    const [notices, setNotices] = useState<Notice[]>(initialNotices);

    // Sync with server-side props if they change
    useEffect(() => {
        setNotices(initialNotices);
    }, [initialNotices]);

    const isAdmin = (session?.user as any)?.role === 'administrator';

    const tabs = [
        { id: 'p1', label: 'News Board', icon: '/photo/information-button 1.svg' },
        { id: 'p2', label: 'Academic Notice', icon: '/photo/information-button 2.svg' },
        { id: 'p3', label: 'Upcoming Events', icon: '/photo/information-button 5.svg' },
        { id: 'p4', label: 'Tender', icon: '/photo/information-button 3.svg' },
        { id: 'p5', label: 'Vacancies', icon: '/photo/information-button 4.svg' },
        { id: 'p6', label: 'Office orders & Circulars', icon: '/photo/information-button 6.svg' },
    ];

    const visibleTabs = tabs.filter(tab => tab.id !== 'p6' || isAdmin);

    return (
        <div className="flex flex-col lg:flex-row gap-6 w-full h-full text-white">
            {/* Left Side: Tabs */}
            <div className="w-full lg:w-1/5 flex flex-col gap-3">
                {visibleTabs.map((tab) => (
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
                        <Image src={tab.icon} alt="icon" width={24} height={24} className="w-6 h-6 invert" />
                        <span className="font-bold text-sm tracking-wide">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Right Side: Content */}
            <div className="w-full lg:w-4/5 bg-[#001D1B] border-2 border-[#006A58] rounded-xl p-6 h-[500px] lg:h-[800px] overflow-y-auto shadow-inner custom-scrollbar">
                <div className="animate-fadeIn h-full">

                    {/* NEWS BOARD (P1) - Showing same notices or filtered news */}
                    {activeTab === 'p1' && (
                        <div className="flex flex-col h-full">
                            {/* Header Section mirrored from P2 */}
                            <div className="flex justify-between items-center mb-6 border-b border-[#006A58] pb-4 bg-[#001D1B] z-10">
                                <h2 className="text-2xl font-black text-[#00FFCC] uppercase tracking-tighter">Latest News & Announcements</h2>
                                <div className='flex gap-4'>
                                    <span className="text-sm bg-[#006A58] px-3 py-1 rounded-full text-[#00FFCC] font-bold">
                                        {newsFiles.length} Total
                                    </span>
                                    {isAdmin && (
                                        <Link href={`${DRUPAL_DOMAIN}/node/101/edit`} target='_blank' className="text-sm bg-[#006A58] px-3 py-1 rounded-full text-[#00FFCC] font-bold hover:bg-[#00FFCC] hover:text-[#001D1B] transition-colors">
                                            Add New +
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Scrolling Area */}
                            {newsFiles.length > 0 ? (
                                <div className="relative flex-1 overflow-hidden">
                                    {/* The Marquee Container */}
                                    <div className="flex flex-col gap-4 animate-marquee-up py-4">
                                        {/* First Render */}
                                        {newsFiles.map((file, idx) => {
                                            const cleanName = file.filename
                                                .replace(/\.[^/.]+$/, "")
                                                .replace(/[_-]/g, " ")
                                                .replace(/\b\w/g, l => l.toUpperCase());

                                            return (
                                                <a
                                                    key={`news-orig-${idx}`}
                                                    href={file.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group flex items-center gap-6 bg-[#013A33] p-6 rounded-2xl border border-white/5 hover:border-[#00FFCC]/40 transition-all duration-300 shadow-lg w-full"
                                                >
                                                    <div className="w-12 h-12 shrink-0 rounded-xl bg-[#002A28] flex items-center justify-center border border-white/5 group-hover:bg-[#00FFCC] group-hover:text-[#002A28] transition-all duration-500">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-base font-bold text-gray-200 group-hover:text-white transition-colors truncate">
                                                            {cleanName}
                                                        </h3>
                                                        <p className="text-[10px] text-gray-500 font-mono mt-1 uppercase tracking-widest">Digital Board Resource</p>
                                                    </div>
                                                    <div className="text-[#00FFCC] opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all shrink-0">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                        </svg>
                                                    </div>
                                                </a>
                                            );
                                        })}

                                        {/* Duplicate Render for Seamless Loop */}
                                        {newsFiles.map((file, idx) => {
                                            const cleanName = file.filename
                                                .replace(/\.[^/.]+$/, "")
                                                .replace(/[_-]/g, " ")
                                                .replace(/\b\w/g, l => l.toUpperCase());

                                            return (
                                                <a
                                                    key={`news-dup-${idx}`}
                                                    href={file.url}
                                                    target="_blank"
                                                    className="group flex items-center gap-6 bg-[#013A33] p-6 rounded-2xl border border-white/5 hover:border-[#00FFCC]/40 transition-all duration-300 shadow-lg w-full"
                                                >
                                                    <div className="w-12 h-12 shrink-0 rounded-xl bg-[#002A28] flex items-center justify-center border border-white/5 group-hover:bg-[#00FFCC] group-hover:text-[#002A28] transition-all duration-500">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-base font-bold text-gray-200 group-hover:text-white transition-colors truncate">
                                                            {cleanName}
                                                        </h3>
                                                        <p className="text-[10px] text-gray-500 font-mono mt-1 uppercase tracking-widest">Digital Board Resource</p>
                                                    </div>
                                                </a>
                                            );
                                        })}
                                    </div>

                                    {/* Aesthetic Gradient Fades */}
                                    <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-[#001D1B] to-transparent pointer-events-none z-10" />
                                    <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-[#001D1B] to-transparent pointer-events-none z-10" />
                                </div>
                            ) : (
                                <div className="text-center py-20 border-2 border-dashed border-[#006A58] rounded-2xl text-gray-400">
                                    <p className="italic text-lg">No announcements currently active.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ACADEMIC NOTICES TAB */}
                    {activeTab === 'p2' && (
                        <div className="flex flex-col h-full">
                            <div className="flex justify-between items-center mb-6 border-b border-[#006A58] pb-4 bg-[#001D1B] z-10">
                                <h2 className="text-2xl font-black text-[#00FFCC] uppercase tracking-tighter">Academic Notices</h2>
                                <div className='flex gap-4'>
                                    <span className="text-sm bg-[#006A58] px-3 py-1 rounded-full text-[#00FFCC] font-bold">
                                        {notices.length} Total
                                    </span>
                                    <Link href="/notices" className="text-sm bg-[#006A58] px-3 py-1 rounded-full text-[#00FFCC] font-bold hover:bg-[#00FFCC] hover:text-[#001D1B] transition-colors">
                                        View All
                                    </Link>
                                    {isAdmin && (
                                        <Link href={`${DRUPAL_DOMAIN}/node/add/notice`} target='_blank' className="text-sm bg-[#006A58] px-3 py-1 rounded-full text-[#00FFCC] font-bold hover:bg-[#00FFCC] hover:text-[#001D1B] transition-colors">
                                            Add New +
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Scrolling Area */}
                            {notices.length > 0 ? (
                                <div className="relative flex-1 overflow-hidden">
                                    {/* The Marquee Container */}
                                    <div className="space-y-4 animate-marquee-up py-4">
                                        {/* Render items first time */}
                                        {notices.map((notice) => (
                                            <NoticeItem
                                                key={`orig-${notice.id}`}
                                                id={notice.id}
                                                nid={notice.nid}
                                                title={notice.title}
                                                date={new Date(notice.createdAt).toLocaleDateString()}
                                                bodyHtml={notice.editor || '<p>No content available.</p>'}
                                            />
                                        ))}
                                        {/* Duplicate items for seamless loop */}
                                        {notices.map((notice) => (
                                            <NoticeItem
                                                key={`dup-${notice.id}`}
                                                id={notice.id}
                                                nid={notice.nid}
                                                title={notice.title}
                                                date={new Date(notice.createdAt).toLocaleDateString()}
                                                bodyHtml={notice.editor || '<p>No content available.</p>'}
                                            />
                                        ))}
                                    </div>

                                    {/* Gradient Fades for Smoothness */}
                                    <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-[#001D1B] to-transparent pointer-events-none z-10" />
                                    <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[#001D1B] to-transparent pointer-events-none z-10" />
                                </div>
                            ) : (
                                <div className="text-center py-20 border-2 border-dashed border-[#006A58] rounded-xl text-gray-400">
                                    <p className="italic text-lg">No active academic notices found.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'p3' && (
                        <div className="flex flex-col h-full overflow-hidden">
                            <h2 className="text-xl font-bold mb-4 text-[#00FFCC]">Event Calendar</h2>
                            <AcademicCalendar />
                        </div>
                    )}

                    {activeTab === 'p4' && <p className="text-lg">Active Tenders and procurements.</p>}
                    {activeTab === 'p5' && <p className="text-lg">Current Job Vacancies.</p>}

                    {activeTab === 'p6' && isAdmin && (
                        <p className="text-lg">Official circulars for staff and students.</p>
                    )}
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