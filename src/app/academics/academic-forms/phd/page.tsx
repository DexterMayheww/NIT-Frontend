import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { parse } from 'node-html-parser';
import { getDrupalData } from '@/lib/drupal/getDrupalData';
import { getDrupalDomain } from '@/lib/drupal/customFetch';

interface FormResource {
    title: string;
    url: string;
    extension: string;
}

interface SpecializationLink {
    text: string;
    href: string;
}

/**
 * PARSER: Extracting M.Tech Forms, Structures, and Specialization Syllabi
 */
function parsePhDData(html: string, files: { url: string; filename: string }[], domain: string) {
    if (!html) return { forms: [], structures: [], syllabi: [] };
    const root = parse(html);
    
    // 1. Sync Forms with field_files
    const formList = root.querySelector('ol, ul');
    const formTitles = formList?.querySelectorAll('li').map(li => li.text.trim()) || [];
    const forms: FormResource[] = formTitles.map((title, index) => {
        const file = files[index];
        if (!file) return null;
        return {
            title,
            url: file.url,
            extension: file.url.split('.').pop()?.toUpperCase() || 'PDF'
        };
    }).filter((f): f is FormResource => f !== null);

    // 2. Parse Course Structure
    const structures: { text: string; href: string }[] = [];
    const h2s = root.querySelectorAll('h1, h2, h3');
    const structureHeading = h2s.find(h => h.text.toLowerCase().includes('structure'));
    if (structureHeading) {
        let nextElem = structureHeading.nextElementSibling;
        // Search for the next list in case of stray nodes
        while (nextElem && nextElem.tagName !== 'UL' && nextElem.tagName !== 'OL') {
            nextElem = nextElem.nextElementSibling;
        }
        if (nextElem) {
            nextElem.querySelectorAll('li a').forEach(a => {
                structures.push({ text: a.text.trim(), href: a.getAttribute('href') || '#' });
            });
        }
    }

    // 3. Parse Syllabi (Single-Column Table)
    const syllabi: SpecializationLink[] = [];
    const table = root.querySelector('table');
    if (table) {
        const links = table.querySelectorAll('td a');
        links.forEach(a => {
            syllabi.push({
                text: a.text.trim(),
                href: a.getAttribute('href') || '#'
            });
        });
    }

    return { forms, structures, syllabi };
}

export default async function PhDFormsPage() {
    const DRUPAL_DOMAIN = getDrupalDomain();
    const INCLUDES = 'field_files';
    const data = await getDrupalData('/academics/academic-forms/phd', INCLUDES);

    if (!data) notFound();

    const { forms, structures, syllabi } = parsePhDData(data.editor || "", data.files || [], DRUPAL_DOMAIN);

    const academicLinks = [
        { label: "B.Tech Forms", href: "/academics/academic-forms/btech" },
        { label: "M.Tech Forms", href: "/academics/academic-forms/mtech" },
        { label: "M.Sc Forms", href: "/academics/academic-forms/msc" },
        { label: "Ph.D Forms", href: "/academics/academic-forms/phd", active: true },
    ];

    return (
        <>
            <main className="min-h-screen bg-[#002A28] pt-32 font-sans selection:bg-[#00FFCC] selection:text-[#002A28]">
                
                {/* --- POSTGRADUATE HERO --- */}
                <div className="relative h-64 flex items-center mb-16 overflow-hidden bg-[#013A33] border-b border-white/5">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#00FFCC_1.5px,transparent_1.5px)] [background-size:24px_24px]"></div>
                    <div className="container mx-auto px-6 relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                            <span className="h-[2px] w-8 bg-[#00FFCC]"></span>
                            <span className="text-[#00FFCC] font-mono text-xs uppercase tracking-[0.5em] font-bold">Postgraduate Portal</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter">
                            Doctor of <br />Philosophy
                        </h1>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 pb-24 flex flex-col lg:flex-row gap-16">
                    
                    {/* --- MAIN CONTENT --- */}
                    <div className="w-full lg:w-[70%] order-2 lg:order-1 flex flex-col gap-20">
                        
                        {/* 1. ACADEMIC FORMS */}
                        <section>
                            <h2 className="text-3xl font-black text-white mb-8 uppercase tracking-tight flex items-center gap-4">
                                <span className="w-8 h-8 rounded-full bg-[#00FFCC] text-[#002A28] flex items-center justify-center text-xs">01</span>
                                Ph.D Forms
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {forms.length > 0 ? forms.map((form, idx) => (
                                    <a key={idx} href={form.url} target="_blank" className="group relative bg-[#013A33] p-10 rounded-[2.5rem] border border-white/5 hover:border-[#00FFCC]/40 transition-all duration-500 shadow-2xl overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FFCC]/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-[#00FFCC]/10 transition-colors"></div>
                                        <div className="relative z-10">
                                            <div className="flex items-center justify-between mb-8">
                                                <span className="text-[10px] font-black text-[#00FFCC] border border-[#00FFCC]/30 px-3 py-1 rounded uppercase tracking-[0.2em]">
                                                    {form.extension} Resource
                                                </span>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 group-hover:text-[#00FFCC] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                            </div>
                                            <h3 className="text-xl font-bold text-white group-hover:text-[#00FFCC] transition-colors leading-snug">
                                                {form.title}
                                            </h3>
                                        </div>
                                    </a>
                                )) : (
                                    <p className="text-gray-500 italic font-mono text-sm">No forms currently indexed for M.Tech.</p>
                                )}
                            </div>
                        </section>

                        {/* 2. COURSE STRUCTURE */}
                        <section>
                            <h2 className="text-3xl font-black text-white mb-8 uppercase tracking-tight flex items-center gap-4">
                                <span className="w-8 h-8 rounded-full bg-[#00FFCC] text-[#002A28] flex items-center justify-center text-xs">02</span>
                                Departmental Structure
                            </h2>
                            <div className="bg-[#013A33] rounded-[3rem] p-12 border border-white/5 relative overflow-hidden">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
                                    {structures.map((item, idx) => (
                                        <a key={idx} href={item.href} className="group flex items-center gap-4 py-4 border-b border-white/5 last:border-0">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#00FFCC] opacity-30 group-hover:opacity-100 transition-opacity"></span>
                                            <span className="text-gray-300 group-hover:text-white font-medium transition-colors">{item.text}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* 3. SYLLABI (SPECIALIZATION HUB) */}
                        <section>
                            <h2 className="text-3xl font-black text-white mb-8 uppercase tracking-tight flex items-center gap-4">
                                <span className="w-8 h-8 rounded-full bg-[#00FFCC] text-[#002A28] flex items-center justify-center text-xs">03</span>
                                Department Syllabi
                            </h2>
                            <div className="grid grid-cols-1 gap-4">
                                {syllabi.map((spec, idx) => (
                                    <a 
                                        key={idx} 
                                        href={spec.href} 
                                        className="group flex items-center justify-between bg-[#013A33] p-8 rounded-3xl border border-white/5 hover:border-[#00FFCC]/30 transition-all duration-300"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 rounded-2xl bg-[#002A28] border border-white/5 flex items-center justify-center text-[#00FFCC] font-mono text-xs font-bold group-hover:bg-[#00FFCC] group-hover:text-[#002A28] transition-all">
                                                {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                                            </div>
                                            <span className="text-lg font-bold text-gray-200 group-hover:text-white transition-colors uppercase tracking-tight">
                                                {spec.text}
                                            </span>
                                        </div>
                                        <div className="text-[#00FFCC] opacity-0 group-hover:opacity-100 translate-x-[-20px] group-hover:translate-x-0 transition-all">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </section>

                    </div>

                    {/* --- SIDEBAR --- */}
                    <Sidebar links={academicLinks} />

                </div>
            </main>

            <Footer />
        </>
    );
}