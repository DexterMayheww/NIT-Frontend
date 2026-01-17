// administration/finance-committee/page.tsx

import { getNodeByPath } from '@/lib/drupal/generated';
import { getDrupalDomain } from '@/lib/drupal/customFetch';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { parse } from 'node-html-parser';

/**
 * Sanitizes and normalizes the Finance Committee table.
 * Prepends Drupal domain to internal links and applies 
 * specific institutional hover classes.
 */
function processFinanceTable(html: string, domain: string) {
  if (!html) return '';
  const root = parse(html);

  // Normalize links
  root.querySelectorAll('a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href && href.startsWith('/')) {
      a.setAttribute('href', `${domain}${href}`);
    }
    a.setAttribute('class', 'text-[#013a33] font-bold hover:underline transition-colors');
  });

  return root.toString();
}

export default async function FinanceCommitteePage() {
  const DRUPAL_DOMAIN = getDrupalDomain();
  const { data, status } = await getNodeByPath('/administration/finance-committee');

  if (!data || status !== 200) {
    notFound();
  }

  const quickLinks = [
    { label: 'Director', href: '/administration/director' },
    { label: 'Registrar', href: '/administration/registrar' },
    { label: 'Board of Governors', href: '/administration/board-of-governors' },
    { label: 'Building and Works Committee', href: '/administration/building-works-committee' },
    { label: 'Finance Committee', href: '/administration/finance-committee', active: true },
    { label: 'NIT Council', href: '/administration/nit-council' },
    { label: 'Senate', href: '/administration/senate' },
    { label: 'Department Heads', href: '/administration/head-of-department' },
    { label: 'Dean', href: '/administration/dean' },
    { label: 'NIT Administration', href: '/administration/nit-administration' },
    { label: 'Organisation Chart', href: '/administration/organisation-chart' },
    { label: 'Officers', href: '/administration/officers' },
    { label: 'Grant-in-aid received from MoE', href: '/administration/moe-grants' },
  ];

  const sanitizedHtml = processFinanceTable(data.editor || '', DRUPAL_DOMAIN);

  return (
    <>
      <main className="min-h-screen bg-white pt-32 pb-20 px-4 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
          
          {/* --- MAIN CONTENT AREA: FINANCE TABLE --- */}
          <div className="w-full lg:w-[65%] order-2 lg:order-1">
            <div className="bg-white shadow-[5px_5px_10px_gray] rounded-sm overflow-hidden border border-gray-100">
              
              <div className="overflow-x-auto">
                <article 
                  className="prose prose-lg max-w-none
                    /* TABLE CORE */
                    [&_table]:w-full [&_table]:border-collapse [&_table]:m-0
                    
                    /* THEAD / HEADER STYLES (#013a33) */
                    [&_thead_th]:bg-[#013a33] [&_thead_th]:text-white [&_thead_th]:p-5 [&_thead_th]:text-left [&_thead_th]:font-bold [&_thead_th]:border-none
                    
                    /* TBODY / ZEBRA STYLES (#f0eceb for odd rows) */
                    [&_tbody_td]:p-5 [&_tbody_td]:border [&_tbody_td]:border-gray-200 [&_tbody_td]:text-gray-800 [&_tbody_td]:text-sm
                    [&_tbody_tr:nth-child(odd)_td]:bg-[#f0eceb]
                    
                    /* HOVER INTERACTION (#d4d2d2) */
                    [&_tbody_tr:hover_td]:bg-[#d4d2d2] [&_tbody_tr]:cursor-pointer [&_tbody_tr]:transition-all [&_tbody_tr:hover]:shadow-[0_4px_15px_rgba(39,174,96,0.4)]
                    
                    /* FONT OVERRIDES */
                    [&_b]:text-[#013a33] [&_b]:font-black
                  "
                  dangerouslySetInnerHTML={{ __html: sanitizedHtml }} 
                />
              </div>

            </div>

            {/* Empty state context */}
            {!data.editor && (
              <div className="py-20 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                <p className="text-gray-400 italic">Financial governance details are being updated by the administration.</p>
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