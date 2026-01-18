import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { parse } from 'node-html-parser';
import { getDrupalData } from '@/lib/drupal/getDrupalData';

interface FormResource {
    title: string;
    url: string;
    extension: string;
}

/**
 * PARSER & SYNC LOGIC: 
 * Maps the order of titles in the editor to the order of files in field_files
 */
function syncForms(html: string, files: { url: string; filename: string }[]): FormResource[] {
    if (!html || !files || files.length === 0) return [];
    
    const root = parse(html);
    const listItems = root.querySelectorAll('li');
    
    // Extract text titles from the editor list items
    const titles = listItems.map(li => li.text.trim());

    // Map titles to files by index
    return titles.map((title, index) => {
        const file = files[index];
        if (!file) return null;

        const extension = file.url.split('.').pop()?.toUpperCase() || 'PDF';

        return {
            title,
            url: file.url,
            extension
        };
    }).filter((form): form is FormResource => form !== null);
}

export default async function EmployeeFormsPage() {
    const FILES_ONLY = 'field_files';

    const data = await getDrupalData('/employee-corner/forms', FILES_ONLY);

    if (!data) {
        notFound();
    }

    // data.files comes from field_files processed in generated.ts
    const formResources = syncForms(data.editor || "", data.files || []);

    const employeeLinks = [
        { label: "APAR - Teaching", href: "/employee-corner/apar-formats/teaching" },
        { label: "APAR - Non-Teaching", href: "/employee-corner/apar-formats/non-teaching" },
        { label: "Forms", href: "/employee-corner/forms", active: true },
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
                
                {/* --- AVANT-GARDE HERO --- */}
                <div className="relative h-56 flex items-center mb-16 overflow-hidden bg-[#013A33] border-b border-white/5">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00FFCC]/10 rounded-full blur-[120px]"></div>
                        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#00FFCC]/5 rounded-full blur-[80px]"></div>
                    </div>
                    <div className="container mx-auto px-6 relative z-10">
                        <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">
                            Forms & <br />Declarations
                        </h1>
                        <p className="text-[#00FFCC] font-mono text-xs tracking-[0.5em] mt-6 uppercase opacity-70">
                            Institutional Resource Repository
                        </p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 pb-24 flex flex-col lg:flex-row gap-12">
                    
                    {/* --- MAIN CONTENT AREA --- */}
                    <div className="w-full lg:w-[70%] order-2 lg:order-1">
                        
                        <div className="mb-12">
                            <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">Administrative Downloads</h2>
                            <div className="w-12 h-1 bg-[#00FFCC] mb-8"></div>
                            <p className="text-gray-400 max-w-xl">
                                Please download the required forms, fill in the necessary details, and submit them to the respective establishment sections.
                            </p>
                        </div>

                        {/* FORM GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {formResources.length > 0 ? (
                                formResources.map((form, idx) => (
                                    <a 
                                        key={idx}
                                        href={form.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group relative bg-[#013A33] p-8 rounded-[2rem] border border-white/5 hover:border-[#00FFCC]/40 transition-all duration-500 shadow-xl overflow-hidden"
                                    >
                                        {/* Background Decor */}
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 -mr-12 -mt-12 rounded-full group-hover:bg-[#00FFCC]/10 transition-colors"></div>
                                        
                                        <div className="relative z-10 flex flex-col h-full justify-between">
                                            <div>
                                                <div className="flex items-center gap-3 mb-6">
                                                    <span className="text-[10px] font-black text-[#00FFCC] border border-[#00FFCC]/30 px-2 py-0.5 rounded uppercase tracking-widest">
                                                        {form.extension}
                                                    </span>
                                                    <span className="h-[1px] w-8 bg-white/10"></span>
                                                </div>
                                                <h3 className="text-xl font-bold text-white group-hover:text-[#00FFCC] transition-colors leading-snug mb-8">
                                                    {form.title}
                                                </h3>
                                            </div>

                                            <div className="flex items-center justify-between mt-auto">
                                                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Official Document</span>
                                                <div className="flex items-center gap-2 text-white font-black text-[10px] uppercase tracking-widest group-hover:gap-4 transition-all">
                                                    Download <span className="text-[#00FFCC]">↓</span>
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                ))
                            ) : (
                                <div className="col-span-full py-32 text-center bg-[#013A33]/50 rounded-[3rem] border-2 border-dashed border-white/5">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-gray-500 font-mono text-sm">No forms currently indexed in this directory.</p>
                                </div>
                            )}
                        </div>

                        {/* SUBMISSION GUIDELINE */}
                        <div className="mt-20 p-10 bg-[#002A28] rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#00FFCC]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-[#00FFCC] rounded-full"></span>
                                Submission Guidelines
                            </h4>
                            <p className="text-gray-400 text-sm leading-relaxed font-light">
                                All forms must be signed in original and submitted through the Head of the Department/Section. 
                                For any missing forms or clarification on which document is required for your case, 
                                please contact the Registrar&apos;s Office during official working hours.
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