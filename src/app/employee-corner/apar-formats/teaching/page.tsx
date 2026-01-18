import { getNodeByPath } from '@/lib/drupal/generated';
import { getDrupalDomain } from '@/lib/drupal/customFetch';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { parse } from 'node-html-parser';

interface APARDoc {
    text: string;
    href: string;
    isWord: boolean;
    isPdf: boolean;
}

/**
 * PARSER: Separates the instruction paragraph from the document links
 */
function parseTeachingAPAR(html: string, domain: string) {
    if (!html) return { instruction: "", documents: [] };
    const root = parse(html);

    const instruction = root.querySelector('p')?.text.trim() || "";
    const listItems = root.querySelectorAll('li');

    const documents: APARDoc[] = listItems.map(li => {
        const link = li.querySelector('a');
        const text = link?.text.trim() || li.text.trim();
        let href = link?.getAttribute('href') || "#";
        if (href.startsWith('/')) href = `${domain}${href}`;

        return {
            text,
            href,
            isWord: text.toLowerCase().includes('word'),
            isPdf: text.toLowerCase().includes('pdf')
        };
    });

    return { instruction, documents };
}

export default async function TeachingAPARPage() {
    const DRUPAL_DOMAIN = getDrupalDomain();
    const { data, status } = await getNodeByPath('/employee-corner/apar-formats/teaching');

    if (!data || status !== 200) {
        notFound();
    }

    const { instruction, documents } = parseTeachingAPAR(data.editor || "", DRUPAL_DOMAIN);

    const employeeLinks = [
        { label: "APAR - Teaching", href: "/employee-corner/apar-formats/teaching", active: true },
        { label: "APAR - Non-Teaching", href: "/employee-corner/apar-formats/non-teaching" },
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
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00FFCC]/5 to-transparent"></div>
                    <div className="container mx-auto px-6 relative z-10">
                        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                            APAR Formats
                        </h1>
                        <p className="text-[#00FFCC] font-mono text-sm tracking-[0.4em] mt-2 uppercase">
                            Teaching Staff Section
                        </p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 pb-24 flex flex-col lg:flex-row gap-12">
                    
                    {/* --- MAIN CONTENT --- */}
                    <div className="w-full lg:w-[70%] order-2 lg:order-1">
                        
                        {/* INSTRUCTION CARD */}
                        {instruction && (
                            <div className="bg-[#00463C] p-8 rounded-3xl border border-[#00FFCC]/20 mb-12 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-[#00FFCC] font-bold uppercase tracking-widest text-xs mb-4">Official Notification</h3>
                                <p className="text-white text-xl font-medium leading-relaxed italic">
                                    &quot;{instruction}&quot;
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col gap-6">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-4 flex items-center gap-4">
                                Documentation Portal
                                <span className="h-[1px] w-20 bg-[#00FFCC]/30"></span>
                            </h2>

                            {documents.map((doc, idx) => (
                                <a 
                                    key={idx}
                                    href={doc.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex flex-col md:flex-row md:items-center justify-between bg-[#013A33] p-6 md:p-8 rounded-2xl border border-white/5 hover:border-[#00FFCC]/40 transition-all duration-300 shadow-xl"
                                >
                                    <div className="flex items-center gap-6">
                                        {/* Dynamic Icon based on type */}
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-colors ${
                                            doc.isPdf ? 'bg-red-500/10 border-red-500/20 group-hover:bg-red-500/20' : 
                                            doc.isWord ? 'bg-blue-500/10 border-blue-500/20 group-hover:bg-blue-500/20' : 
                                            'bg-[#002A28] border-white/10 group-hover:border-[#00FFCC]/50'
                                        }`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${
                                                doc.isPdf ? 'text-red-400' : doc.isWord ? 'text-blue-400' : 'text-[#00FFCC]'
                                            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="text-gray-100 font-bold group-hover:text-[#00FFCC] transition-colors">
                                                {doc.text}
                                            </h4>
                                            <p className="text-gray-500 text-xs font-mono mt-1 uppercase">
                                                {doc.isPdf ? 'PDF Format • 2.4 MB' : doc.isWord ? 'DOCX Format • 1.1 MB' : 'Official Directive'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 md:mt-0 flex items-center gap-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors">Download Resource</span>
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#00FFCC] group-hover:text-[#002A28] transition-all">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                            </svg>
                                        </div>
                                    </div>
                                </a>
                            ))}

                            {documents.length === 0 && (
                                <div className="py-20 text-center bg-white/5 rounded-3xl border-2 border-dashed border-white/10">
                                    <p className="text-gray-500">APAR resources are currently being updated for the current session.</p>
                                </div>
                            )}
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