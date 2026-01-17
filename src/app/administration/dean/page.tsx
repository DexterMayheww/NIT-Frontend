// app/administration/dean/page.tsx

import { getNodeByPath } from '@/lib/drupal/generated';
import { getDrupalDomain } from '@/lib/drupal/customFetch';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { parse } from 'node-html-parser';

/**
 * Normalizes the Dean Table HTML from Drupal.
 * Ensures the table fits the institutional shadow-box style
 * and prefixes relative email or document links.
 */
function processDeanTable(html: string, domain: string) {
    if (!html) return '';
    const root = parse(html);

    // Normalize links (for email anchors or profile pages)
    root.querySelectorAll('a').forEach((a) => {
        const href = a.getAttribute('href');
        if (href && href.startsWith('/')) {
            a.setAttribute('href', `${domain}${href}`);
        }
        // Matching the specific link hover style from static HTML
        a.setAttribute('class', 'text-black font-bold no-underline hover:underline hover:text-[#013a33] transition-colors');
    });

    return root.toString();
}

export default async function DeanPage() {
    const DRUPAL_DOMAIN = getDrupalDomain();
    const { data, status } = await getNodeByPath('/administration/dean');

    if (!data || status !== 200) {
        notFound();
    }

    const quickLinks = [
        { label: 'Director', href: '/administration/director' },
        { label: 'Registrar', href: '/administration/registrar' },
        { label: 'Board of Governors', href: '/administration/board-of-governors' },
        { label: 'Building and Works Committee', href: '/administration/building-works-committee' },
        { label: 'Finance Committee', href: '/administration/finance-committee' },
        { label: 'NIT Council', href: '/administration/nit-council' },
        { label: 'Senate', href: '/administration/senate' },
        { label: 'Department Heads', href: '/administration/head-of-department' },
        { label: 'Dean', href: '/administration/dean', active: true },
        { label: 'NIT Administration', href: '/administration/nit-administration' },
        { label: 'Organisation Chart', href: '/administration/organisation-chart' },
        { label: 'Officers', href: '/administration/officers' },
        { label: 'Grant-in-aid received from MoE', href: '/administration/moe-grants' },
    ];

    const sanitizedHtml = processDeanTable(data.editor || '', DRUPAL_DOMAIN);

    return (
        <>
            <main className="min-h-screen bg-white pt-32 pb-20 px-4 font-sans">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">

                    {/* --- MAIN CONTENT AREA: DEAN TABLE --- */}
                    <div className="w-full lg:w-[65%] order-2 lg:order-1">
                        <div className="bg-white shadow-[5px_5px_10px_gray] rounded-sm overflow-hidden border border-gray-100">

                            <div className="overflow-x-auto">
                                <article
                                    className="prose prose-lg max-w-none
                    /* TABLE CORE STYLES */
                    [&_table]:w-full [&_table]:border-collapse [&_table]:m-0
                    
                    /* THEAD / HEADER STYLES (#013a33) */
                    [&_thead_th]:bg-[#013a33] [&_thead_th]:text-white [&_thead_th]:p-4 [&_thead_th]:text-left [&_thead_th]:font-bold [&_thead_th]:border-none [&_thead_th]:text-sm [&_thead_th]:uppercase [&_thead_th]:tracking-wider
                    
                    /* TBODY / ZEBRA STYLES (#f0eceb for odd rows) */
                    [&_tbody_td]:p-4 [&_tbody_td]:border [&_tbody_td]:border-gray-200 [&_tbody_td]:text-gray-800 [&_tbody_td]:text-sm
                    [&_tbody_tr:nth-child(odd)_td]:bg-[#f0eceb]
                    
                    /* HOVER INTERACTION (#d4d2d2) */
                    [&_tbody_tr:hover_td]:bg-[#d4d2d2] [&_tbody_tr]:cursor-pointer [&_tbody_tr]:transition-colors
                    
                    /* TEXT FORMATTING */
                    [&_strong]:text-[#013a33] [&_strong]:font-black
                    [&_b]:text-[#013a33]
                  "
                                    dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                                />
                            </div>

                        </div>

                        {/* Context Note/Fallback */}
                        {!data.editor && (
                            <div className="py-20 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                                <p className="text-gray-400 italic">Information regarding the Deans&apos; council is currently being updated.</p>
                            </div>
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