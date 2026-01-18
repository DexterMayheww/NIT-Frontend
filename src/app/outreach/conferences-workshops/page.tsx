import { getNodeByPath } from '@/lib/drupal/generated';
import { getDrupalDomain } from '@/lib/drupal/customFetch';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { parse } from 'node-html-parser';

interface OutreachEvent {
    title: string;
    href: string;
    index: number;
}

/**
 * PARSER: Transforms the ordered list from Drupal into a bespoke initiative grid
 */
function parseOutreachData(html: string, domain: string): OutreachEvent[] {
    if (!html) return [];
    const root = parse(html);
    const listItems = root.querySelectorAll('li');

    return listItems.map((li, idx) => {
        const link = li.querySelector('a');
        const text = link?.text.trim() || li.text.trim();
        let href = link?.getAttribute('href') || "#";
        
        if (href.startsWith('/')) href = `${domain}${href}`;

        return {
            title: text,
            href: href,
            index: idx + 1
        };
    });
}

export default async function ConferencesWorkshopsPage() {
    const DRUPAL_DOMAIN = getDrupalDomain();
    const { data, status } = await getNodeByPath('/outreach-activities/conferences-workshops');

    if (!data || status !== 200) {
        notFound();
    }

    const events = parseOutreachData(data.editor || "", DRUPAL_DOMAIN);

    // Sidebar links strictly following the provided directory structure
    const outreachLinks = [
        { label: "CDBE Tripartite Agreement", href: "/outreach/cdbe/tripartite-agreement" },
        { label: "Conferences & Workshops", href: "/outreach/conferences-workshops", active: true },
        { label: "UBA", href: "/outreach/uba" },
    ];

    return (
        <>
            <main className="min-h-screen bg-[#002A28] pt-32 font-sans selection:bg-[#00FFCC] selection:text-[#002A28]">
                
                {/* --- OUTREACH HERO --- */}
                <div className="relative h-64 flex items-center mb-16 overflow-hidden bg-[#013A33]">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/az-subtle.png')] opacity-20"></div>
                    <div className="container mx-auto px-6 relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-px w-12 bg-[#00FFCC]"></div>
                            <span className="text-[#00FFCC] font-mono text-xs uppercase tracking-[0.5em]">External Engagement</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-tight">
                            Conferences <br />& Workshops
                        </h1>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 pb-24 flex flex-col lg:flex-row gap-16">
                    
                    {/* --- MAIN CONTENT --- */}
                    <div className="w-full lg:w-[70%] order-2 lg:order-1">
                        
                        <div className="mb-12 border-l-4 border-[#00FFCC] pl-8">
                            <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-4">
                                Institutional Initiatives
                            </h2>
                            <p className="text-gray-400 text-lg max-w-2xl font-light italic">
                                &quot;{data.title || 'A repository of technical exchange and capacity building workshops at NIT Manipur.'}&quot;
                            </p>
                        </div>

                        {/* EVENT GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {events.length > 0 ? (
                                events.map((event) => (
                                    <a 
                                        key={event.index}
                                        href={event.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group relative bg-[#013A33] p-10 rounded-[2.5rem] border border-white/5 hover:border-[#00FFCC]/40 transition-all duration-500 shadow-2xl flex flex-col justify-between"
                                    >
                                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
                                            <span className="text-9xl font-black text-white">{event.index}</span>
                                        </div>

                                        <div className="relative z-10">
                                            <div className="w-12 h-12 bg-[#002A28] rounded-2xl flex items-center justify-center text-[#00FFCC] mb-8 border border-white/10 group-hover:bg-[#00FFCC] group-hover:text-[#002A28] transition-all">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                                </svg>
                                            </div>
                                            
                                            <h3 className="text-2xl font-bold text-white group-hover:text-[#00FFCC] transition-colors leading-tight mb-4">
                                                {event.title}
                                            </h3>
                                        </div>

                                        <div className="flex items-center gap-4 mt-8 pt-6 border-t border-white/5">
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] group-hover:text-white transition-colors">Resource Portal</span>
                                            <div className="h-px flex-grow bg-white/5"></div>
                                            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-[#00FFCC] group-hover:border-[#00FFCC] transition-all">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                            </div>
                                        </div>
                                    </a>
                                ))
                            ) : (
                                <div className="col-span-full py-24 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                                    <p className="text-gray-600 font-mono text-sm uppercase tracking-[0.3em]">Initiative Index Pending Update</p>
                                </div>
                            )}
                        </div>

                        {/* INFORMATIONAL FOOTER */}
                        <div className="mt-20 p-10 rounded-[3rem] bg-[#00463C] border border-[#00FFCC]/10 relative overflow-hidden group">
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                <div className="w-20 h-20 bg-[#00FFCC] rounded-full flex items-center justify-center text-[#002A28] shrink-0 shadow-[0_0_40px_rgba(0,255,204,0.3)]">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-white font-black uppercase tracking-widest mb-2">Outreach Compliance</h4>
                                    <p className="text-gray-300 text-sm leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">
                                        All workshops and conferences listed are sanctioned by the Office of Outreach Activities, NIT Manipur. 
                                        Participants are requested to verify registration links via official communications from the respective department coordinators. 
                                        For historical proceedings, contact the Outreach Cell.
                                    </p>
                                </div>
                            </div>
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