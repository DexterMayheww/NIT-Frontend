// app/academics/time-table/page.tsx

import { getNodeByPath } from '@/lib/drupal/generated';
import { getDrupalDomain } from '@/lib/drupal/customFetch';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { parse } from 'node-html-parser';

function processTimeTable(html: string, domain: string) {
  if (!html) return '';
  const root = parse(html);

  // Normalize links
  root.querySelectorAll('a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href && href.startsWith('/')) {
      a.setAttribute('href', `${domain}${href}`);
    }
    a.setAttribute('class', 'text-black font-bold no-underline hover:underline hover:text-green-700 transition-colors');
  });

  // Ensure tables have the shadow and border classes
  root.querySelectorAll('table').forEach((table) => {
    table.setAttribute('style', 'box-shadow: 5px 5px 10px gray; margin-bottom: 2rem;');
    table.setAttribute('class', 'table table-bordered w-full border-collapse');
  });

  return root.toString();
}

export default async function TimeTablePage() {
  const DRUPAL_DOMAIN = getDrupalDomain();
  const { data, status } = await getNodeByPath('/academics/time-table');

  if (!data || status !== 200) {
    notFound();
  }

  const quickLinks = [
    { label: 'Academic Cell', href: '/academics/academic-cell' },
    { label: 'Academic Calendar', href: '/academics/academic-calendar' },
    { label: 'Course Structure', href: '/academics/course-structure' },
    { label: 'Ordinance', href: '/academics/ordinance' },
    { label: 'Syllabi', href: '/academics/syllabi' },
    { label: 'Fee Structure', href: '/academics/fee-structure' },
    { label: 'Time-Table', href: '/academics/time-table', active: true },
    { label: 'Holidays List', href: '/academics/holidays-list' },
    { label: 'NEP-2020', href: '/academics/nep-2020' },
  ];

  const processedHtml = processTimeTable(data.editor || '', DRUPAL_DOMAIN);

  return (
    <>
      <main className="min-h-screen bg-white pt-32 font-sans">
        
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
          <div className="container mx-auto px-4 relative z-10">
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
              {data.title || 'Academic Time-Table'}
            </h1>
          </div>
        </div>

        {/* --- MAIN SECTION --- */}
        <div className="max-w-7xl mx-auto px-4 pb-20 flex flex-col lg:flex-row gap-10">
          
          {/* Main Content (The Tables) */}
          <div className="w-full lg:w-[65%] order-2 lg:order-1">
            <div className="inner-content bg-[#f9f9f9] p-2 md:p-6 rounded-sm">
              <div className="flex flex-col items-center gap-10">
                {data.editor ? (
                  <article 
                    className="prose prose-lg max-w-none w-full
                      /* HEADER STYLING */
                      [&_thead_th]:bg-[#013a33] [&_thead_th]:text-white [&_thead_th]:p-4 [&_thead_th]:text-center [&_thead_th]:uppercase [&_thead_th]:font-bold [&_thead_th]:border-none
                      
                      /* ROW STYLING */
                      [&_td]:p-6 [&_td]:border [&_td]:border-gray-200 [&_td]:bg-white [&_td]:text-center [&_td]:align-middle
                      
                      /* LINK SPACING */
                      [&_br]:mb-2
                    "
                    dangerouslySetInnerHTML={{ __html: processedHtml }} 
                  />
                ) : (
                  <div className="py-20 text-center w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                    <p className="text-gray-400 italic">The time-table for the upcoming session is currently under preparation.</p>
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