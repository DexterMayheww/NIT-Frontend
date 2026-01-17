// app/academics/syllabi/page.tsx

import { getNodeByPath, getChildNodes } from '@/lib/drupal/generated';
import { getDrupalDomain } from '@/lib/drupal/customFetch';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { parse } from 'node-html-parser';

/**
 * Parses the HTML to extract only the section following a "Syllabi" header.
 * Ignores everything before it (like Course Structure).
 */
function extractSyllabiSection(html: string, domain: string) {
  if (!html) return null;
  const root = parse(html);
  
  // 1. Find the header that indicates the Syllabi section
  const headers = root.querySelectorAll('h1, h2, h3');
  const syllabiHeader = headers.find(h => h.text.toLowerCase().includes('syllabi'));

  if (!syllabiHeader) return null;

  // 2. Collect siblings following the header until the next major header or end of div
  const syllabiContent: string[] = [];
  let nextElem = syllabiHeader.nextElementSibling;

  while (nextElem && !['H1', 'H2', 'H3'].includes(nextElem.tagName)) {
    // Normalize links within this fragment
    nextElem.querySelectorAll('a').forEach(a => {
      const href = a.getAttribute('href');
      if (href && href.startsWith('/')) {
        a.setAttribute('href', `${domain}${href}`);
      }
      a.setAttribute('class', 'text-[#013a33] font-bold hover:underline');
    });

    syllabiContent.push(nextElem.toString());
    nextElem = nextElem.nextElementSibling;
  }

  return syllabiContent.join('');
}

export default async function SyllabiPage() {
  const DRUPAL_DOMAIN = getDrupalDomain();

  // 1. Fetch Main Page and Child nodes (BTech, MTech, etc.)
  const [mainPage, children] = await Promise.all([
    getNodeByPath('/academics/syllabi'),
    getChildNodes('/academics/academic-forms', 'academic_course_forms')
  ]);

  if (!mainPage.data || mainPage.status !== 200) {
    notFound();
  }

  const quickLinks = [
    { label: 'Academic Cell', href: '/academics/academic-cell' },
    { label: 'Academic Calendar', href: '/academics/academic-calendar' },
    { label: 'Course Structure', href: '/academics/course-structure' },
    { label: 'Ordinance', href: '/academics/ordinance' },
    { label: 'Syllabi', href: '/academics/syllabi', active: true },
    { label: 'Fee Structure', href: '/academics/fee-structure' },
    { label: 'Time-Table', href: '/academics/time-table' },
    { label: 'Holidays List', href: '/academics/holidays-list' },
    { label: 'NEP-2020', href: '/academics/nep-2020' },
  ];

  return (
    <>
      <main className="min-h-screen bg-white pt-32 pb-20 px-4 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
          
          {/* --- MAIN CONTENT AREA --- */}
          <div className="w-full lg:w-[65%] order-2 lg:order-1">
            <div className="bg-white p-6 md:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.04)] rounded-2xl border border-gray-100">
              
              <div className="mb-12">
                <h1 className="text-4xl font-black text-[#013a33] uppercase tracking-tighter mb-2">
                  Academic Syllabi
                </h1>
                <div className="w-20 h-1.5 bg-[#00FFCC] rounded-full"></div>
                <p className="mt-4 text-gray-500 font-medium italic">
                  Download the latest and archived syllabus copies for various departments.
                </p>
              </div>

              {/* Loop through each Academic Child (BTech, MTech, etc.) */}
              <div className="space-y-16">
                {children.data.length > 0 ? (
                  children.data.map((course) => {
                    const syllabiHtml = extractSyllabiSection(course.editor || '', DRUPAL_DOMAIN);

                    if (!syllabiHtml) return null;

                    return (
                      <section key={course.id} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center gap-4 mb-6">
                          <h2 className="text-2xl font-black text-[#013a33] bg-[#f0f9f8] px-6 py-2 rounded-lg border-l-4 border-[#013a33]">
                            {course.title}
                          </h2>
                        </div>

                        {/* Render the extracted Syllabi Table */}
                        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                          <article 
                            className="prose prose-lg max-w-none
                              [&_table]:w-full [&_table]:border-collapse [&_table]:m-0
                              [&_th]:bg-gray-100 [&_th]:text-[#013a33] [&_th]:p-4 [&_th]:border [&_th]:border-gray-200 [&_th]:text-center [&_th]:font-black [&_th]:uppercase [&_th]:text-sm
                              [&_td]:p-4 [&_td]:border [&_td]:border-gray-200 [&_td]:text-sm [&_td]:text-center [&_td]:bg-white
                              [&_tr:hover_td]:bg-[#f9fffe] [&_tr]:transition-colors
                            "
                            dangerouslySetInnerHTML={{ __html: syllabiHtml }} 
                          />
                        </div>
                      </section>
                    );
                  })
                ) : (
                  <div className="py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-400">Archiving departmental syllabi. Please check back shortly.</p>
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