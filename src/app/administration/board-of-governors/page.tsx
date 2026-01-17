// app/administration/board-of-governors/page.tsx

import { getNodeByPath } from '@/lib/drupal/generated';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { parse } from 'node-html-parser';

interface BoardSection {
  title: string;
  tableHtml: string;
}

/**
 * Parses the Drupal editor HTML to identify sections.
 * Each section is expected to start with a Heading followed by a Table.
 */
function parseBoardContent(html: string): BoardSection[] {
  if (!html) return [];
  const root = parse(html);
  const sections: BoardSection[] = [];

  // Find all major headings
  const headings = root.querySelectorAll('h1, h2, h3, h4, h5');

  headings.forEach((heading) => {
    const title = heading.text.trim();
    
    // Find the next table after this heading
    let nextElem = heading.nextElementSibling;
    while (nextElem && nextElem.tagName !== 'TABLE' && !['H1', 'H2', 'H3', 'H4', 'H5'].includes(nextElem.tagName)) {
      nextElem = nextElem.nextElementSibling;
    }

    if (nextElem && nextElem.tagName === 'TABLE') {
      sections.push({
        title,
        tableHtml: nextElem.toString(),
      });
    }
  });

  return sections;
}

export default async function BoardOfGovernorsPage() {
  const { data, status } = await getNodeByPath('/administration/board-of-governors');

  if (!data || status !== 200) {
    notFound();
  }

  const sections = parseBoardContent(data.editor || '');

  const quickLinks = [
    { label: 'Director', href: '/administration/director' },
    { label: 'Registrar', href: '/administration/registrar' },
    { label: 'Board of Governors', href: '/administration/board-of-governors', active: true },
    { label: 'Building and Works Committee', href: '/administration/building-works-committee' },
    { label: 'Finance Committee', href: '/administration/finance-committee' },
    { label: 'NIT Council', href: '/administration/nit-council' },
    { label: 'Senate', href: '/administration/senate' },
    { label: 'Department Heads', href: '/administration/head-of-department' },
    { label: 'Dean', href: '/administration/dean' },
    { label: 'NIT Administration', href: '/administration/nit-administration' },
    { label: 'Organisation Chart', href: '/administration/organisation-chart' },
    { label: 'Officers', href: '/administration/officers' },
    { label: 'Grant-in-aid received from MoE', href: '/administration/moe-grants' },
  ];

  return (
    <>
      <main className="min-h-screen bg-white pt-32 pb-20 px-4 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
          
          {/* --- MAIN CONTENT: BOG TABLES --- */}
          <div className="w-full lg:w-[65%] order-2 lg:order-1 flex flex-col gap-10">
            {sections.length > 0 ? (
              sections.map((section, idx) => (
                <section 
                  key={idx} 
                  className="w-full border border-gray-400 p-3 shadow-[5px_5px_10px_gray] bg-white"
                >
                  {/* Section Title Bar */}
                  <div className="bg-[#013a33] text-white p-3 mb-4">
                    <h3 className="text-lg md:text-xl font-bold text-left m-0">
                      {section.title}
                    </h3>
                  </div>

                  {/* Table Content */}
                  <div className="overflow-x-auto">
                    <article 
                      className="prose prose-sm md:prose-base max-w-none
                        [&_table]:w-full [&_table]:border-collapse
                        /* Table Header Style */
                        [&_thead_th]:bg-[#025248] [&_thead_th]:text-white [&_thead_th]:border-2 [&_thead_th]:border-[#e8ebea] [&_thead_th]:p-3 [&_thead_th]:text-left [&_thead_th]:font-bold
                        /* Table Body Style */
                        [&_tbody_td]:border-2 [&_tbody_td]:border-[#e8ebea] [&_tbody_td]:p-3 [&_tbody_td]:text-gray-800
                        /* Links within table */
                        [&_a]:text-black [&_a]:no-underline [&_a:hover]:underline
                      "
                      dangerouslySetInnerHTML={{ __html: section.tableHtml }} 
                    />
                  </div>
                </section>
              ))
            ) : (
              /* Fallback if no sections are found */
              <div className="py-20 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                <p className="text-gray-400 italic">
                  Information regarding the Board of Governors is currently being updated.
                </p>
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