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

interface SyllabusRow {
    old: { text: string; href: string }[];
    new: { text: string; href: string }[];
}

/**
 * COMPREHENSIVE PARSER: Extracts Forms, Course Structure, and Syllabi Table
 */
function parseBTechData(html: string, files: { url: string; filename: string }[], domain: string) {
    if (!html) return { forms: [], structures: [], syllabi: [] };
    const root = parse(html);
    
    // 1. Parse Forms (Mapped to field_files)
    // Looking for the first UL after the first H2
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
    // Looking for the list after the "Course Structure" heading
    const structures: { text: string; href: string }[] = [];
    const h1s = root.querySelectorAll('h1');
    const structureHeading = h1s.find(h => h.text.toLowerCase().includes('structure'));
    if (structureHeading) {
        const list = structureHeading.nextElementSibling;
        if (list && (list.tagName === 'UL' || list.tagName === 'OL')) {
            list.querySelectorAll('li a').forEach(a => {
                structures.push({ text: a.text.trim(), href: a.getAttribute('href') || '#' });
            });
        }
    }

    // 3. Parse Syllabi Table
    const syllabi: SyllabusRow[] = [];
    const table = root.querySelector('table');
    if (table) {
        const rows = table.querySelectorAll('tr').slice(1); // Skip header
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            const extractLinks = (cell: any) => {
                return cell.querySelectorAll('a').map((a: any) => ({
                    text: a.text.trim(),
                    href: a.getAttribute('href') || '#'
                }));
            };
            if (cells.length >= 2) {
                syllabi.push({
                    old: extractLinks(cells[0]),
                    new: extractLinks(cells[1])
                });
            }
        });
    }

    return { forms, structures, syllabi };
}

export default async function BTechFormsPage() {
    const DRUPAL_DOMAIN = getDrupalDomain();
    const INCLUDES = 'field_files';
    const data = await getDrupalData('/academics/academic-forms/btech', INCLUDES);

    if (!data) notFound();

    const { forms, structures, syllabi } = parseBTechData(data.editor || "", data.files || [], DRUPAL_DOMAIN);

    const academicLinks = [
        { label: "B.Tech Forms", href: "/academics/academic-forms/btech", active: true },
        { label: "M.Tech Forms", href: "/academics/academic-forms/mtech" },
        { label: "M.Sc Forms", href: "/academics/academic-forms/msc" },
        { label: "Ph.D Forms", href: "/academics/academic-forms/phd" },
    ];

    return (
        <>
            <main className="min-h-screen bg-[#002A28] pt-32 font-sans selection:bg-[#00FFCC] selection:text-[#002A28]">
                
                {/* --- HERO SECTION --- */}
                <div className="relative h-64 flex items-center mb-16 overflow-hidden bg-[#013A33] border-b border-white/5">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#00FFCC_1px,transparent_1px)] [background-size:30px_30px]"></div>
                    <div className="container mx-auto px-6 relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                            <span className="h-[1px] w-12 bg-[#00FFCC]"></span>
                            <span className="text-[#00FFCC] font-mono text-xs uppercase tracking-[0.4em]">Undergraduate Portal</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter">
                            Bachelor of <br />Technology
                        </h1>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 pb-24 flex flex-col lg:flex-row gap-16">
                    
                    {/* --- MAIN CONTENT --- */}
                    <div className="w-full lg:w-[70%] order-2 lg:order-1 flex flex-col gap-20">
                        
                        {/* 1. FORMS SECTION */}
                        <section>
                            <h2 className="text-3xl font-black text-white mb-8 uppercase tracking-tight flex items-center gap-4">
                                <span className="w-8 h-8 rounded-full bg-[#00FFCC] text-[#002A28] flex items-center justify-center text-xs">01</span>
                                B.Tech Forms
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

                        {/* 2. COURSE STRUCTURE SECTION */}
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

                        {/* 3. SYLLABI TABLE (AVANT-GARDE CARDS) */}
                        <section>
                            <h2 className="text-3xl font-black text-white mb-8 uppercase tracking-tight flex items-center gap-4">
                                <span className="w-8 h-8 rounded-full bg-[#00FFCC] text-[#002A28] flex items-center justify-center text-xs">03</span>
                                Department Syllabi
                            </h2>
                            <div className="space-y-6">
                                {syllabi.map((row, idx) => (
                                    <div key={idx} className="bg-[#013A33] rounded-[2rem] overflow-hidden border border-white/5 flex flex-col md:flex-row">
                                        {/* OLD SCHEME */}
                                        <div className="flex-1 p-8 border-b md:border-b-0 md:border-r border-white/5 bg-[#002A28]/30">
                                            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-4 block">Legacy Scheme</span>
                                            {row.old.map((link, lIdx) => (
                                                <a key={lIdx} href={link.href} className="text-white font-bold hover:text-[#00FFCC] transition-colors block mb-2">{link.text}</a>
                                            ))}
                                        </div>
                                        {/* NEW SCHEME */}
                                        <div className="flex-1 p-8 bg-gradient-to-br from-transparent to-[#00FFCC]/5">
                                            <span className="text-[10px] font-mono text-[#00FFCC] uppercase tracking-widest mb-4 block">2024 Scheme (New)</span>
                                            {row.new.map((link, lIdx) => (
                                                <a key={lIdx} href={link.href} className="text-white font-bold hover:text-[#00FFCC] transition-colors block mb-2">{link.text}</a>
                                            ))}
                                        </div>
                                    </div>
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