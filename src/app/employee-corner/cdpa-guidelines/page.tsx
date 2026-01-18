import { getNodeByPath } from '@/lib/drupal/generated';
import { getDrupalDomain } from '@/lib/drupal/customFetch';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { parse } from 'node-html-parser';

interface DocumentLink {
    title: string;
    href: string;
}

interface CPDASection {
    category: string;
    links: DocumentLink[];
}

/**
 * PARSER: Groups links by the heading that precedes them
 */
function parseCPDA(html: string, domain: string): CPDASection[] {
    if (!html) return [];
    const root = parse(html);
    const sections: CPDASection[] = [];
    
    let currentCategory = "";
    let currentLinks: DocumentLink[] = [];

    // Traverse top-level nodes (h3, h2, ul)
    root.childNodes.forEach((node: any) => {
        const tagName = node.rawTagName?.toLowerCase();

        if (tagName === 'h2' || tagName === 'h3') {
            // If we already have a category, push it before starting new one
            if (currentCategory && currentLinks.length > 0) {
                sections.push({ category: currentCategory, links: [...currentLinks] });
            }
            currentCategory = node.text.trim();
            currentLinks = [];
        } else if (tagName === 'ul') {
            const listItems = node.querySelectorAll('li');
            listItems.forEach((li: any) => {
                const link = li.querySelector('a');
                if (link) {
                    let href = link.getAttribute('href') || "#";
                    if (href.startsWith('/')) href = `${domain}${href}`;
                    
                    currentLinks.push({
                        title: link.text.trim().replace(/^Click here for /i, ''),
                        href: href
                    });
                }
            });
        }
    });

    // Push the final section
    if (currentCategory && currentLinks.length > 0) {
        sections.push({ category: currentCategory, links: currentLinks });
    }

    return sections;
}

export default async function CPDAGuidelinesPage() {
    const DRUPAL_DOMAIN = getDrupalDomain();
    const { data, status } = await getNodeByPath('/employee-corner/cdpa-guidelines');

    if (!data || status !== 200) {
        notFound();
    }

    const sections = parseCPDA(data.editor || "", DRUPAL_DOMAIN);

    

    const employeeLinks = [
        { label: "APAR - Teaching", href: "/employee-corner/apar-formats/teaching" },
        { label: "APAR - Non-Teaching", href: "/employee-corner/apar-formats/non-teaching" },
        { label: "Forms", href: "/employee-corner/forms" },
        { label: "IPR Format", href: "/employee-corner/ipr-format" },
        { label: "No Due Certificate", href: "/employee-corner/no-due-certificate" },
        { label: "CPDA Guidelines", href: "/employee-corner/cdpa-guidelines", active: true },
        { label: "Basic Approval Form", href: "/employee-corner/basic-approval-form" },
        { label: "Transfers & Postings", href: "/employee-corner/transfer-postings" },
        { label: "Tours & Travels", href: "/employee-corner/tours-travels" },
    ];

    return (
        <>
            <main className="min-h-screen bg-[#002A28] pt-32 font-sans selection:bg-[#00FFCC] selection:text-[#002A28]">
                
                {/* --- DYNAMIC HEADER --- */}
                <div className="relative h-64 flex items-center mb-16 overflow-hidden bg-[#013A33]">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                    <div className="container mx-auto px-6 relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                            <span className="h-1 w-12 bg-[#00FFCC]"></span>
                            <span className="text-[#00FFCC] font-mono text-xs uppercase tracking-[0.4em]">Faculty Development</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-tight">
                            CPDA <br />Guidelines
                        </h1>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 pb-24 flex flex-col lg:flex-row gap-16">
                    
                    {/* --- MAIN CONTENT AREA --- */}
                    <div className="w-full lg:w-[70%] order-2 lg:order-1 flex flex-col gap-12">
                        
                        {sections.map((section, sIdx) => {
                            const isForms = section.category.toLowerCase().includes('forms');
                            const isAnnexure = section.category.toLowerCase().includes('annexure');

                            return (
                                <section key={sIdx} className="relative">
                                    <div className="flex items-baseline justify-between mb-8 border-b border-white/5 pb-4">
                                        <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                            <span className="text-[#00FFCC] text-sm">0{sIdx + 1}</span>
                                            {section.category}
                                        </h2>
                                        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Section {section.category.split(' ')[0]}</span>
                                    </div>

                                    <div className={`grid gap-4 ${isAnnexure ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                                        {section.links.map((link, lIdx) => (
                                            <a 
                                                key={lIdx}
                                                href={link.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`group flex items-center justify-between p-6 rounded-2xl border transition-all duration-300 ${
                                                    isForms 
                                                    ? 'bg-[#00FFCC]/5 border-[#00FFCC]/20 hover:bg-[#00FFCC]/10 hover:border-[#00FFCC]/50'
                                                    : 'bg-[#013A33] border-white/5 hover:border-white/20'
                                                }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono text-xs ${
                                                        isForms ? 'bg-[#00FFCC] text-[#002A28]' : 'bg-[#002A28] text-gray-400'
                                                    }`}>
                                                        {isAnnexure ? `A${lIdx + 1}` : isForms ? 'F' : 'D'}
                                                    </div>
                                                    <span className={`text-sm font-bold leading-tight ${
                                                        isForms ? 'text-white group-hover:text-[#00FFCC]' : 'text-gray-300 group-hover:text-white'
                                                    } transition-colors`}>
                                                        {link.title}
                                                    </span>
                                                </div>
                                                
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/5 text-[#00FFCC]">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </section>
                            );
                        })}

                        {/* POLICY DISCLAIMER */}
                        <div className="mt-16 p-8 rounded-[2rem] bg-[#00463C] border border-[#00FFCC]/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FFCC]/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                            <h4 className="text-[#00FFCC] font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-widest">
                                Processing Notice
                            </h4>
                            <p className="text-gray-300 text-xs leading-relaxed font-light">
                                All CPDA expenditures are subject to the institute's finance committee regulations and MHRD/MoE guidelines. 
                                Claims must be submitted with original invoices and participation certificates. 
                                For queries regarding the flowchart of activities, please consult the Dean (Faculty Welfare).
                            </p>
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