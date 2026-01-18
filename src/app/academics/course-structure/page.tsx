// app/academics/course-structure/page.tsx

import { getNodeByPath, getChildNodes } from '@/lib/drupal/generated';
import { getDrupalDomain } from '@/lib/drupal/customFetch';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { parse } from 'node-html-parser';
import { FileText, ChevronRight } from 'lucide-react';

function extractLinksFromHtml(html: string, domain: string) {
  if (!html) return [];

  const root = parse(html);
  const links: { label: string; url: string }[] = [];

  for (const node of root.childNodes) {

    if (node.nodeType !== 1) continue; 

    const element = node as any;
    const textContent = element.text.trim().toLowerCase();

    const isHeading = /^H[1-6]$/.test(element.tagName);
    if (isHeading && textContent === 'syllabi') {
      break;
    }

    const anchors = element.querySelectorAll('a');
    
    anchors.forEach((a) => {
      let href = a.getAttribute('href') || '#';
      if (href.startsWith('/')) {
        href = `${domain}${href}`;
      }
      links.push({
        label: a.text.trim() || 'View Document',
        url: href,
      });
    });
  }

  return links;
}

export default async function CourseStructurePage() {
  const DRUPAL_DOMAIN = getDrupalDomain();

  const mainPage = await getNodeByPath('/academics/course-structure');

  const children = await getChildNodes('/academics/academic-forms', 'academic_course_forms');

  if (!mainPage.data || mainPage.status !== 200) {
    notFound();
  }

  const quickLinks = [
    { label: 'Academic Cell', href: '/academics/academic-cell' },
    { label: 'Academic Calendar', href: '/academics/academic-calendar' },
    { label: 'Course Structure', href: '/academics/course-structure', active: true },
    { label: 'Ordinances', href: '/academics/ordinances' },
    { label: 'Syllabi', href: '/academics/syllabi' },
    { label: 'Fee Structure', href: '/academics/fee-structure' },
    { label: 'Time-Table', href: '/academics/time-table' },
    { label: 'Holidays List', href: '/academics/holidays-list' },
    { label: 'NEP-2020', href: '/academics/nep-2020' },
  ];

  return (
    <>
      <main className="min-h-screen bg-[#F8FAFA] pt-32 pb-20 px-4 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
          
          {/* --- MAIN CONTENT AREA --- */}
          <div className="w-full lg:w-[65%] order-2 lg:order-1 flex flex-col gap-8">
            
            <div className="bg-white p-8 md:p-12 shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-xl border border-gray-100">
              <h1 className="text-3xl md:text-4xl font-black text-[#013a33] mb-4 uppercase tracking-tighter">
                {mainPage.data.title || 'Course Structure'}
              </h1>
              <p className="text-gray-500 font-medium mb-10 border-b pb-4">
                Detailed curriculum and credit structure for various academic programs.
              </p>

              {/* Dynamic Course Sections */}
              <div className="flex flex-col gap-10">
                {children.data.length > 0 ? (
                  children.data.map((course) => {
                    const links = extractLinksFromHtml(course.editor || '', DRUPAL_DOMAIN);
                    
                    if (links.length === 0) return null;

                    return (
                      <section key={course.id} className="group">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-2 h-8 bg-[#013a33] rounded-full group-hover:bg-[#00FFCC] transition-colors"></div>
                          <h2 className="text-2xl font-bold text-[#013a33] uppercase tracking-tight">
                            {course.title}
                          </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {links.map((link, idx) => (
                            <a
                              key={idx}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:border-[#013a33] hover:bg-white hover:shadow-md transition-all group/item"
                            >
                              <div className="flex items-center gap-3">
                                <FileText size={20} className="text-[#013a33] group-hover/item:scale-110 transition-transform" />
                                <span className="text-sm font-bold text-gray-700 group-hover/item:text-[#013a33]">
                                  {link.label}
                                </span>
                              </div>
                              <ChevronRight size={16} className="text-gray-300 group-hover/item:text-[#013a33] group-hover/item:translate-x-1 transition-all" />
                            </a>
                          ))}
                        </div>
                      </section>
                    );
                  })
                ) : (
                  <div className="py-20 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 italic">No course structure data found in child directories.</p>
                  </div>
                )}
              </div>
            </div>

            {/* General Instructions Note */}
            <div className="p-6 bg-[#013a33] rounded-xl text-white shadow-lg">
                <h4 className="font-black uppercase text-sm tracking-widest mb-2 text-[#00FFCC]">Note to Students</h4>
                <p className="text-sm leading-relaxed opacity-90">
                    The course structures are subject to periodic revision by the Senate. 
                    Please ensure you are viewing the structure applicable to your batch of admission.
                </p>
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