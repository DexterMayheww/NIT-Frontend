import { getNodeByPath } from '@/lib/drupal/generated';
import { getDrupalDomain } from '@/lib/drupal/customFetch';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { parse } from 'node-html-parser';

interface TravelArchive {
    session: string;
    fullTitle: string;
    href: string;
}

/**
 * PARSER: Extracts session years and formats travel archive cards
 */
function parseTravelArchive(html: string, domain: string): TravelArchive[] {
    if (!html) return [];
    const root = parse(html);
    const listItems = root.querySelectorAll('li');

    return listItems.map(li => {
        const link = li.querySelector('a');
        const rawTitle = link?.text.trim() || li.text.trim();
        let href = link?.getAttribute('href') || "#";
        if (href.startsWith('/')) href = `${domain}${href}`;

        // Extract the year pattern (e.g., 2024-25)
        const yearMatch = rawTitle.match(/\d{4}-\d{2,4}/);
        const session = yearMatch ? yearMatch[0] : "Archive";

        return {
            session,
            fullTitle: rawTitle,
            href
        };
    });
}

export default async function ToursTravelsPage() {
    const DRUPAL_DOMAIN = getDrupalDomain();
    const { data, status } = await getNodeByPath('/employee-corner/tours-travels');

    if (!data || status !== 200) {
        notFound();
    }

    const archives = parseTravelArchive(data.editor || "", DRUPAL_DOMAIN);

    const employeeLinks = [
        { label: "APAR - Teaching", href: "/employee-corner/apar-formats/teaching" },
        { label: "APAR - Non-Teaching", href: "/employee-corner/apar-formats/non-teaching" },
        { label: "Forms", href: "/employee-corner/forms" },
        { label: "IPR Format", href: "/employee-corner/ipr-format" },
        { label: "No Due Certificate", href: "/employee-corner/no-due-certificate" },
        { label: "CPDA Guidelines", href: "/employee-corner/cdpa-guidelines" },
        { label: "Basic Approval Form", href: "/employee-corner/basic-approval-form" },
        { label: "Transfers & Postings", href: "/employee-corner/transfer-postings" },
        { label: "Tours & Travels", href: "/employee-corner/tours-travels", active: true },
    ];

    return (
        <>
            <main className="min-h-screen bg-[#002A28] pt-32 font-sans selection:bg-[#00FFCC] selection:text-[#002A28]">
                
                {/* --- INSTITUTIONAL HERO --- */}
                <div className="relative h-56 flex items-center mb-16 overflow-hidden bg-[#013A33]">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/world-map.png')] opacity-10"></div>
                    <div className="container mx-auto px-6 relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-[#00FFCC] font-mono text-[10px] uppercase tracking-[0.6em]">Travel Logistics</span>
                            <div className="h-px w-12 bg-[#00FFCC]/40"></div>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter">
                            Tours & <br />Travels
                        </h1>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 pb-24 flex flex-col lg:flex-row gap-16">
                    
                    {/* --- MAIN CONTENT AREA --- */}
                    <div className="w-full lg:w-[70%] order-2 lg:order-1">
                        
                        <div className="mb-12">
                            <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-4">
                                Annual Expenditure Logs
                            </h2>
                            <p className="text-gray-400 text-lg border-l-2 border-[#00FFCC] pl-6 italic">
                                "{data.title || 'Institutional Tours and Travels Archive'}"
                            </p>
                        </div>

                        {/* ARCHIVE TIMELINE */}
                        <div className="relative border-l border-white/5 ml-4 pl-10 space-y-8">
                            {archives.length > 0 ? (
                                archives.map((item, idx) => (
                                    <a 
                                        key={idx}
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group relative flex flex-col md:flex-row md:items-center justify-between bg-[#013A33] p-8 rounded-3xl border border-white/5 hover:border-[#00FFCC]/40 transition-all duration-500 shadow-xl"
                                    >
                                        {/* Timeline Dot */}
                                        <div className="absolute -left-[51px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#002A28] border-4 border-[#013A33] group-hover:border-[#00FFCC] transition-colors z-10"></div>

                                        <div className="flex items-center gap-8">
                                            {/* Session Badge */}
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Session</span>
                                                <span className="text-2xl font-black text-[#00FFCC] leading-none">
                                                    {item.session}
                                                </span>
                                            </div>

                                            <div className="h-10 w-px bg-white/5 hidden md:block"></div>

                                            <div>
                                                <h4 className="text-lg font-bold text-gray-200 group-hover:text-white transition-colors">
                                                    {item.fullTitle}
                                                </h4>
                                                <p className="text-[10px] font-mono text-gray-500 mt-1 uppercase tracking-tighter">Verified Institutional Record</p>
                                            </div>
                                        </div>

                                        <div className="mt-6 md:mt-0 flex items-center gap-4">
                                            <div className="text-right hidden md:block">
                                                <p className="text-[9px] font-black text-white uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Request Access</p>
                                                <p className="text-[9px] font-mono text-gray-600 uppercase">PDF format</p>
                                            </div>
                                            <div className="w-12 h-12 rounded-2xl bg-[#002A28] flex items-center justify-center text-[#00FFCC] group-hover:bg-[#00FFCC] group-hover:text-[#002A28] transition-all transform group-hover:rotate-12">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </a>
                                ))
                            ) : (
                                <div className="py-20 text-center bg-white/5 rounded-[2rem] border-2 border-dashed border-white/5">
                                    <p className="text-gray-600 font-mono text-sm italic uppercase tracking-widest">No travel archives are currently indexed.</p>
                                </div>
                            )}
                        </div>

                        {/* REGULATORY FOOTER */}
                        <div className="mt-20 p-10 rounded-[2.5rem] bg-[#002A28] border border-white/5 group">
                            <div className="flex gap-6 items-start">
                                <div className="w-12 h-12 rounded-full bg-[#00FFCC]/10 flex items-center justify-center text-[#00FFCC] shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h5 className="text-white font-bold mb-2 uppercase tracking-tight">Administrative Note</h5>
                                    <p className="text-gray-500 text-xs leading-relaxed font-light group-hover:text-gray-400 transition-colors">
                                        The expenditure records listed above are summarized annual reports for institutional transparency. 
                                        Individual tour approvals, TA/DA claims, and LTC settlements are managed through the Finance Section. 
                                        For historical data prior to 2022, please submit a formal request to the Establishment Unit.
                                    </p>
                                </div>
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