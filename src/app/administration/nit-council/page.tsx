// administration/nit-council/page.tsx

import { getNodeByPath } from '@/lib/drupal/generated';
import { getDrupalDomain } from '@/lib/drupal/customFetch';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { parse } from 'node-html-parser';

/**
 * Normalizes the NIT Council HTML from Drupal RTE.
 * Ensures the table structure matches the institutional shadow-box style
 * and prefixes relative media/document links.
 */
function processCouncilContent(html: string, domain: string) {
  if (!html) return '';
  const root = parse(html);

  // Normalize links (if any)
  root.querySelectorAll('a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href && href.startsWith('/')) {
      a.setAttribute('href', `${domain}${href}`);
    }
  });

  return root.toString();
}

export default async function NitCouncilPage() {
  const DRUPAL_DOMAIN = getDrupalDomain();
  const { data, status } = await getNodeByPath('/administration/nit-council');

  if (!data || status !== 200) {
    notFound();
  }

  const quickLinks = [
    { label: 'Director', href: '/administration/director' },
    { label: 'Registrar', href: '/administration/registrar' },
    { label: 'Board of Governors', href: '/administration/board-of-governors' },
    { label: 'Building and Works Committee', href: '/administration/building-works-committee' },
    { label: 'Finance Committee', href: '/administration/finance-committee' },
    { label: 'NIT Council', href: '/administration/nit-council', active: true },
    { label: 'Senate', href: '/administration/senate' },
    { label: 'Department Heads', href: '/administration/head-of-department' },
    { label: 'Dean', href: '/administration/dean' },
    { label: 'NIT Administration', href: '/administration/nit-administration' },
    { label: 'Organisation Chart', href: '/administration/organisation-chart' },
    { label: 'Officers', href: '/administration/officers' },
    { label: 'Grant-in-aid received from MoE', href: '/administration/moe-grants' },
  ];

  const processedHtml = processCouncilContent(data.editor || '', DRUPAL_DOMAIN);

  return (
    <>
      <main className="min-h-screen bg-white pt-32 pb-20 px-4 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
          
          {/* --- MAIN CONTENT: COUNCIL TABLE --- */}
          <div className="w-full lg:w-[65%] order-2 lg:order-1">
            <div className="flex flex-col gap-6">
              
              {/* Dynamic Content from Editor */}
              <div className="inner-content">
                <article 
                  className="prose prose-lg max-w-none text-gray-800
                    /* INTRO PARAGRAPH STYLE */
                    [&_p]:text-center [&_p]:text-lg [&_p]:mb-8 [&_p]:leading-relaxed
                    
                    /* TABLE CONTAINER (Shadow Box) */
                    [&_table]:w-full [&_table]:border-collapse [&_table]:shadow-[5px_5px_10px_gray] [&_table]:border [&_table]:border-gray-200
                    
                    /* THEAD / HEADER STYLES (#013a33) */
                    [&_th]:bg-[#013a33] [&_th]:text-white [&_th]:p-4 [&_th]:text-center [&_th]:text-2xl [&_th]:font-black [&_th]:uppercase [&_th]:border-none
                    
                    /* TBODY / ZEBRA STYLES (#f0eceb for odd) */
                    [&_td]:p-4 [&_td]:border [&_td]:border-gray-200 [&_td]:text-sm
                    [&_tbody_tr:nth-child(odd)_td]:bg-[#f0eceb]
                    
                    /* HOVER EFFECT (#d4d2d2) */
                    [&_tbody_tr:hover_td]:bg-[#d4d2d2] [&_tbody_tr]:transition-colors [&_tbody_tr]:cursor-pointer
                  "
                  dangerouslySetInnerHTML={{ __html: processedHtml }} 
                />
              </div>

            </div>

            {/* Fallback context */}
            {!data.editor && (
              <div className="py-20 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                <p className="text-gray-400 italic">NIT Council information is currently being synchronized with MoE records.</p>
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