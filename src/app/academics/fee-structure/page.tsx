// app/academics/fee-structure/page.tsx

import { getNodeByPath } from '@/lib/drupal/generated';
import { getDrupalDomain } from '@/lib/drupal/customFetch';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { parse } from 'node-html-parser';

interface FeeSection {
  title: string;
  links: { label: string; url: string }[];
}

/**
 * Parses the Drupal editor HTML to extract Fee Structure sections
 * Structure expected: <h2>Title</h2> <ul><li><a href="">Label</a></li></ul>
 */
function parseFeeStructure(html: string, domain: string): FeeSection[] {
  if (!html) return [];
  const root = parse(html);
  const sections: FeeSection[] = [];

  // Find all headings that define a fee category
  const headings = root.querySelectorAll('h1, h2, h3');

  headings.forEach((heading) => {
    const title = heading.text.trim();
    const links: { label: string; url: string }[] = [];

    // Look for the immediate next sibling that is a list
    let nextSibling = heading.nextElementSibling;
    
    // Sometimes there are empty p tags or text nodes in between
    while (nextSibling && nextSibling.tagName !== 'UL' && !['H1', 'H2', 'H3'].includes(nextSibling.tagName)) {
      nextSibling = nextSibling.nextElementSibling;
    }

    if (nextSibling && nextSibling.tagName === 'UL') {
      const listItems = nextSibling.querySelectorAll('li');
      listItems.forEach((li) => {
        const anchor = li.querySelector('a');
        if (anchor) {
          let href = anchor.getAttribute('href') || '#';
          if (href.startsWith('/')) href = `${domain}${href}`;
          
          links.push({
            label: anchor.text.trim(),
            url: href,
          });
        }
      });
    }

    if (title && links.length > 0) {
      sections.push({ title, links });
    }
  });

  return sections;
}

export default async function FeeStructurePage() {
  const DRUPAL_DOMAIN = getDrupalDomain();
  const { data, status } = await getNodeByPath('/academics/fee-structure');

  if (!data || status !== 200) {
    notFound();
  }

  const quickLinks = [
    { label: 'Academic Cell', href: '/academics/academic-cell' },
    { label: 'Academic Calendar', href: '/academics/academic-calendar' },
    { label: 'Course Structure', href: '/academics/course-structure' },
    { label: 'Ordinance', href: '/academics/ordinance' },
    { label: 'Syllabi', href: '/academics/syllabi' },
    { label: 'Fee Structure', href: '/academics/fee-structure', active: true },
    { label: 'Time-Table', href: '/academics/time-table' },
    { label: 'Holidays List', href: '/academics/holidays-list' },
    { label: 'NEP-2020', href: '/academics/nep-2020' },
  ];

  const feeSections = parseFeeStructure(data.editor || '', DRUPAL_DOMAIN);

  return (
    <>
      <main className="min-h-screen bg-white pt-32 font-sans">
        
        {/* --- PAGE HEADING --- */}
        <div 
          className="relative h-48 flex items-center mb-10 overflow-hidden"
          style={{ 
            backgroundImage: "url('/photo/heading.jpg')", 
            backgroundSize: 'cover', 
            backgroundPosition: 'center' 
          }}
        >
          <div className="absolute inset-0 bg-[#013a33]/60 backdrop-blur-[2px]"></div>
          <div className="container mx-auto px-4 relative z-10">
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
              {data.title || 'Fee Structure'}
            </h1>
          </div>
        </div>

        {/* --- CONTENT SECTION --- */}
        <div className="max-w-7xl mx-auto px-4 pb-20 flex flex-col lg:flex-row gap-10">
          
          {/* Main Content Areas (The Boxes) */}
          <div className="w-full lg:w-[65%] order-2 lg:order-1 flex flex-col gap-12">
            {feeSections.length > 0 ? (
              feeSections.map((section, idx) => (
                <div key={idx} className="flex flex-col gap-4">
                  <h2 className="text-2xl font-bold text-[#013a33] border-l-4 border-[#013a33] pl-4">
                    {section.title}
                  </h2>
                  
                  <div className="bg-[#f9f9f9] p-6 shadow-[5px_5px_10px_rgba(0,0,0,0.2)] rounded-sm border border-gray-100">
                    <ul className="space-y-4">
                      {section.links.map((link, lIdx) => (
                        <li key={lIdx} className="relative pl-10 group">
                          {/* Circle Arrow Pseudo-element */}
                          <span className="absolute left-0 top-1 text-[#013a33] text-xl leading-none transition-transform group-hover:translate-x-1">
                            ➤
                          </span>
                          <a 
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-800 font-bold text-lg hover:text-[#12876f] transition-colors leading-tight block"
                          >
                            {link.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400 italic">Fee structure documents are currently being updated for the upcoming session.</p>
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