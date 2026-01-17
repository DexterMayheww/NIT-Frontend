// app/administration/nit-administration/page.tsx

import { getNodeByPath } from '@/lib/drupal/generated';
import { getDrupalDomain } from '@/lib/drupal/customFetch';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { parse } from 'node-html-parser';

interface AdminSection {
  title: string;
  tableHtml: string;
}

/**
 * Parses the field_editor to group <h2> titles with their subsequent <table>.
 */
function parseAdminDirectory(html: string, domain: string): AdminSection[] {
  if (!html) return [];
  const root = parse(html);
  const sections: AdminSection[] = [];

  // Find all section headers
  const headers = root.querySelectorAll('h1, h2, h3');

  headers.forEach((header) => {
    const title = header.text.trim();
    
    // Look for the next table sibling
    let nextElem = header.nextElementSibling;
    while (nextElem && nextElem.tagName !== 'TABLE' && !['H1', 'H2', 'H3'].includes(nextElem.tagName)) {
      nextElem = nextElem.nextElementSibling;
    }

    if (nextElem && nextElem.tagName === 'TABLE') {
      // Normalize links inside the table
      nextElem.querySelectorAll('a').forEach((a) => {
        const href = a.getAttribute('href');
        if (href && href.startsWith('/')) {
          a.setAttribute('href', `${domain}${href}`);
        }
      });
      
      sections.push({
        title,
        tableHtml: nextElem.toString()
      });
    }
  });

  return sections;
}

export default async function NitAdministrationPage() {
  const DRUPAL_DOMAIN = getDrupalDomain();
  const { data, status } = await getNodeByPath('/administration/nit-administration');

  if (!data || status !== 200) {
    notFound();
  }

  const quickLinks = [
    { label: 'Director', href: '/administration/director' },
    { label: 'Registrar', href: '/administration/registrar' },
    { label: 'Board of Governors', href: '/administration/board-of-governors' },
    { label: 'Building and Works Committee', href: '/administration/building-works-committee' },
    { label: 'Finance Committee', href: '/administration/finance-committee' },
    { label: 'Senate', href: '/administration/senate' },
    { label: 'NIT Council', href: '/administration/nit-council' },
    { label: 'Department Heads', href: '/administration/head-of-department' },
    { label: 'Dean', href: '/administration/dean' },
    { label: 'NIT Administration', href: '/administration/nit-administration', active: true },
    { label: 'Organisation Chart', href: '/administration/organisation-chart' },
    { label: 'Officers', href: '/administration/officers' },
    { label: 'Grant-in-aid received from MoE', href: '/administration/moe-grants' },
  ];

  const adminSections = parseAdminDirectory(data.editor || '', DRUPAL_DOMAIN);

  return (
    <>
      <main className="min-h-screen bg-white pt-32 pb-20 px-4 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
          
          {/* --- MAIN CONTENT: ADMIN SECTIONS --- */}
          <div className="w-full lg:w-[65%] order-2 lg:order-1 flex flex-col gap-10">
            {adminSections.length > 0 ? (
              adminSections.map((section, idx) => (
                <div key={idx} className="inner-content bg-white border border-gray-300 shadow-[5px_5px_10px_gray] p-3 md:p-4">
                  {/* Section Title Bar */}
                  <div className="bg-[#013A33] text-white py-2 px-4 mb-3 rounded-sm">
                    <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tight m-0">
                      {section.title}
                    </h2>
                  </div>

                  {/* Table Wrapper */}
                  <div className="overflow-x-auto">
                    <article 
                      className="prose prose-sm max-w-none
                        /* TABLE CORE STYLE */
                        [&_table]:w-full [&_table]:border-collapse
                        
                        /* THEAD STYLE (#025248) */
                        [&_thead_th]:bg-[#025248] [&_thead_th]:text-white [&_thead_th]:p-3 [&_thead_th]:border-2 [&_thead_th]:border-[#e8ebea] [&_thead_th]:text-left [&_thead_th]:font-bold [&_thead_th]:text-xs [&_thead_th]:uppercase
                        
                        /* TBODY STYLE */
                        [&_td]:p-3 [&_td]:border-2 [&_td]:border-[#e8ebea] [&_td]:text-gray-800 [&_td]:text-md [&_td]:bg-white
                        
                        /* LINKS */
                        [&_a]:text-[#013A33] [&_a]:font-bold [&_a]:no-underline [&_a:hover]:underline
                      "
                      dangerouslySetInnerHTML={{ __html: section.tableHtml }} 
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                <p className="text-gray-400 italic">NIT Administration hierarchy is being synchronized with the registry...</p>
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