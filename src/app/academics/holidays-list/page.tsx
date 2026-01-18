// app/academics/holidays-list/page.tsx

import { getNodeByPath } from '@/lib/drupal/generated';
import { getDrupalDomain } from '@/lib/drupal/customFetch';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { parse } from 'node-html-parser';

function extractHolidayLinks(html: string, domain: string) {
  if (!html) return [];
  const root = parse(html);
  const links = root.querySelectorAll('a');

  return links.map((a) => {
    let href = a.getAttribute('href') || '#';
    if (href.startsWith('/')) {
      href = `${domain}${href}`;
    }
    return {
      label: a.text.trim() || 'View Holiday List',
      url: href,
    };
  });
}

export default async function HolidaysListPage() {
  const DRUPAL_DOMAIN = getDrupalDomain();
  const { data, status } = await getNodeByPath('/academics/holidays-list');

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
    { label: 'Time-Table', href: '/academics/time-table' },
    { label: 'Holidays List', href: '/academics/holidays-list', active: true },
    { label: 'NEP-2020', href: '/academics/nep-2020' },
  ];

  const holidayLinks = extractHolidayLinks(data.editor || '', DRUPAL_DOMAIN);

  return (
    <>
      <main className="min-h-screen bg-white pt-32 pb-20 px-4 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
          
          {/* --- MAIN CONTENT AREA --- */}
          <div className="w-full lg:w-[65%] order-2 lg:order-1">
            <div className="bg-[#f9f9f9] p-8 md:p-12 shadow-[5px_5px_15px_rgba(0,0,0,0.1)] rounded-sm border border-gray-100">
              
              <h1 className="text-4xl font-black text-[#013a33] mb-8 border-b-2 border-gray-200 pb-4 uppercase tracking-tighter">
                {data.title || 'Holiday Lists'}
              </h1>

              <div className="flex flex-col gap-6">
                {holidayLinks.length > 0 ? (
                  <ul className="space-y-4">
                    {holidayLinks.map((link, idx) => (
                      <li key={idx} className="relative pl-12 py-2 group">
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[#013a33] text-2xl leading-none transition-transform group-hover:translate-x-1">
                          ➤
                        </span>
                        
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#013a33] text-xl font-bold underline underline-offset-4 decoration-transparent hover:decoration-[#013a33] hover:text-[#005a4e] transition-all"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="py-20 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                    <p className="text-gray-400 italic">Holiday schedules are being reviewed for the upcoming calendar year.</p>
                  </div>
                )}
              </div>

              {/* Legal/Context Note */}
              <div className="mt-12 p-6 bg-white border border-gray-100 rounded-xl shadow-inner">
                <p className="text-xs text-gray-500 italic leading-relaxed">
                  Note: The lists above contain restricted and public holidays as observed by NIT Manipur. 
                  Dates are subject to change based on Central Government notifications and Lunar visibility.
                </p>
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