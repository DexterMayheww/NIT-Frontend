import { getNodeByPath } from '@/lib/drupal/generated';
import { getDrupalDomain } from '@/lib/drupal/customFetch';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { parse } from 'node-html-parser';
import { getDrupalData } from '@/lib/drupal/getDrupalData';

interface APARDoc {
    text: string;
    url: string;
    isWord: boolean;
    isPdf: boolean;
    extension: string;
}

/**
 * SYNC PARSER: Maps CKEditor titles to uploaded field_files by index
 */
function syncAPARFiles(html: string, files: { url: string; filename: string }[]) {
    if (!html) return { instruction: "", documents: [] };
    const root = parse(html);

    // 1. Extract the lead instruction
    const instruction = root.querySelector('p')?.text.trim() || "";
    
    // 2. Extract list items as labels
    const listItems = root.querySelectorAll('li');

    // 3. Zip labels with actual file objects
    const documents: APARDoc[] = listItems.map((li, index) => {
        const file = files[index];
        if (!file) return null;

        const text = li.text.trim().replace(/^click here for /i, '').replace(/^click here to download /i, '');
        const extension = file.url.split('.').pop()?.toUpperCase() || 'PDF';

        return {
            text,
            url: file.url,
            isWord: text.toLowerCase().includes('word') || extension === 'DOCX' || extension === 'DOC',
            isPdf: text.toLowerCase().includes('pdf') || extension === 'PDF',
            extension
        };
    }).filter((doc): doc is APARDoc => doc !== null);

    return { instruction, documents };
}

export default async function TeachingAPARPage() {
    const DRUPAL_DOMAIN = getDrupalDomain();
    
    // Fetch node including field_files
    const INCLUDES = 'field_files';
    const data = await getDrupalData('/employee-corner/apar-formats/non-teaching', INCLUDES);

    if (!data) notFound();

    // data.files is populated by field_files via processNode in generated.ts
    const { instruction, documents } = syncAPARFiles(data.editor || "", data.files || []);

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
                
                {/* --- MODERN HEADER --- */}
                <div className="relative h-56 flex items-center mb-16 overflow-hidden bg-[#013A33] border-b border-white/5">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#00FFCC_1px,transparent_1px)] [background-size:20px_20px]"></div>
                    <div className="container mx-auto px-6 relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                            <span className="w-10 h-[2px] bg-[#00FFCC]"></span>
                            <span className="text-[#00FFCC] font-mono text-xs uppercase tracking-[0.4em]">Faculty Resources</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter">
                            APAR <br />Formats
                        </h1>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 pb-24 flex flex-col lg:flex-row gap-12">
                    
                    {/* --- MAIN CONTENT AREA --- */}
                    <div className="w-full lg:w-[70%] order-2 lg:order-1">
                        
                        {/* INSTRUCTION CALLOUT */}
                        {instruction && (
                            <div className="bg-[#00463C] p-10 rounded-[2.5rem] border border-[#00FFCC]/20 mb-16 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </div>
                                <h3 className="text-[#00FFCC] font-bold uppercase tracking-[0.3em] text-[10px] mb-6">Administrative Directive</h3>
                                <p className="text-white text-2xl font-light leading-relaxed italic border-l-4 border-[#00FFCC] pl-8">
                                    &quot;{instruction}&quot;
                                </p>
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Teaching Staff Documentation</h2>
                                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Digital Archive</span>
                            </div>

                            {documents.map((doc, idx) => (
                                <a 
                                    key={idx}
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center justify-between bg-[#013A33] p-8 rounded-3xl border border-white/5 hover:border-[#00FFCC]/40 transition-all duration-500 hover:-translate-y-1 shadow-xl"
                                >
                                    <div className="flex items-center gap-8">
                                        {/* Dynamic Iconography */}
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 ${
                                            doc.isPdf ? 'bg-red-500/5 border-red-500/20 group-hover:bg-red-500/20' : 
                                            doc.isWord ? 'bg-blue-500/5 border-blue-500/20 group-hover:bg-blue-500/20' : 
                                            'bg-[#002A28] border-white/10 group-hover:border-[#00FFCC]/40'
                                        }`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-7 w-7 ${
                                                doc.isPdf ? 'text-red-400' : doc.isWord ? 'text-blue-400' : 'text-[#00FFCC]'
                                            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        
                                        <div>
                                            <h4 className="text-gray-100 font-bold text-xl group-hover:text-[#00FFCC] transition-colors leading-tight capitalize">
                                                {doc.text}
                                            </h4>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${
                                                    doc.isPdf ? 'bg-red-500/20 text-red-400' : 
                                                    doc.isWord ? 'bg-blue-500/20 text-blue-400' : 
                                                    'bg-white/10 text-gray-400'
                                                }`}>
                                                    {doc.extension}
                                                </span>
                                                <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                                                <span className="text-[10px] font-mono text-gray-500 uppercase">Institutional Resource</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5 border border-white/5 group-hover:bg-[#00FFCC] group-hover:text-[#002A28] transition-all">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                    </div>
                                </a>
                            ))}

                            {documents.length === 0 && (
                                <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                                    <p className="text-gray-600 font-mono text-sm">System: No documents indexed in the current node directory.</p>
                                </div>
                            )}
                        </div>

                        {/* HELPDESK FOOTER */}
                        <div className="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 opacity-40 hover:opacity-100 transition-opacity">
                            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Establishment Section • NIT Manipur</p>
                            <div className="flex gap-4">
                                <div className="px-4 py-1 rounded-full border border-white/20 text-[10px] text-white">MIS UNIT</div>
                                <div className="px-4 py-1 rounded-full border border-[#00FFCC]/40 text-[10px] text-[#00FFCC]">SYSTEMS PORTAL</div>
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