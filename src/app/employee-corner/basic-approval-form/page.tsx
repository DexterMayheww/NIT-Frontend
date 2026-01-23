// src/app/employee-corner/basic-approval-form/page.tsx

import { getNodeByPath } from '@/lib/drupal/generated';
import { getDrupalDomain } from '@/lib/drupal/customFetch';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { parse } from 'node-html-parser';
import { getDrupalData } from '@/lib/drupal/getDrupalData';

interface BasicApprovalDoc {
    text: string;
    url: string;
    isWord: boolean;
    isPdf: boolean;
    extension: string;
}

/**
 * SYNC PARSER: Maps CKEditor titles to uploaded field_files by index
 */
function syncApprovalFiles(html: string, files: { url: string; filename: string }[]) {
    if (!html) return { instruction: "", documents: [] };
    const root = parse(html);
    
    // 2. Extract list items as labels
    const listItems = root.querySelectorAll('li');

    // 3. Zip labels with actual file objects
    const documents: BasicApprovalDoc[] = listItems.map((li, index) => {
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
    }).filter((doc): doc is BasicApprovalDoc => doc !== null);

    return { documents };
}

export default async function BasicApprovalFormPage() {
    const DRUPAL_DOMAIN = getDrupalDomain();
    const INCLUDES = 'field_files';
    const data = await getDrupalData('/employee-corner/basic-approval-form', INCLUDES);

    if (!data) notFound();

    const { documents } = syncApprovalFiles(data.editor || "", data.files || []);

    const employeeLinks = [
        { label: "APAR - Teaching", href: "/employee-corner/apar-formats/teaching" },
        { label: "APAR - Non-Teaching", href: "/employee-corner/apar-formats/non-teaching" },
        { label: "Forms", href: "/employee-corner/forms" },
        { label: "IPR Format", href: "/employee-corner/ipr-format" },
        { label: "No Due Certificate", href: "/employee-corner/no-due-certificate" },
        { label: "CPDA Guidelines", href: "/employee-corner/cdpa-guidelines" },
        { label: "Basic Approval Form", href: "/employee-corner/basic-approval-form", active: true },
        { label: "Transfers & Postings", href: "/employee-corner/transfer-postings" },
        { label: "Tours & Travels", href: "/employee-corner/tours-travels" },
    ];

    return (
        <>
            <main className="min-h-screen bg-[#002A28] pt-32 font-sans selection:bg-[#00FFCC] selection:text-[#002A28]">
                
                {/* --- INSTITUTIONAL HERO --- */}
                <div className="relative h-64 flex items-center mb-16 overflow-hidden bg-[#013A33]">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                    <div className="absolute bottom-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#00FFCC]/5 to-transparent"></div>
                    
                    <div className="container mx-auto px-6 relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-2 h-2 rounded-full bg-[#00FFCC] animate-pulse"></div>
                            <span className="text-[#00FFCC] font-mono text-[10px] uppercase tracking-[0.5em]">Inventory & Procurement</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">
                            Equipment <br />Approval
                        </h1>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 pb-24 flex flex-col lg:flex-row gap-16">
                    
                    {/* --- MAIN CONTENT --- */}
                    <div className="w-full lg:w-[70%] order-2 lg:order-1">
                        
                        <div className="mb-12">
                            <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-4">
                                Purchase Requisitions
                            </h2>
                            <p className="text-gray-400 text-lg max-w-2xl border-l-2 border-[#00FFCC]/40 pl-6 italic">
                                "{data.title || 'Basic Approval for Purchase of Equipment'}"
                            </p>
                        </div>

                        <div className="flex flex-col gap-4">
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
                        </div>

                        {/* COMPLIANCE FOOTER */}
                        <div className="mt-16 p-8 rounded-3xl bg-[#00463C] border border-[#00FFCC]/10 flex flex-col md:flex-row items-center gap-8 group">
                            <div className="w-16 h-16 rounded-full bg-[#00FFCC] flex items-center justify-center text-[#002A28] shadow-[0_0_30px_rgba(0,255,204,0.3)] shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div className="text-center md:text-left">
                                <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-2">Institutional Compliance</h4>
                                <p className="text-gray-300 text-xs leading-relaxed font-light opacity-70 group-hover:opacity-100 transition-opacity">
                                    All equipment and consumable requests must strictly follow the GFR (General Financial Rules) and institute-specific audit guidelines. 
                                    Forms must be routed through the Central Stores for stock entry after technical approval by the Head of Department.
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