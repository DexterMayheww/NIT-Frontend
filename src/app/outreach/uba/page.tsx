import { getNodeByPath } from '@/lib/drupal/generated';
import { getDrupalDomain } from '@/lib/drupal/customFetch';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { parse } from 'node-html-parser';
import Link from 'next/link';

interface UBACoordinator {
    name: string;
    designation: string;
    email: string;
}

interface UBASection {
    title: string;
    content: string;
    reportLink?: { text: string; href: string };
}

/**
 * PARSER: Deconstructs the UBA document into structured UI components
 */
function parseUBAData(html: string, domain: string) {
    if (!html) return { coordinator: null, sections: [] };
    const root = parse(html);
    
    // 1. Extract Coordinator Metadata from first UL
    const firstUl = root.querySelector('ul');
    const coordItems = firstUl?.querySelectorAll('li') || [];
    const coordinator: UBACoordinator = {
        name: coordItems[1]?.text.replace(/contact:\s*/i, '').trim() || "Dr. P. Albino Kumar",
        designation: coordItems[2]?.text.trim() || "Professor, Dept. of Civil Engineering",
        email: coordItems[3]?.text.replace(/email:\s*/i, '').trim() || "albinoiit@gmail.com"
    };

    // 2. Extract Sections based on Headers
    const sections: UBASection[] = [];
    const headers = root.querySelectorAll('h1, h2, h3');

    headers.forEach((header) => {
        const title = header.text.trim();
        if (title.toLowerCase().includes('unnat bharat')) return; // Skip main title

        const nextElement = header.nextElementSibling;
        let content = "";
        let reportLink;

        if (nextElement) {
            content = nextElement.text.trim();
            // Check for the report link specifically in the Action Plan
            const link = nextElement.querySelector('a');
            if (link) {
                let href = link.getAttribute('href') || "#";
                if (href.startsWith('/')) href = `${domain}${href}`;
                reportLink = { text: link.text.trim(), href };
            }
        }

        sections.push({ title, content, reportLink });
    });

    return { coordinator, sections };
}

export default async function UBAPage() {
    const DRUPAL_DOMAIN = getDrupalDomain();
    const { data, status } = await getNodeByPath('/outreach-activities/uba');

    if (!data || status !== 200) {
        notFound();
    }

    const { coordinator, sections } = parseUBAData(data.editor || "", DRUPAL_DOMAIN);

    const outreachLinks = [
        { label: "CDBE Tripartite Agreement", href: "/outreach/cdbe/tripartite-agreement" },
        { label: "Conferences & Workshops", href: "/outreach/conferences-workshops" },
        { label: "UBA", href: "/outreach/uba", active: true },
    ];

    return (
        <>
            <main className="min-h-screen bg-[#002A28] pt-32 font-sans selection:bg-[#00FFCC] selection:text-[#002A28]">
                
                {/* --- HERO SECTION --- */}
                <div className="relative h-80 flex items-center mb-16 overflow-hidden bg-[#013A33]">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-20"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#002A28] to-transparent"></div>
                    <div className="container mx-auto px-6 relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-[#00FFCC] font-mono text-xs uppercase tracking-[0.5em]">National Flagship Program</span>
                            <div className="h-px w-24 bg-[#00FFCC]/30"></div>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none">
                            Unnat Bharat <br />Abhiyan
                        </h1>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 pb-24 flex flex-col lg:flex-row gap-16">
                    
                    {/* --- MAIN CONTENT --- */}
                    <div className="w-full lg:w-[70%] order-2 lg:order-1 flex flex-col gap-20">
                        
                        {/* 1. COORDINATOR CARD */}
                        {coordinator && (
                            <div className="bg-[#013A33] p-10 md:p-12 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-40 w-40 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                
                                <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-10">
                                    <div className="w-24 h-24 rounded-full bg-[#00FFCC] flex items-center justify-center text-[#002A28] text-3xl font-black shrink-0">
                                        {coordinator.name.charAt(4)}
                                    </div>
                                    <div>
                                        <h3 className="text-[#00FFCC] font-mono text-xs uppercase tracking-widest mb-2">Regional Coordinator</h3>
                                        <h4 className="text-3xl font-black text-white mb-2">{coordinator.name}</h4>
                                        <p className="text-gray-400 font-medium mb-6">{coordinator.designation}</p>
                                        <a href={`mailto:${coordinator.email}`} className="text-white text-sm font-bold border-b-2 border-[#00FFCC] pb-1 hover:text-[#00FFCC] transition-colors">
                                            {coordinator.email}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. DYNAMIC SECTIONS */}
                        <div className="flex flex-col gap-24">
                            {sections.map((section, idx) => (
                                <section key={idx} className="relative">
                                    <h2 className="text-4xl font-black text-white uppercase tracking-tight mb-8 flex items-center gap-4">
                                        <span className="w-2 h-2 bg-[#00FFCC] rounded-full"></span>
                                        {section.title}
                                    </h2>
                                    
                                    <div className="prose prose-invert max-w-none">
                                        <p className="text-gray-300 text-lg leading-[1.8] font-light">
                                            {section.content}
                                        </p>
                                    </div>

                                    {section.reportLink && (
                                        <div className="mt-10">
                                            <Link 
                                                href={section.reportLink.href}
                                                target="_blank"
                                                className="inline-flex items-center gap-4 bg-white text-[#002A28] px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs hover:bg-[#00FFCC] transition-all transform hover:-translate-y-1 shadow-xl"
                                            >
                                                <span>{section.reportLink.text}</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </Link>
                                        </div>
                                    )}
                                </section>
                            ))}
                        </div>

                        {/* FOOTER NOTICE */}
                        <div className="mt-12 p-10 bg-[#002A28] border border-white/5 rounded-[2.5rem] opacity-50 hover:opacity-100 transition-opacity">
                            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em] leading-relaxed">
                                UBA NIT Manipur is dedicated to leveraging technical expertise for rural transformation. 
                                Our participatory rural appraisal (PRA) approach ensures that technological interventions 
                                are indigenous, sustainable, and community-driven.
                            </p>
                        </div>
                    </div>

                    {/* --- SIDEBAR --- */}
                    <Sidebar links={outreachLinks} />

                </div>
            </main>

            <Footer />
        </>
    );
}