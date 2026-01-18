// src/app/employee-corner/ipr-format/page.tsx
import { getNodeByPath } from '@/lib/drupal/generated';
import { getDrupalDomain } from '@/lib/drupal/customFetch';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { parse } from 'node-html-parser';

interface IPRLink {
    text: string;
    href: string;
}

/**
 * PARSER: Extracts document links from the CKEditor list
 */
function parseIPRData(html: string, domain: string): IPRLink[] {
    if (!html) return [];
    const root = parse(html);
    const listItems = root.querySelectorAll('li');

    return listItems.map(li => {
        const link = li.querySelector('a');
        let href = link?.getAttribute('href') || "#";
        
        // Ensure relative Drupal file paths are absolute
        if (href.startsWith('/')) href = `${domain}${href}`;

        return {
            text: link?.text.trim() || li.text.trim(),
            href: href
        };
    });
}

export default async function IPRFormatPage() {
    const DRUPAL_DOMAIN = getDrupalDomain();
    const { data, status } = await getNodeByPath('/employee-corner/ipr-format');

    if (!data || status !== 200) {
        notFound();
    }

    const iprLinks = parseIPRData(data.editor || "", DRUPAL_DOMAIN);

    // Sidebar links based on the provided directory structure screenshot
    const employeeLinks = [
        { label: "APAR - Teaching", href: "/employee-corner/apar-formats/teaching" },
        { label: "APAR - Non-Teaching", href: "/employee-corner/apar-formats/non-teaching" },
        { label: "Forms", href: "/employee-corner/forms" },
        { label: "IPR Format", href: "/employee-corner/ipr-format", active: true },
        { label: "No Due Certificate", href: "/employee-corner/no-due-certificate" },
        { label: "CPDA Guidelines", href: "/employee-corner/cdpa-guidelines" },
        { label: "Basic Approval Form", href: "/employee-corner/basic-approval-form" },
        { label: "Transfers & Postings", href: "/employee-corner/transfer-postings" },
        { label: "Tours & Travels", href: "/employee-corner/tours-travels" },
    ];

    return (
        <>
            <main className="min-h-screen bg-[#002A28] pt-32 font-sans selection:bg-[#00FFCC] selection:text-[#002A28]">
                
                {/* --- HERO SECTION --- */}
                <div className="relative h-48 flex items-center mb-12 overflow-hidden bg-[#013A33]">
                    <div className="absolute inset-0 bg-[url('/photo/grid-pattern.png')] opacity-10"></div>
                    <div className="container mx-auto px-6 relative z-10">
                        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                            Employee Corner
                        </h1>
                        <p className="text-[#00FFCC] font-mono text-sm tracking-[0.3em] mt-2 uppercase">
                            Immovable Property Return (IPR)
                        </p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 pb-24 flex flex-col lg:flex-row gap-12">
                    
                    {/* --- MAIN CONTENT --- */}
                    <div className="w-full lg:w-[70%] order-2 lg:order-1">
                        <div className="flex flex-col gap-8">
                            
                            <div className="flex items-center gap-4 mb-4">
                                <h2 className="text-3xl font-black text-white uppercase tracking-tight">
                                    {data.title || 'IPR Format'}
                                </h2>
                                <div className="h-[2px] flex-grow bg-gradient-to-r from-[#00FFCC]/50 to-transparent"></div>
                            </div>

                            <p className="text-gray-400 text-lg leading-relaxed max-w-2xl border-l-2 border-[#00FFCC] pl-6 mb-8">
                                Official documentation and submission formats for Immovable Property Returns for regular teaching and non-teaching staff.
                            </p>

                            {/* DOCUMENT ACTION CARDS */}
                            <div className="grid grid-cols-1 gap-6">
                                {iprLinks.length > 0 ? (
                                    iprLinks.map((link, idx) => (
                                        <a 
                                            key={idx}
                                            href={link.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group bg-[#013A33] p-8 rounded-2xl border border-white/5 hover:border-[#00FFCC]/40 transition-all duration-300 shadow-xl flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-6">
                                                {/* Avant-Garde File Icon */}
                                                <div className="w-14 h-14 bg-[#002A28] rounded-xl flex items-center justify-center border border-white/10 group-hover:border-[#00FFCC]/50 transition-colors">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-[#00FFCC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <span className="text-gray-200 text-lg font-bold group-hover:text-white transition-colors">
                                                        {link.text}
                                                    </span>
                                                    <p className="text-[#00FFCC]/60 text-xs font-mono mt-1 uppercase tracking-widest">Official Format / PDF</p>
                                                </div>
                                            </div>

                                            <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white/5 group-hover:bg-[#00FFCC] group-hover:text-[#002A28] transition-all transform group-hover:translate-x-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                            </div>
                                        </a>
                                    ))
                                ) : (
                                    <div className="py-20 text-center bg-white/5 rounded-3xl border-2 border-dashed border-white/10">
                                        <p className="text-gray-500 italic">No documentation found in the current portal update.</p>
                                    </div>
                                )}
                            </div>

                            {/* COMPLIANCE FOOTNOTE */}
                            <div className="mt-12 p-6 bg-[#002A28] border border-white/5 rounded-2xl">
                                <p className="text-xs text-gray-500 leading-relaxed font-mono">
                                    <span className="text-[#00FFCC] mr-2">●</span> 
                                    All regular staff members are requested to submit the IPR within the stipulated timeframe as per Ministry guidelines. 
                                    For technical issues with downloads, contact the MIS Cell.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* --- SIDEBAR --- */}
                    <Sidebar links={employeeLinks} />

                </div>
            </main>

            <Footer />
        </>
    );
}