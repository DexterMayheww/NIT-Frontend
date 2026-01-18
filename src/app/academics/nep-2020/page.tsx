// app/academics/nep-2020/page.tsx

import { getNodeByPath } from '@/lib/drupal/generated';
import { getDrupalDomain } from '@/lib/drupal/customFetch';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { parse } from 'node-html-parser';

export default async function NEP2020Page() {
    const { data, status } = await getNodeByPath('/academics/nep-2020');
    const DRUPAL_DOMAIN = getDrupalDomain();

    if (!data || status !== 200) {
        notFound();
    }

    const quickLinks = [
        { label: 'Academic Cell', href: '/academics/academic-cell' },
        { label: 'Academic Calendar', href: '/academics/academic-calendar' },
        { label: 'Course Structure', href: '/academics/course-structure' },
        { label: 'Ordinances', href: '/academics/ordinances' },
        { label: 'Syllabi', href: '/academics/syllabi' },
        { label: 'Fee Structure', href: '/academics/fee-structure' },
        { label: 'Time-Table', href: '/academics/time-table' },
        { label: 'Holidays List', href: '/academics/holidays-list' },
        { label: 'NEP-2020', href: '/academics/nep-2020', active: true },
    ];

    const processHtml = (htmlString: string) => {
        if (!htmlString) return '';
        
        const root = parse(htmlString);

        root.querySelectorAll('img').forEach((img) => {
            const src = img.getAttribute('src');
            if (src?.startsWith('/sites')) {
                img.setAttribute('src', `${DRUPAL_DOMAIN}${src}`);
            }
        });

        root.querySelectorAll('a').forEach((a) => {
            const href = a.getAttribute('href');
            if (href?.startsWith('/sites')) {
                a.setAttribute('href', `${DRUPAL_DOMAIN}${href}`);
            }
        });

        return root.toString();
    };

    const processedHtml = processHtml(data.editor || '');

    return (
        <>
            <main className="min-h-screen bg-[#f9f9f9] pt-32 pb-20 px-4 font-sans">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">

                    {/* --- MAIN CONTENT AREA --- */}
                    <div className="w-full lg:w-[65%] order-2 lg:order-1">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl md:text-4xl font-black text-[#013a33] uppercase tracking-tight mb-2">
                                {data.title || 'National Education Policy (NEP) - 2020'}
                            </h1>
                        </div>
                        <div className="bg-white p-8 md:p-12 shadow-[0_10px_30px_rgba(0,0,0,0.05)] rounded-xl border border-gray-100">
                            <article
                                className="prose prose-lg max-w-none text-gray-700 leading-relaxed
                                    [&_a]:text-[#013a33] [&_a]:font-bold [&_a]:underline [&_a]:hover:text-[#2eac63]
                                    
                                    /* TABLE STYLING */
                                    [&_table]:w-full [&_table]:border-collapse [&_table]:my-8 [&_table]:text-sm
                                    [&_th]:bg-gray-100 [&_th]:border [&_th]:border-gray-300 [&_th]:p-4 [&_th]:text-[#013a33] [&_th]:font-black [&_th]:uppercase
                                    [&_td]:border [&_td]:border-gray-300 [&_td]:p-4 [&_td]:bg-white
                                    
                                    /* LIST STYLING */
                                    [&_ol]:list-none [&_ol]:pl-0
                                    [&_ol_li]:relative [&_ol_li]:pl-10 [&_ol_li]:mb-6
                                    [&_ol_li::before]:content-['➤'] [&_ol_li::before]:absolute [&_ol_li::before]:left-0 
                                    [&_ol_li::before]:text-[#013a33] [&_ol_li::before]:text-xl [&_ol_li::before]:top-0
                                "
                                dangerouslySetInnerHTML={{ __html: processedHtml }}
                            />
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