// app/academics/hostel/page.tsx

import { getNodeByPath } from '@/lib/drupal/generated';
import { getDrupalDomain } from '@/lib/drupal/customFetch';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { parse } from 'node-html-parser';
import Image from 'next/image';

interface HostelCard {
    name: string;
    imageUrl: string;
}

/**
 * Parses the Drupal editor to reconstruct the Hostel grid
 * Expected Structure: 
 * <ul>
 *   <li>Hostel Name
 *     <ul><li><img src="..."></li></ul>
 *   </li>
 * </ul>
 */
function parseHostelData(html: string, domain: string): HostelCard[] {
    if (!html) return [];
    const root = parse(html);
    const hostels: HostelCard[] = [];

    // Find the top-level list items
    const topListItems = root.querySelectorAll('ul > li');

    topListItems.forEach((li) => {
        // 1. Extract name (text before the nested list)
        const nameNode = li.childNodes.find(node => node.nodeType === 3);
        const name = nameNode ? nameNode.text.trim() : 'Hostel Facility';

        // 2. Find the image in the nested list
        const imgElem = li.querySelector('ul img');
        if (imgElem) {
            let src = imgElem.getAttribute('src') || '';
            if (src.startsWith('/')) src = `${domain}${src}`;

            hostels.push({
                name,
                imageUrl: src
            });
        }
    });

    return hostels;
}

export default async function HostelPage() {
    const DRUPAL_DOMAIN = getDrupalDomain();
    const { data, status } = await getNodeByPath('/facilities/hostel');

    if (!data || status !== 200) {
        notFound();
    }

    const quickLinks = [
        { label: 'Central Library', href: '/facilities/central-library' },
        { label: 'Facilities at Campus', href: '/facilities/campus' },
        { label: 'Games & Sports', href: '/facilities/games-sports' },
        { label: 'Hostel', href: '/facilities/hostel', active: true },
        { label: 'Infrastructure', href: '/facilities/infrastructure' },
        { label: 'Training & Placement', href: '/facilities/training-placement' },
    ];

    const hostelCards = parseHostelData(data.editor || '', DRUPAL_DOMAIN);

    return (
        <>
            <main className="min-h-screen bg-[#002A28] pt-32 font-sans">

                {/* --- INSTITUTIONAL HEADING --- */}
                <div
                    className="relative h-48 flex items-center mb-10 overflow-hidden"
                    style={{
                        backgroundImage: "url('/photo/heading.jpg')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                >
                    <div className="absolute inset-0 bg-[#013a33]/60 backdrop-blur-[1px]"></div>
                    <div className="container mx-auto px-6 relative z-10">
                        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                            {data.title || 'Hostel Facilities'}
                        </h1>
                    </div>
                </div>

                {/* --- MAIN CONTENT SECTION --- */}
                <div className="max-w-7xl mx-auto px-4 pb-24 flex flex-col lg:flex-row gap-12">

                    <div className="w-full lg:w-[70%] order-2 lg:order-1">
                        <div className="flex flex-col gap-8">
                            <h2 className="text-3xl font-black text-white border-l-4 border-[#00FFCC] pl-4 uppercase tracking-tight">
                                Institutional Accommodation
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {hostelCards.length > 0 ? (
                                    hostelCards.map((hostel, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-[#013A33] p-3 rounded-xl shadow-[0_4px_8px_rgba(0,0,0,0.1)] border border-white/5 transition-transform duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
                                        >
                                            <div className="relative h-56 w-full overflow-hidden rounded-lg">
                                                <Image
                                                    src={hostel.imageUrl}
                                                    alt={hostel.name}
                                                    className="w-full h-full object-cover"
                                                    width={100}
                                                    height={100}
                                                    unoptimized={process.env.NODE_ENV === 'development'}
                                                />
                                            </div>
                                            <div className="pt-4 pb-2 px-2 text-center">
                                                <h4 className="text-white text-lg font-bold uppercase tracking-wide">
                                                    {hostel.name}
                                                </h4>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-20 text-center bg-white/5 rounded-2xl border-2 border-dashed border-white/10">
                                        <p className="text-gray-400 italic">Hostel allocation data is being updated for the upcoming semester.</p>
                                    </div>
                                )}
                            </div>
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