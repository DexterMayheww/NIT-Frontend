// facilities/central-library/page.tsx

import { getNodeByPath } from '@/lib/drupal/generated';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';

export default async function CentralLibraryPage() {
  // Fetch data from Drupal using the specific facility path
  const { data, status } = await getNodeByPath('/facilities/central-library');

  if (!data || status !== 200) {
    notFound();
  }

  const quickLinks = [
    { label: 'Central Library', href: '/facilities/central-library', active: true },
    { label: 'Facilities at Campus', href: '/facilities/campus' },
    { label: 'Games & Sports', href: '/facilities/games-sports' },
    { label: 'Hostel', href: '/facilities/hostel' },
    { label: 'Infrastructure', href: '/facilities/infrastructure' },
    { label: 'Training & Placement', href: '/facilities/training-placement' },
  ];

  return (
    <>
      <main className="min-h-screen bg-white pt-32 font-sans">
        
        {/* --- INSTITUTIONAL HEADING SECTION --- */}
        <div 
          className="relative h-48 flex items-center mb-10 overflow-hidden"
          style={{ 
            backgroundImage: "url('/photo/heading.jpg')", 
            backgroundSize: 'cover', 
            backgroundPosition: 'center' 
          }}
        >
          <div className="absolute inset-0 bg-[#013a33]/60 backdrop-blur-[1px]"></div>
          <div className="container mx-auto px-4 relative z-10">
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
              Department of Library
            </h1>
          </div>
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="max-w-7xl mx-auto px-4 pb-20 flex flex-col lg:flex-row gap-10">
          
          <div className="w-full lg:w-[65%] order-2 lg:order-1">
            <div className="bg-[#f9f9f9] p-8 md:p-12 shadow-[-5px_5px_10px_gray] rounded-xl border border-gray-100">
              
              {/* Content processed via field_editor */}
              <article 
                className="prose prose-lg max-w-none text-gray-800 leading-relaxed
                  [&_h2]:text-[#013a33] [&_h2]:font-black [&_h2]:border-b-2 [&_h2]:border-[#013a33] [&_h2]:pb-2 [&_h2]:mb-8 [&_h2]:text-center
                  [&_h3]:text-[#013a33] [&_h3]:underline [&_h3]:text-center [&_h3]:mb-6
                  
                  /* Strong text coloring */
                  [&_strong]:text-[#013a33] [&_strong]:font-black
                  
                  /* Link styling for map links/directions */
                  [&_a]:text-[#013a33] [&_a]:no-underline [&_a:hover]:text-green-700 [&_a:hover]:underline
                  
                  /* Paragraph spacing */
                  [&_p]:mb-6
                "
                dangerouslySetInnerHTML={{ __html: data.editor || '' }} 
              />

              {/* Institutional Note if content is missing */}
              {!data.editor && (
                <div className="py-20 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl">
                  <p className="text-gray-400 italic">Library resource information is being updated...</p>
                </div>
              )}
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