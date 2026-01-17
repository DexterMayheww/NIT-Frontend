// app/facilities/games-sports/page.tsx

import { getNodeByPath } from '@/lib/drupal/generated';
import { getDrupalDomain } from '@/lib/drupal/customFetch';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { parse } from 'node-html-parser';

interface SportsTeam {
    name: string;
    description: string;
    link?: { label: string; url: string };
}

/**
 * Parses the nested UL/LI structure from Drupal Editor:
 * - Parent LI: Team Name
 * - Child LI 1: Description text
 * - Child LI 2: "Learn more" anchor
 */
function parseSportsTeams(html: string, domain: string): SportsTeam[] {
    if (!html) return [];
    const root = parse(html);
    const teams: SportsTeam[] = [];

    // Find the top level list items
    const topListItems = root.querySelectorAll('ul > li');

    topListItems.forEach((li) => {
        // 1. Get the Team Name (text before the nested UL)
        const nameNode = li.childNodes.find(node => node.nodeType === 3 || (node as any).tagName === 'STRONG');
        const name = nameNode ? nameNode.text.trim() : 'Sports Team';

        // 2. Get nested details
        const nestedUl = li.querySelector('ul');
        if (nestedUl) {
            const nestedLis = nestedUl.querySelectorAll('li');
            const description = nestedLis[0]?.text.trim() || '';

            const linkElem = nestedLis[1]?.querySelector('a');
            let link;
            if (linkElem) {
                let href = linkElem.getAttribute('href') || '#';
                if (href.startsWith('/')) href = `${domain}${href}`;
                link = {
                    label: linkElem.text.trim(),
                    url: href
                };
            }

            teams.push({ name, description, link });
        }
    });

    return teams;
}

export default async function GamesSportsPage() {
    const DRUPAL_DOMAIN = getDrupalDomain();
    const { data, status } = await getNodeByPath('/facilities/games-sports');

    if (!data || status !== 200) {
        notFound();
    }

    const quickLinks = [
        { label: 'Central Library', href: '/facilities/central-library' },
        { label: 'Facilities at Campus', href: '/facilities/campus' },
        { label: 'Games & Sports', href: '/facilities/games-sports', active: true },
        { label: 'Hostel', href: '/facilities/hostel' },
        { label: 'Infrastructure', href: '/facilities/infrastructure' },
        { label: 'Training & Placement', href: '/facilities/training-placement' },
    ];

    const sportsTeams = parseSportsTeams(data.editor || '', DRUPAL_DOMAIN);

    return (
        <>
            <main className="min-h-screen bg-white pt-32 pb-20 font-sans">

                {/* --- PAGE HEADER --- */}
                <div className="container mx-auto px-4 mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-[#013A33] text-center uppercase tracking-tight">
                        Sports Team At NIT-Manipur
                    </h1>
                    <div className="w-24 h-1.5 bg-[#014b3e] mx-auto mt-4 rounded-full"></div>
                </div>

                {/* --- CONTENT & SIDEBAR --- */}
                <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row gap-10">

                    <div className="w-full lg:w-[70%] order-2 lg:order-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {sportsTeams.length > 0 ? (
                                sportsTeams.map((team, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-[#014b3e] text-white p-8 rounded-[20px] shadow-[0_4px_8px_0_rgba(0,0,0,0.2),0_6px_20px_0_rgba(0,0,0,0.19)] transition-transform hover:-translate-y-1"
                                    >
                                        <h3 className="text-xl font-bold mb-4 border-b border-white/20 pb-2">
                                            {team.name}
                                        </h3>
                                        <p className="text-sm leading-relaxed mb-6 text-gray-100 opacity-90">
                                            {team.description}
                                        </p>

                                        {team.link && (
                                            <a
                                                href={team.link.url}
                                                className="inline-block text-white italic text-sm hover:text-[#00FFCC] transition-colors"
                                            >
                                                {team.link.label}
                                            </a>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-[20px]">
                                    <p className="text-gray-400 italic">Sports team rosters are being updated for the current season.</p>
                                </div>
                            )}
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