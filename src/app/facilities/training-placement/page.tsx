import { getNodeByPath } from '@/lib/drupal/generated';
import { getDrupalDomain } from '@/lib/drupal/customFetch';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { parse } from 'node-html-parser';
import Image from 'next/image';

interface CoordinatorData {
    name: string;
    email: string;
    mobile: string;
    image: string;
    message: string;
    designation: string;
}

/**
 * PARSER: Segmenting the field_editor into "About" and "Coordinator"
 */
function parsePlacementData(html: string, domain: string) {
    if (!html) return { about: null, coordinator: null };
    const root = parse(html);

    // 1. Extract About Section
    const aboutHeader = root.querySelector('h1, h2')?.text.trim() || "About Placement";
    const firstUl = root.querySelector('ul');
    const aboutText = firstUl?.querySelector('li')?.text.trim() || "";

    // 2. Extract Coordinator Section
    const coordHeader = root.querySelectorAll('h1, h2')[1]?.text.trim() || "Message from Coordinator";
    const secondUl = root.querySelectorAll('ul')[1];
    
    const coordinator: Partial<CoordinatorData> = {};
    
    if (secondUl) {
        const listItems = secondUl.querySelectorAll('li');
        
        // Image extraction
        const img = secondUl.querySelector('img');
        let src = img?.getAttribute('src') || "";
        if (src.startsWith('/')) src = `${domain}${src}`;
        coordinator.image = src;
        console.log("Image src", coordinator.image);

        // Structured extraction based on visual order
        coordinator.name = listItems[1]?.text.trim();
        coordinator.email = listItems[2]?.text.replace(/Email:\s*/i, '').trim();
        coordinator.mobile = listItems[3]?.text.replace(/Mobile:\s*/i, '').trim();
        coordinator.message = listItems[4]?.text.trim();
        coordinator.designation = listItems[6]?.text.trim(); // "Faculty Coordinator"
    }

    return {
        about: { title: aboutHeader, text: aboutText },
        coordinator: coordinator as CoordinatorData
    };
}

export default async function TrainingPlacementPage() {
    const DRUPAL_DOMAIN = getDrupalDomain();
    const { data, status } = await getNodeByPath('/facilities/training-placement');

    if (!data || status !== 200) {
        notFound();
    }

    const { about, coordinator } = parsePlacementData(data.editor || "", DRUPAL_DOMAIN);

    const quickLinks = [
        { label: 'Central Library', href: '/facilities/central-library' },
        { label: 'Facilities at Campus', href: '/facilities/campus' },
        { label: 'Games & Sports', href: '/facilities/games-sports' },
        { label: 'Hostel', href: '/facilities/hostel' },
        { label: 'Infrastructure', href: '/facilities/infrastructure' },
        { label: 'Training & Placement', href: '/facilities/training-placement', active: true },
    ];

    return (
        <>
            <main className="min-h-screen bg-[#002A28] pt-32 font-sans selection:bg-[#00FFCC] selection:text-[#002A28]">
                
                {/* --- HEADER --- */}
                <div className="relative h-64 flex items-center mb-16 overflow-hidden bg-[#013A33]">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#002A28]"></div>
                        {/* Abstract Tech Patterns could go here */}
                    </div>
                    <div className="container mx-auto px-6 relative z-10">
                        <h1 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter">
                            {data.title || 'Training & Placement'}
                        </h1>
                        <p className="text-[#00FFCC] font-mono tracking-widest mt-2">NIT MANIPUR PLACEMENT CELL</p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 pb-24 flex flex-col lg:flex-row gap-12">
                    
                    <div className="w-full lg:w-[70%] order-2 lg:order-1 flex flex-col gap-16">
                        
                        {/* --- ABOUT SECTION --- */}
                        {about && (
                            <section className="bg-[#013A33] p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-white/5">
                                <h2 className="text-3xl font-black text-white mb-8 border-l-4 border-[#00FFCC] pl-6 uppercase">
                                    {about.title}
                                </h2>
                                <p className="text-gray-200 text-lg leading-relaxed first-letter:text-5xl first-letter:font-black first-letter:text-[#00FFCC] first-letter:mr-3 first-letter:float-left">
                                    {about.text}
                                </p>
                            </section>
                        )}

                        {/* --- COORDINATOR MESSAGE SECTION --- */}
                        {coordinator && (
                            <section className="relative">
                                <div className="absolute -top-10 right-10 text-[12rem] font-black text-white opacity-[0.03] select-none pointer-events-none">
                                    &ldquo;
                                </div>
                                
                                <div className="bg-[#00463C] rounded-[3rem] p-8 md:p-16 border border-[#00FFCC]/20 shadow-2xl relative overflow-hidden">
                                    <div className="flex flex-col md:flex-row gap-12 items-start">
                                        
                                        {/* Image & Contact Card */}
                                        <div className="w-full md:w-1/3 flex flex-col gap-6">
                                            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-4 border-[#002A28] shadow-2xl">
                                                <Image 
                                                    src={coordinator.image || '/photo/placeholder.png'} 
                                                    alt={coordinator.name}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized={process.env.NODE_ENV === 'development'}
                                                />
                                            </div>
                                            <div className="bg-[#002A28] p-6 rounded-2xl border border-white/10">
                                                <h4 className="text-[#00FFCC] font-bold text-xl mb-4">{coordinator.name}</h4>
                                                <div className="text-sm text-gray-400 space-y-2">
                                                    <p className="flex items-center gap-2">
                                                        <span className="text-[#00FFCC]">✉</span> {coordinator.email}
                                                    </p>
                                                    <p className="flex items-center gap-2">
                                                        <span className="text-[#00FFCC]">📞</span> {coordinator.mobile}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Message Content */}
                                        <div className="w-full md:w-2/3">
                                            <h3 className="text-2xl font-bold text-white mb-8 italic">
                                                Message from the Faculty Coordinator (T&P Cell)
                                            </h3>
                                            <div className="prose prose-invert max-w-none">
                                                <p className="text-gray-200 leading-[1.8] text-lg">
                                                    {coordinator.message}
                                                </p>
                                            </div>
                                            <div className="mt-12 pt-8 border-t border-white/10">
                                                <p className="text-white font-black uppercase tracking-widest">{coordinator.name}</p>
                                                <p className="text-[#00FFCC] text-sm uppercase">{coordinator.designation}</p>
                                                <p className="text-gray-400 text-xs">NIT Manipur</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>

                    {/* --- SIDEBAR --- */}
                    <Sidebar links={quickLinks} />

                </div>
            </main>

            <Footer />
        </>
    );
}