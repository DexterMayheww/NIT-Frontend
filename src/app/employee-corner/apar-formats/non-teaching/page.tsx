import { getNodeByPath } from '@/lib/drupal/generated';
import { getDrupalDomain } from '@/lib/drupal/customFetch';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { parse } from 'node-html-parser';

interface APARDocument {
    text: string;
    href: string;
    type: 'pdf' | 'word' | 'policy';
}

/**
 * PARSER: Structuring the non-teaching APAR content
 */
function parseNonTeachingAPAR(html: string, domain: string) {
    if (!html) return { instruction: "", documents: [] };
    const root = parse(html);

    const instruction = root.querySelector('p')?.text.trim() || "";
    const listItems = root.querySelectorAll('li');

    const documents: APARDocument[] = listItems.map(li => {
        const link = li.querySelector('a');
        const text = link?.text.trim() || li.text.trim();
        let href = link?.getAttribute('href') || "#";
        if (href.startsWith('/')) href = `${domain}${href}`;

        let type: 'pdf' | 'word' | 'policy' = 'policy';
        if (text.toLowerCase().includes('pdf')) type = 'pdf';
        else if (text.toLowerCase().includes('word')) type = 'word';

        return { text, href, type };
    });

    return { instruction, documents };
}

export default async function NonTeachingAPARPage() {
    const DRUPAL_DOMAIN = getDrupalDomain();
    const { data, status } = await getNodeByPath('/employee-corner/apar-formats/non-teaching');

    if (!data || status !== 200) {
        notFound();
    }

    const { instruction, documents } = parseNonTeachingAPAR(data.editor || "", DRUPAL_DOMAIN);

    const employeeLinks = [
        { label: "APAR - Teaching", href: "/employee-corner/apar-formats/teaching" },
        { label: "APAR - Non-Teaching", href: "/employee-corner/apar-formats/non-teaching", active: true },
        { label: "Forms", href: "/employee-corner/forms" },
        { label: "IPR Format", href: "/employee-corner/ipr-format" },
        { label: "No Due Certificate", href: "/employee-corner/no-due-certificate" },
        { label: "CPDA Guidelines", href: "/employee-corner/cdpa-guidelines" },
        { label: "Basic Approval Form", href: "/employee-corner/basic-approval-form" },
        { label: "Transfers & Postings", href: "/employee-corner/transfer-postings" },
        { label: "Tours & Travels", href: "/employee-corner/tours-travels" },
    ];

    return (
        <>
            <main className="min-h-screen bg-[#002A28] pt-32 font-sans selection:bg-[#00FFCC] selection:text-[#002A28]">
                
                {/* --- HEADER --- */}
                <div className="relative h-48 flex items-center mb-12 overflow-hidden bg-[#013A33]">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#00FFCC_1px,transparent_1px)] [background-size:20px_20px]"></div>
                    <div className="container mx-auto px-6 relative z-10">
                        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                            APAR Formats
                        </h1>
                        <p className="text-[#00FFCC] font-mono text-sm tracking-[0.4em] mt-2 uppercase">
                            Non-Teaching Staff Portal
                        </p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 pb-24 flex flex-col lg:flex-row gap-12">
                    
                    {/* --- MAIN CONTENT --- */}
                    <div className="w-full lg:w-[70%] order-2 lg:order-1">
                        
                        {/* INSTRUCTION CALLOUT */}
                        {instruction && (
                            <div className="bg-[#00463C] p-8 md:p-10 rounded-[2rem] border-l-8 border-[#00FFCC] shadow-2xl mb-12">
                                <h3 className="text-[#00FFCC] font-bold uppercase tracking-[0.2em] text-[10px] mb-4">Internal Directive</h3>
                                <p className="text-white text-xl leading-relaxed font-light italic">
                                    &quot;{instruction}&quot;
                                </p>
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Required Documents</h2>
                                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Format: 2024-25 Session</span>
                            </div>

                            {documents.map((doc, idx) => (
                                <a 
                                    key={idx}
                                    href={doc.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center justify-between bg-[#013A33] p-6 rounded-3xl border border-white/5 hover:border-[#00FFCC]/40 transition-all duration-500 hover:-translate-y-1 shadow-lg"
                                >
                                    <div className="flex items-center gap-6">
                                        {/* Dynamic Iconography */}
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 ${
                                            doc.type === 'pdf' ? 'bg-red-500/5 border-red-500/20 group-hover:bg-red-500/20' : 
                                            doc.type === 'word' ? 'bg-blue-500/5 border-blue-500/20 group-hover:bg-blue-500/20' : 
                                            'bg-[#002A28] border-white/10 group-hover:border-[#00FFCC]/40'
                                        }`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-7 w-7 ${
                                                doc.type === 'pdf' ? 'text-red-400' : doc.type === 'word' ? 'text-blue-400' : 'text-[#00FFCC]'
                                            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        
                                        <div>
                                            <h4 className="text-gray-100 font-bold text-lg group-hover:text-[#00FFCC] transition-colors leading-tight">
                                                {doc.text}
                                            </h4>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${
                                                    doc.type === 'pdf' ? 'bg-red-500/20 text-red-400' : 
                                                    doc.type === 'word' ? 'bg-blue-500/20 text-blue-400' : 
                                                    'bg-white/10 text-gray-400'
                                                }`}>
                                                    {doc.type}
                                                </span>
                                                <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                                                <span className="text-[10px] font-mono text-gray-500 uppercase">External Source</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Download Indicator */}
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5 border border-white/5 group-hover:bg-[#00FFCC] group-hover:text-[#002A28] transition-all">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                    </div>
                                </a>
                            ))}

                            {documents.length === 0 && (
                                <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                                    <p className="text-gray-600 font-mono text-sm">System Check: No documents currently queued for this section.</p>
                                </div>
                            )}
                        </div>

                        {/* HELPDESK FOOTER */}
                        <div className="mt-20 border-t border-white/5 pt-10">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 opacity-40 hover:opacity-100 transition-opacity">
                                <p className="text-xs text-gray-400 font-mono">FOR TECHNICAL ASSISTANCE REGARDING APAR FORMS, CONTACT MIS UNIT.</p>
                                <div className="flex gap-4">
                                    <span className="text-[10px] text-[#00FFCC] font-bold border border-[#00FFCC]/20 px-3 py-1 rounded-full">ESTABLISHMENT SECTION</span>
                                    <span className="text-[10px] text-white font-bold border border-white/20 px-3 py-1 rounded-full">NIT MANIPUR</span>
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