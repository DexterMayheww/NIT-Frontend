'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Briefcase, Edit3, ChevronRight } from 'lucide-react';

interface ProfilePageProps {
    data: {
        title: string;
        details: string | null;
        image: string | null;
        email: string | null;
        designation: string | null;
        department: string;
        departmentSlug: string;
        sections: Record<string, string>;
        canEdit: boolean;
        editUrl: string;
    };
}

const ProfilePage: React.FC<ProfilePageProps> = ({ data }) => {
    const [activeTab, setActiveTab] = useState<'home' | 'publications' | 'academics' | 'projects'>('home');

    const tabs = [
        { id: 'home', label: 'Home' },
        { id: 'publications', label: 'Publications' },
        { id: 'academics', label: 'Academics' },
        { id: 'projects', label: 'Projects' },
    ] as const;

    return (
        <main className="min-h-screen bg-[#013A33] text-white font-sans selection:bg-[#00FFCC] selection:text-[#013A33]">
            {/* --- HERO / HEADER SECTION --- */}
            <section className="relative pt-32 pb-16 px-6 md:px-12 border-b border-white/5 overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#00FFCC]/5 to-transparent pointer-events-none" />

                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-end gap-8 md:gap-16 relative z-10">

                    {/* Profile Image Container */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-tr from-[#00FFCC] to-transparent opacity-20 group-hover:opacity-40 blur transition duration-1000 group-hover:duration-200 rounded-sm"></div>
                        <div className="relative w-48 h-56 md:w-64 md:h-80 overflow-hidden bg-[#002A28] border border-white/10 rounded-sm">
                            {data.image ? (
                                <Image
                                    src={data.image}
                                    alt={data.title}
                                    fill
                                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
                                    unoptimized
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center opacity-20 transform -rotate-12">
                                    <span className="text-[10px] uppercase tracking-[0.5em] font-mono">No Portrait</span>
                                    <div className="w-12 h-px bg-white/50 mt-2" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1 text-center md:text-left">
                        <nav className="flex items-center justify-center md:justify-start gap-4 mb-6 text-[10px] uppercase tracking-[0.3em] text-[#00FFCC]/60 font-mono">
                            <Link href={`/department/${data.departmentSlug}`} className="hover:text-[#00FFCC] transition-colors">{data.departmentSlug.replace(/-/g, ' ')}</Link>
                            <ChevronRight size={10} />
                            <span className="text-white">Profile</span>
                        </nav>

                        <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-4">
                            {data.title.split(' ').slice(0, -1).join(' ')} <br className="md:hidden" />
                            <span className="text-[#00FFCC]">{data.title.split(' ').slice(-1)}</span>
                        </h1>

                        <div className="space-y-3">
                            <p className="text-xl md:text-2xl text-gray-300 font-light italic flex items-center justify-center md:justify-start gap-3">
                                <Briefcase size={20} className="text-[#00FFCC]/60" />
                                {data.designation}
                            </p>
                            <p className="text-[#00FFCC]/60 font-mono text-sm uppercase tracking-widest">
                                {data.department}
                            </p>
                            {data.email && (
                                <a href={`mailto:${data.email}`} className="inline-flex items-center gap-2 text-gray-400 hover:text-[#00FFCC] transition-colors text-sm font-mono mt-4">
                                    <Mail size={16} />
                                    {data.email}
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Actions / Edit Button */}
                    {data.canEdit && (
                        <div className="mt-8 md:mt-0">
                            <a
                                href={data.editUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative inline-flex items-center gap-2 bg-[#00FFCC] text-[#013A33] px-8 py-3 rounded-sm text-xs font-black uppercase tracking-[0.2em] hover:bg-white transition-all duration-500 shadow-2xl hover:-translate-y-1"
                            >
                                <Edit3 size={14} />
                                Edit Profile
                                <div className="absolute inset-0 border border-[#00FFCC] scale-100 group-hover:scale-110 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-sm"></div>
                            </a>
                        </div>
                    )}
                </div>
            </section>

            {/* --- TABS SECTION --- */}
            <section className="sticky top-0 z-40 bg-[#013A33]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="flex overflow-x-auto no-scrollbar gap-8 md:gap-16">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                  relative py-8 text-sm font-black uppercase tracking-[0.3em] transition-all duration-300 whitespace-nowrap
                  ${activeTab === tab.id ? 'text-[#00FFCC]' : 'text-gray-500 hover:text-gray-300'}
                `}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-[#00FFCC] shadow-[0_0_15px_rgba(0,255,204,0.5)]"></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- TABS CONTENT SECTION --- */}
            <section className="py-24 px-6 md:px-12 relative">
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(#00FFCC 1px, transparent 0)', backgroundSize: '40px 40px' }} />

                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

                        {/* Side Branding / Meta */}
                        <div className="hidden lg:block lg:col-span-3">
                            <div className="sticky top-32">
                                <div className="w-12 h-1 bg-[#00FFCC] mb-8" />
                                <h3 className="text-4xl font-black uppercase tracking-tighter leading-tight opacity-10 select-none pointer-events-none">
                                    NITM <br /> FACULTY <br /> PROFILE
                                </h3>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="lg:col-span-9 w-full">
                            <div className="bg-[#002A28]/50 backdrop-blur-sm border border-white/5 p-8 md:p-12 shadow-2xl relative">
                                <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-[#00FFCC]/30" />
                                <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-[#00FFCC]/30" />

                                <div
                                    className="
                    prose prose-invert prose-lg max-w-none
                    [&_h1]:text-4xl [&_h1]:font-black [&_h1]:uppercase [&_h1]:tracking-tighter [&_h1]:mb-8 [&_h1]:text-white
                    [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:mb-6 [&_h2]:text-white [&_h2]:border-b [&_h2]:border-white/10 [&_h2]:pb-2
                    [&_p]:text-gray-400 [&_p]:leading-relaxed [&_p]:mb-6
                    [&_ul]:list-none [&_ul]:pl-0
                    [&_li]:relative [&_li]:pl-8 [&_li]:mb-4 [&_li]:text-gray-300
                    [&_li::before]:content-['➤'] [&_li::before]:absolute [&_li::before]:left-0 [&_li::before]:text-[#00FFCC]/60 [&_li::before]:text-xs
                    [&_table]:w-full [&_table]:mb-8 [&_table]:border-collapse
                    [&_th]:py-4 [&_th]:px-4 [&_th]:bg-white/5 [&_th]:text-[#00FFCC] [&_th]:text-[10px] [&_th]:uppercase [&_th]:tracking-widest [&_th]:text-left
                    [&_td]:py-4 [&_td]:px-4 [&_td]:border-b [&_td]:border-white/5 [&_td]:text-gray-400 [&_td]:text-sm
                    selection:bg-[#00FFCC] selection:text-[#013A33]
                  "
                                    dangerouslySetInnerHTML={{ __html: data.sections[activeTab] || `<p className="italic opacity-50">No information provided for ${activeTab}.</p>` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FOOTER SPACING --- */}
            <div className="h-24 bg-[#013A33]" />
        </main>
    );
};

export default ProfilePage;
