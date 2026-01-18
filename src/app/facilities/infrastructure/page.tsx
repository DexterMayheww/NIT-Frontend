import { getNodeByPath } from '@/lib/drupal/generated';
import { getDrupalDomain } from '@/lib/drupal/customFetch';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { parse } from 'node-html-parser';
import Image from 'next/image';
import Link from 'next/link';

interface FacilitySection {
    title: string;
    description: string;
    imageUrl: string;
    link: string;
}

/**
 * PARSER: Extracts structured data from Drupal's field_editor
 * Based on the structure: <h3>Title</h3> <ul><li>Text</li><li><img></li><li><a></li></ul>
 */
function parseInfrastructure(html: string, domain: string) {
    if (!html) return { hero: null, sections: [] };
    
    const root = parse(html);
    const sections: FacilitySection[] = [];
    
    // 1. Extract the "NIT CAMPUS" Hero Section (usually the first H2/H3 and first UL)
    const heroTitle = root.querySelector('h2, h3')?.text.trim() || "NIT Campus";
    const heroUl = root.querySelector('ul');
    const heroDesc = heroUl?.querySelector('li')?.text.trim() || "";

    // 2. Extract Sub-Sections (Learning, Sporting, Accommodation)
    // We look for all H3s after the first one
    const headers = root.querySelectorAll('h3').slice(1); 
    
    headers.forEach((header) => {
        const title = header.text.trim();
        const siblingUl = header.nextElementSibling;
        
        if (siblingUl && siblingUl.tagName === 'UL') {
            const description = siblingUl.querySelector('li')?.text.trim() || "";
            const imgElem = siblingUl.querySelector('img');
            const linkElem = siblingUl.querySelector('a');

            let imageUrl = imgElem?.getAttribute('src') || "";
            if (imageUrl && imageUrl.startsWith('/')) imageUrl = `${domain}${imageUrl}`;

            sections.push({
                title,
                description,
                imageUrl,
                link: linkElem?.getAttribute('href') || "#"
            });
        }
    });

    return {
        hero: { title: heroTitle, description: heroDesc },
        sections
    };
}

export default async function InfrastructurePage() {
    const DRUPAL_DOMAIN = getDrupalDomain();
    const { data, status } = await getNodeByPath('/facilities/infrastructure');

    if (!data || status !== 200) {
        notFound();
    }

    const { hero, sections } = parseInfrastructure(data.editor || "", DRUPAL_DOMAIN);

    const quickLinks = [
        { label: 'Central Library', href: '/facilities/central-library' },
        { label: 'Facilities at Campus', href: '/facilities/campus' },
        { label: 'Games & Sports', href: '/facilities/games-sports' },
        { label: 'Hostel', href: '/facilities/hostel' },
        { label: 'Infrastructure', href: '/facilities/infrastructure', active: true },
        { label: 'Training & Placement', href: '/facilities/training-placement' },
    ];

    return (
        <>
            <main className="min-h-screen bg-[#002A28] pt-32 font-sans selection:bg-[#00FFCC] selection:text-[#002A28]">
                
                {/* --- INSTITUTIONAL HEADING --- */}
                <div 
                    className="relative h-64 flex items-center mb-16 overflow-hidden"
                    style={{ 
                        backgroundImage: "url('/photo/heading.jpg')", 
                        backgroundSize: 'cover', 
                        backgroundPosition: 'center' 
                    }}
                >
                    <div className="absolute inset-0 bg-[#013a33]/70 backdrop-blur-sm"></div>
                    <div className="container mx-auto px-6 relative z-10">
                        <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter drop-shadow-2xl">
                            {data.title || 'Infrastructure'}
                        </h1>
                        <div className="w-24 h-2 bg-[#00FFCC] mt-4"></div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 pb-24 flex flex-col lg:flex-row gap-16">
                    
                    {/* --- MAIN CONTENT --- */}
                    <div className="w-full lg:w-[70%] order-2 lg:order-1">
                        
                        {/* 1. HERO CAMPUS CARD */}
                        {hero && (
                            <div className="bg-[#013A33] p-10 md:p-14 rounded-[2rem] shadow-2xl border border-white/5 mb-16 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[#00FFCC]/5 rounded-full -mr-32 -mt-32 blur-3xl transition-all group-hover:bg-[#00FFCC]/10"></div>
                                
                                <h2 className="text-4xl font-black text-[#00FFCC] mb-6 uppercase tracking-tight">
                                    {hero.title}
                                </h2>
                                <p className="text-gray-200 text-lg leading-relaxed mb-10 italic border-l-2 border-[#00FFCC]/30 pl-6">
                                    {hero.description}
                                </p>
                                
                                <div className="flex flex-wrap gap-4">
                                    {['Learning Spaces', 'Sporting Spaces', 'Accommodation Spaces'].map((btn) => (
                                        <button key={btn} className="px-6 py-3 bg-[#002A28] text-white text-sm font-bold rounded-xl border border-white/10 hover:bg-[#00FFCC] hover:text-[#002A28] transition-all uppercase tracking-widest">
                                            {btn}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 2. INFRASTRUCTURE GRID */}
                        <div className="flex flex-col gap-12">
                            {sections.map((section, idx) => (
                                <div 
                                    key={idx} 
                                    className="flex flex-col md:flex-row gap-8 bg-[#013A33] rounded-[2rem] overflow-hidden border border-white/5 hover:border-[#00FFCC]/30 transition-all group shadow-xl"
                                >
                                    <div className="md:w-1/3 relative h-64 md:h-auto overflow-hidden">
                                        {section.imageUrl ? (
                                            <Image 
                                                src={section.imageUrl} 
                                                alt={section.title}
                                                fill
                                                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
                                                unoptimized={process.env.NODE_ENV === 'development'}
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-[#002A28] flex items-center justify-center text-[#00FFCC]/20">
                                                No Image
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-r from-[#013A33] via-transparent to-transparent hidden md:block"></div>
                                    </div>

                                    <div className="md:w-2/3 p-10 flex flex-col justify-center">
                                        <h3 className="text-3xl font-black text-white mb-4 group-hover:text-[#00FFCC] transition-colors">
                                            {section.title}
                                        </h3>
                                        <p className="text-gray-300 leading-relaxed mb-6 line-clamp-3">
                                            {section.description}
                                        </p>
                                        <Link 
                                            href={section.link} 
                                            className="text-[#00FFCC] font-bold uppercase tracking-widest text-sm flex items-center gap-2 hover:gap-4 transition-all"
                                        >
                                            Explore Space <span>→</span>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 3. VIDEO / IFRAME SECTION */}
                        <div className="mt-20">
                            <div className="bg-[#013A33] p-4 rounded-[2.5rem] shadow-2xl border border-white/5 aspect-video overflow-hidden">
                                <iframe 
                                    width="100%" 
                                    height="100%" 
                                    src="https://www.youtube.com/embed/dQw4w9WgXcQ" // Replace with dynamic if needed
                                    title="NIT Manipur Infrastructure" 
                                    frameBorder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                    referrerPolicy="strict-origin-when-cross-origin" 
                                    allowFullScreen
                                    className="rounded-[1.5rem]"
                                ></iframe>
                            </div>
                            <h5 className="text-center mt-6 text-gray-500 font-mono uppercase tracking-[0.5em] text-xs">Campus Walkthrough</h5>
                        </div>
                    </div>

                    {/* --- SIDEBAR --- */}
                    <Sidebar links={quickLinks} />

                </div>
            </main>

            <Footer />
        </>
    );
}