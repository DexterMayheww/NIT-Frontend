// app/academics/academic-calendar/page.tsx

import { getNodeByPath } from '@/lib/drupal/generated';
import { getDrupalDomain } from '@/lib/drupal/customFetch';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { parse } from 'node-html-parser';

export default async function AcademicCalendarPage() {
  const { data, status } = await getNodeByPath('/academics/academic-calendar');
  const DRUPAL_DOMAIN = getDrupalDomain();

  if (!data || status !== 200) {
    notFound();
  }

  const quickLinks = [
    { label: 'Academic Cell', href: '/academics/academic-cell' },
    { label: 'Academic Calendar', href: '/academics/academic-calendar', active: true },
    { label: 'Course Structure', href: '/academics/course-structure' },
    { label: 'Ordinances', href: '/academics/ordinances' },
    { label: 'Syllabi', href: '/academics/syllabi' },
    { label: 'Fee Structure', href: '/academics/fee-structure' },
    { label: 'Time-Table', href: '/academics/time-table' },
    { label: 'Holidays List', href: '/academics/holidays-list' },
    { label: 'NEP-2020', href: '/academics/nep-2020' },
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
  console.log("Processed: ", data.editor);

  return (
    <>
      <main className="min-h-screen bg-white pt-32 pb-20 px-4 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
          
          {/* --- MAIN CONTENT: CALENDAR TABLE --- */}
          <div className="w-full lg:w-[65%] order-2 lg:order-1">
            <div className="inner-content shadow-[5px_5px_10px_gray] overflow-hidden rounded-sm border border-gray-100">
              
              <div className="overflow-x-auto">
                <article 
                  className="prose prose-lg max-w-none text-gray-700 leading-relaxed p-6
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

            {!data.editor && (
              <div className="py-20 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                <p className="text-gray-400 italic">The academic calendar for the current session is being finalized...</p>
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