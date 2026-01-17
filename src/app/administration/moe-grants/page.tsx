// app/administration/moe-grants/page.tsx

import { getNodeByPath } from '@/lib/drupal/generated';
import { getDrupalDomain } from '@/lib/drupal/customFetch';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { parse } from 'node-html-parser';

/**
 * Normalizes the Grants Table HTML from Drupal.
 * - Ensures headers are visible against dark background.
 * - Fixes relative links to media or MoE documents.
 */
function processGrantsTable(html: string, domain: string) {
  if (!html) return '';
  const root = parse(html);

  // Normalize links
  root.querySelectorAll('a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href && href.startsWith('/')) {
      a.setAttribute('href', `${domain}${href}`);
    }
    a.setAttribute('class', 'text-[#013a33] font-bold hover:underline');
  });

  return root.toString();
}

export default async function MoeGrantsPage() {
  const DRUPAL_DOMAIN = getDrupalDomain();
  const { data, status } = await getNodeByPath('/administration/moe-grants');

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
    { label: 'NIT Administration', href: '/administration/nit-administration' },
    { label: 'Organisation Chart', href: '/administration/organisation-chart' },
    { label: 'Officers', href: '/administration/officers' },
    { label: 'Grant-in-aid received from MoE', href: '/administration/moe-grants', active: true },
  ];

  const sanitizedHtml = processGrantsTable(data.editor || '', DRUPAL_DOMAIN);

  return (
    <>
      <main className="min-h-screen bg-white pt-32 pb-20 px-4 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
          
          {/* --- MAIN CONTENT: GRANTS TABLE --- */}
          <div className="w-full lg:w-[65%] order-2 lg:order-1">
            <div className="bg-white shadow-[5px_5px_10px_gray] rounded-sm overflow-hidden border border-gray-100">
              
              <div className="overflow-x-auto">
                <article 
                  className="prose prose-lg max-w-none
                    /* TABLE CORE STYLES */
                    [&_table]:w-full [&_table]:border-collapse [&_table]:m-0
                    
                    /* THEAD / HEADER STYLES (#013a33) */
                    [&_thead_th]:bg-[#013a33] [&_thead_th]:!text-white [&_thead_th]:p-4 [&_thead_th]:text-left [&_thead_th]:font-bold [&_thead_th]:border-none [&_thead_th]:text-sm [&_thead_th]:uppercase
                    
                    /* TBODY / ZEBRA STYLES (#f0eceb for odd rows) */
                    [&_tbody_td]:p-4 [&_tbody_td]:border [&_tbody_td]:border-gray-100 [&_tbody_td]:text-gray-800 [&_tbody_td]:text-sm
                    [&_tbody_tr:nth-child(odd)_td]:bg-[#f0eceb]
                    
                    /* HOVER INTERACTION (#d4d2d2) */
                    [&_tbody_tr:hover_td]:bg-[#d4d2d2] [&_tbody_tr]:transition-colors
                    
                    /* TEXT FORMATTING */
                    [&_h2]:text-[#013a33] [&_h2]:p-6 [&_h2]:m-0 [&_h2]:font-black [&_h2]:border-b
                    [&_strong]:text-[#013a33]
                  "
                  dangerouslySetInnerHTML={{ __html: sanitizedHtml }} 
                />
              </div>

            </div>

            {/* Institutional Context Note */}
            <div className="mt-8 p-6 bg-[#f9f9f9] border-l-4 border-[#013a33] rounded-r-lg">
                <p className="text-sm text-gray-600 italic leading-relaxed">
                    Note: The financial data above represents the Grants-in-Aid received from the Ministry of Education (MoE), Government of India, 
                    categorized under General (OH-31), Salary (OH-36), and Capital Assets (OH-35). 
                    All figures are in Crores of Indian Rupees.
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