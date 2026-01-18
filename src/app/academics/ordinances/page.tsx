// app/academics/ordinances/page.tsx

import { getNodeByPath } from '@/lib/drupal/generated';
import { getDrupalDomain } from '@/lib/drupal/customFetch';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { parse } from 'node-html-parser';

function processOrdinanceTable(html: string, domain: string) {
  if (!html) return '';
  const root = parse(html);

  const links = root.querySelectorAll('a');
  links.forEach((a) => {
    const href = a.getAttribute('href');
    if (href && href.startsWith('/')) {
      a.setAttribute('href', `${domain}${href}`);
    }
    a.setAttribute('style', 'font-weight: bold; color: #013a33;');
  });

  return root.toString();
}

export default async function OrdinancePage() {
  const DRUPAL_DOMAIN = getDrupalDomain();
  const { data, status } = await getNodeByPath('/academics/ordinances');

  if (!data || status !== 200) {
    notFound();
  }

  const quickLinks = [
    { label: 'Academic Cell', href: '/academics/academic-cell' },
    { label: 'Academic Calendar', href: '/academics/academic-calendar' },
    { label: 'Course Structure', href: '/academics/course-structure' },
    { label: 'Ordinances', href: '/academics/ordinances', active: true },
    { label: 'Syllabi', href: '/academics/syllabi' },
    { label: 'Fee Structure', href: '/academics/fee-structure' },
    { label: 'Time-Table', href: '/academics/time-table' },
    { label: 'Holidays List', href: '/academics/holidays-list' },
    { label: 'NEP-2020', href: '/academics/nep-2020' },
  ];

  const sanitizedHtml = processOrdinanceTable(data.editor || '', DRUPAL_DOMAIN);

  return (
    <>
      <main className="min-h-screen bg-white pt-32 pb-20 px-4 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">

          {/* --- MAIN CONTENT: ORDINANCE TABLE --- */}
          <div className="w-full lg:w-[65%] order-2 lg:order-1">
            <div className="bg-white p-4 md:p-8 shadow-[5px_5px_15px_rgba(0,0,0,0.1)] rounded-sm border border-gray-100 overflow-hidden">

              <div className="mb-8 border-b-2 border-gray-100 pb-4">
                <h1 className="text-3xl md:text-4xl font-black text-[#013a33] mb-4 uppercase tracking-tighter">
                  {data.title || 'Ordinances'}
                </h1>
              </div>

              <div className="overflow-x-auto">
                <article
                  className="prose prose-lg max-w-none
                    /* TABLE CORE */
                    [&_table]:w-full [&_table]:max-w-[800px] [&_table]:mx-auto [&_table]:border-collapse [&_table]:my-6
                    
                    /* HEADERS */
                    [&_th]:bg-[#036448] [&_th]:text-white [&_th]:p-4 [&_th]:border-2 [&_th]:border-gray-200 [&_th]:text-center [&_th]:font-bold
                    
                    /* CELLS */
                    [&_td]:p-4 [&_td]:border-2 [&_td]:border-gray-200 [&_td]:text-center [&_td]:text-sm
                    
                    /* ZEBRA STRIPING FROM ORIGINAL CSS */
                    [&_tr:nth-child(odd)]:bg-[#f5f5f5]
                    [&_tr:nth-child(even)]:bg-[#e6e4e4]
                    
                    /* HOVER STATE */
                    [&_tr:hover]:bg-gray-300 [&_tr]:transition-colors
                    
                    /* LINKS */
                    [&_a]:text-[#013a33] [&_a]:no-underline [&_a:hover]:underline [&_a:hover]:text-[#012823]
                  "
                  dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                />
              </div>

              {/* Fallback Message */}
              {!data.editor && (
                <div className="text-center py-10">
                  <p className="text-gray-400 italic">No ordinances have been uploaded to the registry yet.</p>
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