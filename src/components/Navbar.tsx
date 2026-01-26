'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, usePathname } from 'next/navigation';
import { useSession, signOut } from "next-auth/react";
import { getDrupalDomain } from '@/lib/drupal/customFetch';
import {
    Volume2,
    VolumeX,
    Search,
    Menu,
    X,
    Mail,
    Phone,
    ChevronDown,
    LayoutDashboard,
    LogOut
} from 'lucide-react';
import { getDrupalData } from '@/lib/drupal/getDrupalData';
import { getDeptLinks } from './DeptNavbar';

function SubMenuItem({ child }: { child: any }) {
    const [openLeft, setOpenLeft] = useState(false);
    const itemRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = () => {
        if (itemRef.current) {
            const rect = itemRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const dropdownWidth = 260; // Approximate width of the menu

            // Flip if the dropdown would exceed the viewport width
            setOpenLeft(viewportWidth - rect.right < dropdownWidth);
        }
    };

    return (
        <div
            ref={itemRef}
            onMouseEnter={handleMouseEnter}
            className="relative group/sub"
        >
            <Link
                href={child.href}
                className="flex items-center justify-between text-[12px] font-medium text-gray-300 hover:text-[#00FFCC] hover:bg-white/5 px-3 py-2.5 rounded-lg transition-all"
            >
                {child.label}
                {child.children && (
                    <ChevronDown size={14} className={openLeft ? "rotate-90" : "-rotate-90"} />
                )}
            </Link>

            {child.children && (
                <div className={`absolute top-0 w-64 transition-all duration-300 opacity-0 invisible 
                    ${openLeft
                        ? 'right-full pr-2 -translate-x-2 group-hover/sub:-translate-x-0'
                        : 'left-full pl-2 translate-x-2 group-hover/sub:translate-x-0'
                    } 
                    group-hover/sub:opacity-100 group-hover/sub:visible`}
                >
                    <div className="bg-[#002A28]/98 backdrop-blur-2xl border border-white/10 rounded-xl p-2 shadow-2xl">
                        <div className="flex flex-col gap-1">
                            {child.children.map((grandchild: any) => (
                                <Link
                                    key={grandchild.label}
                                    href={grandchild.href}
                                    className="text-[12px] font-bold text-gray-300 hover:text-[#00FFCC] hover:bg-white/5 px-3 py-2.5 rounded-lg transition-all"
                                >
                                    {grandchild.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [fontSize, setFontSize] = useState(100);
    const [isTTSEnabled, setIsTTSEnabled] = useState(false);
    const [isInverted, setIsInverted] = useState(false);
    const [mounted, setMounted] = useState(false);

    const pathname = usePathname();
    const DRUPAL_DOMAIN = getDrupalDomain();
    const { data: session } = useSession();
    const synth = useRef<SpeechSynthesis | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileDropdownRef = useRef<HTMLDivElement>(null);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const loginDropdownRef = useRef<HTMLDivElement>(null);

    const [navHeight, setNavHeight] = useState(0);
    const navRef = useRef<HTMLElement>(null);

    const isDeptPage = pathname.startsWith('/department/') && pathname !== '/department';
    const deptSlug = isDeptPage ? pathname.split('/')[2] : '';

    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
            if (loginDropdownRef.current && !loginDropdownRef.current.contains(event.target as Node)) {
                setIsLoginOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 1. Inversion Logic with Media Protection
    useEffect(() => {
        const root = document.documentElement;
        if (isInverted) {
            root.classList.add('dark-invert');
            // Injecting a style tag to prevent images/videos from being inverted
            const style = document.createElement('style');
            style.id = 'invert-fix';
            style.innerHTML = `
                .dark-invert img, 
                .dark-invert video, 
                .dark-invert iframe,
                .dark-invert .no-invert { 
                    filter: invert(1) hue-rotate(180deg) !important; 
                }
            `;
            document.head.appendChild(style);
        } else {
            root.classList.remove('dark-invert');
            document.getElementById('invert-fix')?.remove();
        }
    }, [isInverted]);

    // 2. Font Scaling
    useEffect(() => {
        document.documentElement.style.fontSize = `${fontSize}%`;
    }, [fontSize]);

    // 3. Screen Reader Logic
    useEffect(() => {
        synth.current = window.speechSynthesis;
        const handleHover = (e: MouseEvent) => {
            if (!isTTSEnabled || !synth.current) return;
            const target = e.target as HTMLElement;
            const text = target.innerText || target.getAttribute('aria-label');
            if (text && text.length > 2) {
                synth.current.cancel();
                const ut = new SpeechSynthesisUtterance(text);
                synth.current.speak(ut);
            }
        };
        document.addEventListener('mouseover', handleHover);
        return () => {
            document.removeEventListener('mouseover', handleHover);
            synth.current?.cancel();
        };
    }, [isTTSEnabled]);

    // 4. Optimized Mount Logic
    useEffect(() => {
        // Wrap ALL initial state setting in the same frame
        // This pushes the updates to the next tick, preventing the "cascading" error
        const frame = requestAnimationFrame(() => {
            setMounted(true);

            // Initial browser detection: check scroll after the first paint
            const initialScroll = window.scrollY > 40;
            if (initialScroll) {
                setScrolled(true);
            }
        });

        return () => cancelAnimationFrame(frame);
    }, []);

    // 5. Optimized Scroll Logic
    useEffect(() => {
        if (!mounted) return; // Only listen for scroll after hydration is stable

        const handleScroll = () => {
            const isScrolled = window.scrollY > 40;
            // Optimization: Only update state if the value actually changed
            setScrolled((prev) => (prev !== isScrolled ? isScrolled : prev));
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [mounted]);

    useEffect(() => {
        if (!navRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                // Update the state with the actual, real-time height
                setNavHeight(entry.contentRect.height);
            }
        });

        observer.observe(navRef.current);
        return () => observer.disconnect();
    }, [mounted]); // Re-run if mount state changes to ensure we catch the initial paint

    const navItems = [
        { label: 'Home', href: '/' },
        {
            label: 'About',
            href: '/about',
            children: [
                { label: 'About NIT Manipur', href: '/about/about-nit-manipur' },
                { label: 'Vision & Mission', href: '/about/vision-mission' },
                { label: 'Our History', href: '/about/our-history' },
                { label: 'Key Documents', href: '/about/key-documents' },
                { label: 'Institute Newsletter "Reportage"', href: '/about/institute-newsletter' },
                { label: 'NIRF Data', href: '/about/nirf-data' },
            ]
        },
        {
            label: 'Administration',
            href: '/administration',
            children: [
                { label: 'Director', href: '/administration/director' },
                { label: 'Registrar', href: '/administration/registrar' },
                { label: 'Finance Committee', href: '/administration/finance-committee' },
                { label: 'Building and Works Committee', href: '/administration/building-works-committee' },
                { label: 'Board of Governors', href: '/administration/board-of-governors' },
                { label: 'Senate', href: '/administration/senate' },
                { label: 'NIT Council', href: '/administration/nit-council' },
                { label: 'Head of Department', href: '/administration/head-of-department' },
                { label: 'Dean', href: '/administration/dean' },
                { label: 'NIT Administration', href: '/administration/nit-administration' },
                { label: 'Organisation Chart', href: '/administration/organisation-chart' },
                { label: 'Officers', href: '/administration/officers' },
                { label: 'Grant-in-aid recieved from MoE', href: '/administration/moe-grants' },
            ]
        },
        {
            label: 'Academics',
            href: '/academics',
            children: [
                { label: 'Academic Cell', href: '/academics/academic-cell' },
                { label: 'Academic Calendar', href: '/academics/academic-calendar' },
                { label: 'Course Structure', href: '/academics/course-structure' },
                { label: 'Fee Structure', href: '/academics/fee-structure' },
                { label: 'Time-Table', href: '/academics/time-table' },
                { label: 'Holidays List', href: '/academics/holidays-list' },
                { label: 'Ordinances', href: '/academics/ordinances' },
                { label: 'Syllabi', href: '/academics/syllabi' },
                { label: 'NEP-2020', href: '/academics/nep-2020' },
                {
                    label: 'Forms',
                    href: '/academics/academic-forms',
                    children: [
                        { label: 'BTech', href: '/academics/academic-forms/btech' },
                        { label: 'MTech', href: '/academics/academic-forms/mtech' },
                        { label: 'MSc', href: '/academics/academic-forms/msc' },
                        { label: 'PhD', href: '/academics/academic-forms/phd' },
                    ]
                },
                { label: 'Library', href: '/academics/library' },
            ]
        },
        {
            label: 'Departments',
            href: '/department',
            children: [
                { label: 'Civil Engineering', href: '/department/civil-engineering' },
                { label: 'Computer Science and Engineering', href: '/department/computer-science-engineering' },
                { label: 'Electrical Engineering', href: '/department/electrical-engineering' },
                { label: 'Electronics & Communication Engineering', href: '/department/electronics-communication-engineering' },
                { label: 'Mechanical Engineering', href: '/department/mechanical-engineering' },
                { label: 'Physics', href: '/department/physics' },
                { label: 'Institution Innovation Council', href: '/department/institution-innovation-council' },
                { label: 'Chemistry', href: '/department/chemistry' },
                { label: 'Humanities & Social Science', href: '/department/humanities-social-science' },
                { label: 'Mathematics', href: '/department/mathematics' },
                { label: 'Visvesvaraya Scheme', href: '/department/visvesvaraya-scheme' },
            ]
        },
        {
            label: 'Facilities',
            href: '/facilities',
            children: [
                { label: 'Central Library', href: '/facilities/central-library' },
                { label: 'Facilities at Campus', href: '/facilities/campus' },
                { label: 'Games & Sports', href: '/facilities/games-sports' },
                { label: 'Hostel', href: '/facilities/hostel' },
                { label: 'Infrastructure', href: '/facilities/infrastructure' },
                { label: 'Training & Placement', href: '/facilities/training-placement' },
            ]
        },
        {
            label: 'Gallery',
            href: '/gallery',
        },
        {
            label: 'Notices',
            href: '/notices',
        },
        {
            label: "Employee's Corner",
            href: '/employee-corner',
            children: [
                {
                    label: 'APAR Formats',
                    href: '/employee-corner/apar-formats',
                    children: [
                        { label: 'Teaching', href: '/employee-corner/apar-formats/teaching' },
                        { label: 'Non-Teaching', href: '/employee-corner/apar-formats/non-teaching' },
                    ],
                },
                { label: 'Forms', href: '/employee-corner/forms' },
                { label: 'IPR Format', href: '/employee-corner/ipr-format' },
                { label: 'No Due Certificate', href: '/employee-corner/no-due-certificate' },
                { label: 'CDPA Guidelines on Expenditure', href: '/employee-corner/cdpa-guidelines' },
                { label: 'Basic Approval Form for Purchase of Equipment', href: '/employee-corner/basic-approval-form' },
                { label: 'Transfer & Postings', href: '/employee-corner/transfer-postings' },
                { label: 'Tours & Travels', href: '/employee-corner/tours-travels' },
            ],
        },
        {
            label: 'Outreach',
            href: '/outreach',
            children: [
                { label: 'Conferences & Workshops', href: '/outreach/conferences-workshops' },
                {
                    label: 'CDBE',
                    href: '/outreach/cdbe',
                    children: [
                        { label: 'CDBE Tripartite Agreement MMTTC NIT Manipur', href: '/outreach/cdbe/tripartite-agreement' },
                    ],
                },
                { label: 'UBA', href: '/outreach/uba' },
            ]
        },
    ];

    const portalDropdownItems = [
        { label: 'Webmail', href: '/webmail' },
        { label: 'e-office', href: '/e-office' },
        { label: 'MIS', href: '/mis' },
        { label: 'Faculty/Staff login', href: '/login' },
    ]

    const activeLinks = isDeptPage ? getDeptLinks(deptSlug) : navItems;

    return (
        <>
            <div
                style={{ height: `${navHeight}px` }}
                className="w-full transition-[height] duration-500 ease-in-out"
                aria-hidden="true"
            />
            <nav ref={navRef} className={`fixed top-0 left-0 w-full z-[110] transition-all duration-500 ${mounted && scrolled ? '-translate-y-[40px]' : 'translate-y-0'}`}>

                {/* TIER 1: UTILITY BAR */}
                <div className="bg-[#002A28] border-b border-white/5 h-[40px] flex items-center justify-between px-6 md:px-12 relative">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 border-r border-white/10 pr-4">
                            <a href="#" className="text-gray-400 hover:text-[#00FFCC] transition-colors">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                            </a>
                            <a href="#" className="text-gray-400 hover:text-[#00FFCC] transition-colors">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                            </a>
                            <a href="#" className="text-gray-400 hover:text-[#00FFCC] transition-colors">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                            </a>
                        </div>
                    </div>

                    {/* CENTERED CONTACT INFO */}
                    <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        <span className="flex items-center gap-2"><Phone size={12} className="text-[#00FFCC]" /> +91 385 2413031</span>
                        <span className="flex items-center gap-2"><Mail size={12} className="text-[#00FFCC]" /> admin@nitmanipur.ac.in</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4 text-white text-xs font-bold mr-2">
                            <button onClick={() => setFontSize(prev => Math.max(prev - 10, 80))} className="hover:text-[#00FFCC]">A-</button>
                            <button onClick={() => setFontSize(100)} className="hover:text-[#00FFCC]">A</button>
                            <button onClick={() => setFontSize(prev => Math.min(prev + 10, 130))} className="hover:text-[#00FFCC]">A+</button>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setIsInverted(true)} className="w-7 h-8 bg-black border border-white/20 rounded flex items-center justify-center text-white text-[10px] font-black">A</button>
                            <button onClick={() => setIsInverted(false)} className="w-7 h-8 bg-[#E5E7EB] border border-black/10 rounded flex items-center justify-center text-black text-[10px] font-black">A</button>
                        </div>
                        <select className="bg-transparent text-[10px] font-bold uppercase text-gray-400 focus:outline-none cursor-pointer">
                            <option value="en">EN</option>
                            <option value="hi">HI</option>
                        </select>
                    </div>
                </div>

                {/* TIER 2: LOGO & ACTIONS BAR */}
            <div className={`relative w-full h-fit px-6 md:px-12 flex h-[70px] z-[120] items-center justify-between transition-all duration-500 border-b border-white/5 ${mounted && scrolled ? 'bg-[#013A33]/95 backdrop-blur-xl' : 'bg-[#013A33]/60'}`}>
                
                <Link href="/" className="flex items-center gap-4 no-invert">
                    <Image
                        src={`${DRUPAL_DOMAIN}/sites/default/files/2026-01/nitm_logo.webp`}
                        alt="NITM Logo"
                        width={1000}
                        height={500}
                        className="object-contain h-[200px] w-fit"
                        unoptimized={process.env.NODE_ENV === 'development'}
                    />
                </Link>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-1.5 gap-2">
                        <Search size={14} className="text-gray-400" />
                        <input type="text" placeholder="Search..." className="bg-transparent text-[11px] text-white focus:outline-none w-32" />
                    </div>

                    {session ? (
                        <div className="relative" ref={profileDropdownRef}>
                            <button 
                                onClick={() => setIsProfileOpen(!isProfileOpen)} 
                                className="flex items-center gap-3 pl-4 pr-2 py-1 rounded-full border border-[#00FFCC]/30 bg-[#00FFCC]/5 hover:bg-[#00FFCC]/10 transition-colors"
                            >
                                <div className="flex flex-col items-end hidden md:flex">
                                    <span className="text-[9px] font-black uppercase tracking-wider text-[#00FFCC]">
                                        {session.user?.name || 'Account'}
                                    </span>
                                </div>
                                <div className="w-7 h-7 rounded-full bg-[#00FFCC] flex items-center justify-center text-[#013A33]">
                                    <ChevronDown size={14} className={`transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </div>
                            </button>

                            {isProfileOpen && (
                                <div className="absolute right-0 mt-3 w-64 bg-[#002A28]/98 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl py-2 z-[120] animate-in fade-in slide-in-from-top-2">
                                    {/* SESSION ACTIONS */}
                                    <Link href={`${DRUPAL_DOMAIN}/admin/content`} className="flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-[#00FFCC] hover:bg-white/5">
                                        <LayoutDashboard size={14} /> Dashboard
                                    </Link>
                                    
                                    {/* PORTAL LINKS (Integrated when logged in) */}
                                    <div className="my-2 border-t border-white/5" />
                                    <div className="px-4 py-1 text-[8px] font-bold text-gray-500 uppercase tracking-[0.2em]">Quick Access</div>
                                    {portalDropdownItems.filter(i => i.label !== 'Faculty/Staff login').map((option) => (
                                        <Link
                                            key={option.label}
                                            href={option.href}
                                            className="block px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#00FFCC] hover:bg-white/5 transition-all"
                                        >
                                            {option.label}
                                        </Link>
                                    ))}

                                    <div className="my-2 border-t border-white/5" />
                                    <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-colors">
                                        <LogOut size={14} /> Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="relative" ref={loginDropdownRef}>
                            <button
                                onClick={() => setIsLoginOpen(!isLoginOpen)}
                                className="bg-[#00FFCC] text-[#013A33] px-6 h-9 rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2"
                            >
                                Portal Login
                                <ChevronDown size={12} className={`transition-transform duration-300 ${isLoginOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isLoginOpen && (
                                <div className="absolute right-0 mt-3 w-56 bg-[#002A28]/98 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl py-2 z-[120] animate-in fade-in slide-in-from-top-2">
                                    {portalDropdownItems.map((option) => (
                                        <Link
                                            key={option.label}
                                            href={option.href}
                                            onClick={() => setIsLoginOpen(false)}
                                            className="block px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-[#00FFCC] hover:bg-white/5 transition-all"
                                        >
                                            {option.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    <button onClick={() => setIsOpen(!isOpen)} className="xl:hidden text-white"><Menu size={24} /></button>
                </div>
            </div>

                {/* TIER 3: CONTEXTUAL NAVIGATION BAR */}
                <div className={`w-full px-6 md:px-12 flex h-11 z-[110] items-center justify-center transition-all duration-500 border-b border-white/5 ${mounted && scrolled ? 'bg-[#013A33]/95 backdrop-blur-xl border-[#00FFCC]/20' : 'bg-[#013A33]/60'
                    }`}>
                    <ul className="flex items-center justify-center gap-8 h-full">
                        {activeLinks.map((item) => (
                            <li key={item.label} className="relative group h-full flex items-center">
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-300 ${pathname === item.href ? 'text-[#00FFCC]' : 'text-gray-200 hover:text-white'
                                        }`}
                                >
                                    {item.label}
                                    {item.children && <ChevronDown size={12} className="group-hover:rotate-180 transition-transform duration-300" />}
                                </Link>

                                {item.children && (
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-64 pt-2 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 z-[110]">
                                        <div className="bg-[#002A28]/95 backdrop-blur-2xl border border-white/10 rounded-xl p-2 shadow-2xl">
                                            {item.children.map((child: any) => (
                                                <SubMenuItem key={child.label} child={child} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>
        </>
    );
}