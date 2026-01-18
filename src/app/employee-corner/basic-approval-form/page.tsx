import { getNodeByPath } from '@/lib/drupal/generated';
import { getDrupalDomain } from '@/lib/drupal/customFetch';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { parse } from 'node-html-parser';

interface ApprovalLink {
    title: string;
    subtext: string;
    href: string;
}

/**
 * PARSER: Converts CKEditor list into structured action cards
 */
function parseApprovalForms(html: string, domain: string): ApprovalLink[] {
    if (!html) return [];
    const root = parse(html);
    const listItems = root.querySelectorAll('li');

    return listItems.map(li => {
        const link = li.querySelector('a');
        const rawText = link?.text.trim() || li.text.trim();
        let href = link?.getAttribute('href') || "#";
        if (href.startsWith('/')) href = `${domain}${href}`;

        // Avant-Garde Cleanup: Separate "FORM -" from the actual descriptor
        const title = rawText.replace(/^FORM\s*-\s*/i, '');
        
        return {
            title: title,
            subtext: rawText.startsWith('FORM') ? 'Procurement Form' : 'Request Document',
            href: href
        };
    });
}

export default async function BasicApprovalFormPage() {
    const DRUPAL_DOMAIN = getDrupalDomain();
    const { data, status } = await getNodeByPath('/employee-corner/basic-approval-form');

    if (!data || status !== 200) {
        notFound();
    }

    const forms = parseApprovalForms(data.editor || "", DRUPAL_DOMAIN);

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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {forms.map((form, idx) => (
                                <a 
                                    key={idx}
                                    href={form.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group relative bg-[#013A33] p-8 rounded-[2.5rem] border border-white/5 hover:border-[#00FFCC]/40 transition-all duration-500 shadow-xl overflow-hidden"
                                >
                                    {/* Design Element */}
                                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>

                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-6">
                                            <span className="text-[#00FFCC] font-mono text-[9px] uppercase tracking-widest bg-[#00FFCC]/10 px-2 py-0.5 rounded">Official Form</span>
                                            <span className="text-gray-600 text-[9px] font-mono uppercase tracking-widest">Index: 0{idx + 1}</span>
                                        </div>
                                        
                                        <h3 className="text-xl font-bold text-white group-hover:text-[#00FFCC] transition-colors leading-tight mb-8 min-h-[3rem]">
                                            {form.title}
                                        </h3>

                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Download Asset</span>
                                            <div className="w-10 h-10 rounded-full bg-[#002A28] flex items-center justify-center text-[#00FFCC] group-hover:bg-[#00FFCC] group-hover:text-[#002A28] transition-all">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                                </svg>
                                            </div>
                                        </div>
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