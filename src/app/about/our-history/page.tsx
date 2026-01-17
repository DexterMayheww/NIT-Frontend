// app/about/our-history/page.tsx

import { getNodeByPath } from '@/lib/drupal/generated';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';

interface HistoryRecord {
  name: string;
  term: string;
}

interface HistorySection {
  title: string;
  records: HistoryRecord[];
}

/**
 * Parses the Drupal field_editor HTML structure:
 * <h1>Section Title</h1>
 * <ol>
 *   <li>Name
 *     <ul><li>Term: ...</li></ul>
 *   </li>
 * </ol>
 */
function parseHistoryContent(html: string): HistorySection[] {
  if (typeof window !== 'undefined' || !html) return [];

  // Use a simple split and regex approach to parse the specific 
  // structure requested from the Drupal Editor
  const sections: HistorySection[] = [];
  const sectionParts = html.split(/<h1[^>]*>/i).filter(Boolean);

  sectionParts.forEach((part) => {
    const titleMatch = part.match(/^(.*?)<\/h1>/i);
    const title = titleMatch ? titleMatch[1].replace(/&nbsp;/g, ' ').trim() : 'Section';

    const records: HistoryRecord[] = [];
    // Match the list items in the ordered list
    const liMatches = part.match(/<li[^>]*>([\s\S]*?)<\/li>/gi);

    if (liMatches) {
      liMatches.forEach((liContent) => {
        // Only process the parent LIs (names), skip the nested ones (terms)
        // by checking if it contains the nested UL pattern
        if (liContent.toLowerCase().includes('<ul')) {
          // Extract Name: Text before the <ul>
          const namePart = liContent.match(/<li[^>]*>([\s\S]*?)<ul/i);
          const name = namePart ? namePart[1].replace(/<\/?[^>]+(>|$)/g, "").trim() : "";

          // Extract Term: Text inside the nested <li>
          const termPart = liContent.match(/<li[^>]*>Term:\s*([\s\S]*?)<\/li>/i);
          const term = termPart ? termPart[1].replace(/<\/?[^>]+(>|$)/g, "").trim() : "";

          if (name) records.push({ name, term });
        }
      });
    }

    if (records.length > 0) {
      sections.push({ title, records });
    }
  });

  return sections;
}

export default async function OurHistoryPage() {
  const { data, status } = await getNodeByPath('/about/our-history');

  if (!data || status !== 200) {
    notFound();
  }

  const quickLinks = [
    { label: 'About NIT', href: '/about/about-nit-manipur' },
    { label: 'Vision And Mission', href: '/about/vision-mission' },
    { label: 'Our History', href: '/about/our-history', active: true },
    { label: 'Key Documents', href: '/about/key-documents' },
    { label: "Institute newsletter 'reportage'", href: '/about/institute-newsletter' },
    { label: 'NIRF Data', href: '/about/nirf-data' },
  ];

  const historySections = parseHistoryContent(data.editor || '');
  console.log("History editor: ", data.editor);

  return (
    <>
      <main className="min-h-screen bg-white pt-32 pb-20 px-4 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
          
          {/* --- MAIN CONTENT: HISTORY CARDS --- */}
          <div className="w-full lg:w-[65%] order-2 lg:order-1">
            {historySections.length > 0 ? (
              historySections.map((section, sIdx) => (
                <section key={sIdx} className="mb-16">
                  {/* Section Title with Gradient */}
                  <div className="bg-gradient-to-r from-[#013a33] to-[#075c0e] text-white py-10 px-6 rounded-b-xl shadow-lg text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                      {section.title}
                    </h1>
                  </div>

                  {/* Grid of Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2">
                    {section.records.map((person, pIdx) => (
                      <div 
                        key={pIdx} 
                        className="bg-white rounded-xl overflow-hidden shadow-[0_5px_15px_rgba(0,0,0,0.08)] border border-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group"
                      >
                        {/* Name Header */}
                        <div className="bg-[#013a33] p-5 transition-colors group-hover:bg-[#002A28]">
                          <h3 className="text-white text-lg font-bold leading-tight">
                            {person.name}
                          </h3>
                        </div>
                        {/* Term Body */}
                        <div className="p-6">
                          <p className="text-gray-500 text-sm flex flex-col gap-1">
                            <span className="font-black text-[#333] uppercase text-[10px] tracking-widest">
                              Term Duration
                            </span>
                            <span className="text-base font-medium">
                              {person.term}
                            </span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400">Loading history data from institute archives...</p>
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