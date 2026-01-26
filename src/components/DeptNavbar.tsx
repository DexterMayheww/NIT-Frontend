// src/components/DeptNavbar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface NavItem {
    label: string;
    href: string;
    children?: { label: string; href: string }[];
}

export function getDeptLinks(deptSlug: string): NavItem[] {
    return [
        { label: 'Home', href: `/department/${deptSlug}` },
        {
            label: 'People',
            href: `/department/${deptSlug}/people/faculty`, // Primary link for the category
            children: [
                { label: 'Faculty', href: `/department/${deptSlug}/people/faculty` },
                { label: 'Staff', href: `/department/${deptSlug}/people/staff` },
                { label: 'Students', href: `/department/${deptSlug}/people/students` },
                { label: 'Lab In-charge', href: `/department/${deptSlug}/people/lab-in-charge` },
            ]
        },
        {
            label: 'Academics',
            href: `/department/${deptSlug}/academics/course-structure`,
            children: [
                { label: 'Course Structure', href: `/department/${deptSlug}/academics/course-structure` },
                { label: 'Syllabus', href: `/department/${deptSlug}/academics/syllabus` },
                { label: 'Time Table', href: `/department/${deptSlug}/academics/time-table` },
            ]
        },
        {
            label: 'Department committee',
            href: `/department/${deptSlug}/department-committee/dppc`,
            children: [
                { label: 'DPPC', href: `/department/${deptSlug}/department-committee/dppc` },
                { label: 'DUPC', href: `/department/${deptSlug}/department-committee/dupc` },
            ]
        },
        {
            label: 'Research',
            href: `/department/${deptSlug}/research/projects`,
            children: [
                { label: 'Projects', href: `/department/${deptSlug}/research/projects` },
                { label: 'Publications', href: `/department/${deptSlug}/research/publications` },
                { label: 'Consultancies', href: `/department/${deptSlug}/research/consultancies` },
            ]
        },
    ];
}

export function DeptNavbar({ deptSlug }: { deptSlug: string }) {
    const pathname = usePathname();
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    const navItems = getDeptLinks(deptSlug);

    return (
        <nav className="bg-[#013A33]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-[100] w-full transition-all duration-500">
            <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-20">

                {/* Navigation Links */}
                <div className="flex items-center gap-12 h-full">
                    {navItems.map((item) => (
                        <div
                            key={item.label}
                            className="relative h-full flex items-center"
                            onMouseEnter={() => setActiveDropdown(item.label)}
                            onMouseLeave={() => setActiveDropdown(null)}
                        >
                            <Link
                                href={item.href}
                                className={`group relative py-2 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-2 ${pathname.startsWith(item.href) ? 'text-[#00FFCC]' : 'text-white/40 hover:text-white'}`}
                            >
                                {pathname.startsWith(item.href) && <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-[#00FFCC] shadow-[0_0_10px_#00FFCC]" />}
                                {item.label}
                                {item.children && <ChevronDown size={12} className={`transition-transform duration-500 ${activeDropdown === item.label ? 'rotate-180 text-[#00FFCC]' : 'opacity-30'}`} />}
                            </Link>

                            {/* Enhanced Dropdown */}
                            {item.children && (
                                <div className={`absolute left-0 top-[100%] transition-all duration-500 ease-out ${activeDropdown === item.label ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-4'}`}>
                                    <div className="pt-2">
                                        <ul className="bg-[#002A28]/95 backdrop-blur-2xl border border-white/10 p-3 rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.5)] min-w-[240px] overflow-hidden relative">
                                            {/* Grid overlay for texture */}
                                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#00FFCC 1px, transparent 0)', backgroundSize: '15px 15px' }} />

                                            {item.children.map((sub) => (
                                                <li key={sub.label} className="relative z-10">
                                                    <Link
                                                        href={sub.href}
                                                        className={`flex items-center justify-between px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-[#00FFCC]/10 transition-all rounded-sm group/link ${pathname === sub.href ? 'text-[#00FFCC] bg-[#00FFCC]/5' : 'text-white/50 hover:text-white'}`}
                                                    >
                                                        {sub.label}
                                                        <div className="w-1 h-1 bg-[#00FFCC] rounded-full scale-0 group-hover/link:scale-100 transition-transform duration-300" />
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Brand Accent */}
                <div className="hidden lg:flex items-center gap-3">
                    <div className="h-0.5 w-12 bg-white/5" />
                    <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-[#00FFCC]/40">NITM <span className="text-white/20">Portal</span></p>
                </div>
            </div>
        </nav>
    );
}

