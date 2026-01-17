// facilities/campus/page.tsx

import { getNodeByPath } from '@/lib/drupal/generated';
import { getDrupalDomain } from '@/lib/drupal/customFetch';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { parse } from 'node-html-parser';
import Image from 'next/image';

interface FacilityCard {
  title: string;
  image: string;
  description: string;
}

/**
 * Parses the Drupal editor to reconstruct the card-based UI
 */
function parseCampusFacilities(html: string, domain: string) {
  if (!html) return { intro: '', cards: [] };
  const root = parse(html);

  // 1. Extract Intro Paragraphs (those before the "Additional Facilities" section)
  const paragraphs = root.querySelectorAll('p');
  const intro = paragraphs.slice(0, 2).map(p => p.toString()).join('');

  // 2. Extract specific cards from the <ul> list shown in the editor screenshot
  const cards: FacilityCard[] = [];
  const listItems = root.querySelectorAll('ul > li');

  listItems.forEach((li) => {
    // Look for a link/title (h4 or bold anchor)
    const titleElem = li.querySelector('h4, strong, a');
    const imgElem = li.querySelector('img');
    
    if (titleElem) {
      // Remove the title and image from the LI to get the clean description text
      const title = titleElem.text.trim();
      let imageUrl = imgElem?.getAttribute('src') || '';
      if (imageUrl.startsWith('/')) imageUrl = `${domain}${imageUrl}`;

      // Get description by removing title and image nodes
      titleElem.remove();
      imgElem?.remove();
      const description = li.text.trim();

      cards.push({ title, image: imageUrl, description });
    }
  });

  return { intro, cards };
}

export default async function CampusFacilitiesPage() {
  const DRUPAL_DOMAIN = getDrupalDomain();
  const { data, status } = await getNodeByPath('/facilities/campus');

  if (!data || status !== 200) {
    notFound();
  }

  const quickLinks = [
    { label: 'Central Library', href: '/facilities/central-library' },
    { label: 'Facilities at Campus', href: '/facilities/campus', active: true },
    { label: 'Games & Sports', href: '/facilities/games-sports' },
    { label: 'Hostel', href: '/facilities/hostel' },
    { label: 'Infrastructure', href: '/facilities/infrastructure' },
    { label: 'Training & Placement', href: '/facilities/training-placement' },
  ];

  const { intro, cards } = parseCampusFacilities(data.editor || '', DRUPAL_DOMAIN);

  return (
    <>
      <main className="min-h-screen bg-white pt-32 font-sans">
        
        {/* --- HERO SECTION --- */}
        <div 
          className="relative h-48 flex items-center mb-12 overflow-hidden"
          style={{ 
            backgroundImage: "url('/photo/inner-heading.jpg')", 
            backgroundSize: 'cover', 
            backgroundPosition: 'center' 
          }}
        >
          <div className="absolute inset-0 bg-[#013a33]/40 backdrop-blur-[2px]"></div>
          <div className="container mx-auto px-6 relative z-10">
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
              Facilities
            </h1>
          </div>
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="max-w-7xl mx-auto px-4 pb-24 flex flex-col lg:flex-row gap-12">
          
          <div className="w-full lg:w-[75%] order-2 lg:order-1">
            
            {/* 1. CAMPUS FACILITIES INTRO */}
            <section className="mb-16">
              <h2 className="text-3xl font-black text-[#013a33] mb-6 border-b-2 border-[#013a33] inline-block pb-1">
                Campus Facilities
              </h2>
              <div 
                className="text-lg text-gray-700 leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{ __html: intro }} 
              />

            </section>

            {/* 2. ADDITIONAL FACILITIES CARDS */}
            <section>
              <h2 className="text-3xl font-black text-[#013a33] mb-8 border-b-2 border-[#013a33] inline-block pb-1">
                Other additional facilities:
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {cards.length > 0 ? (
                  cards.map((card, idx) => (
                    <div 
                      key={idx} 
                      className="bg-[#013A33] rounded-2xl shadow-xl p-4 flex flex-col gap-4 transition-transform duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
                    >
                      <div className="relative h-56 w-full overflow-hidden rounded-xl">
                        <img 
                          src={card.image || '/photo/placeholder.jpg'} 
                          alt={card.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="px-2 pb-2">
                        <h4 className="text-white text-xl font-bold mb-3 underline underline-offset-4 decoration-[#00FFCC]">
                          {card.title}
                        </h4>
                        <p className="text-gray-200 text-sm leading-relaxed text-justify line-clamp-4">
                          {card.description}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 italic">Facility data is currently being synchronized...</p>
                )}
              </div>
            </section>
          </div>

          {/* --- SIDEBAR --- */}
            <Sidebar links={quickLinks} />
          
        </div>
      </main>

      <Footer />
    </>
  );
}