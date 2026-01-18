// app/academics/academic-cell/page.tsx

import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import Image from 'next/image';
import { Phone, Mail } from 'lucide-react';
import { getDrupalData } from '@/lib/drupal/getDrupalData';
import { getDrupalDomain } from '@/lib/drupal/customFetch';
import { parse } from 'node-html-parser';

export default async function AcademicCellPage() {
    const IMG_ONLY = 'field_images,field_images.field_media_image';
    const data = await getDrupalData('/academics/academic-cell', IMG_ONLY);
    const DRUPAL_DOMAIN = getDrupalDomain();

    if (!data) {
        notFound();
    }
    
  const quickLinks = [
    { label: 'Academic Cell', href: '/academics/academic-cell', active: true },
    { label: 'Academic Calendar', href: '/academics/academic-calendar' },
    { label: 'Course Structure', href: '/academics/course-structure' },
    { label: 'Ordinances', href: '/academics/ordinances' },
    { label: 'Syllabi', href: '/academics/syllabi' },
    { label: 'Fee Structure', href: '/academics/fee-structure' },
    { label: 'Time-Table', href: '/academics/time-table' },
    { label: 'Holidays List', href: '/academics/holidays-list' },
    { label: 'NEP-2020', href: '/academics/nep-2020' },
  ];

  const processHtml = (htmlString: string) => {
    if (!htmlString) return '';
    const root = parse(htmlString);

    root.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src');
      if (src?.startsWith('/sites')) {
        img.setAttribute('src', `${DRUPAL_DOMAIN}${src}`);
      }
    });

    root.querySelectorAll('a').forEach((a) => {
      const href = a.getAttribute('href');
      if (href?.startsWith('/sites')) {
        a.setAttribute('href', `${DRUPAL_DOMAIN}${href}`);
      }
    });

    return root.toString();
  };

  const processedHtml = processHtml(data.editor || '');

  const detailsLines = data.details?.split('\n').map(l => l.trim()).filter(Boolean) || [];
  const deanName = detailsLines[0] || 'Dean (Academic Affairs)';
  const deanPhone = detailsLines.find(l => l.toLowerCase().includes('phone'))?.replace(/phone:?/i, '').trim();
  const deanEmail = detailsLines.find(l => l.toLowerCase().includes('email'))?.replace(/email:?/i, '').trim();

  return (
    <>
      <main className="min-h-screen bg-white pt-32 pb-20 px-4 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
          
          {/* --- MAIN CONTENT AREA --- */}
          <div className="w-full lg:w-[65%] order-2 lg:order-1 flex flex-col gap-16">
            
            {/* 1. DEAN PROFILE CARD SECTION */}
            <div className="border border-gray-300 shadow-[5px_5px_10px_rgba(0,0,0,0.1)] overflow-hidden">
              <div className="bg-[#013a33] text-white py-3 px-6 text-center">
                <h2 className="text-2xl font-black uppercase tracking-widest">Dean</h2>
              </div>
              
              <div className="bg-[#f0f5f1] p-10 flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="bg-white p-1 shadow-md border border-gray-200">
                    <Image
                      src={data.images?.[0]?.url || '/photo/default-dean.jpg'}
                      alt={data.images?.[0]?.alt || 'Dean'}
                      width={200}
                      height={200}
                      className="object-cover h-[220px] w-auto"
                      unoptimized={process.env.NODE_ENV === 'development'}
                    />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-[#013a33] mb-4">
                  {deanName}
                </h3>

                <div className="flex flex-col gap-3">
                  {deanPhone && (
                    <div className="flex items-center justify-center gap-3 text-gray-700 font-medium">
                      <Phone size={18} className="text-[#013a33]" />
                      <span>{deanPhone}</span>
                    </div>
                  )}
                  {deanEmail && (
                    <div className="flex items-center justify-center gap-3 text-gray-700 font-medium">
                      <Mail size={18} className="text-[#013a33]" />
                      <span>{deanEmail}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. STAFF REGISTRY TABLE SECTION */}
            <div className="border border-gray-300 shadow-[5px_5px_10px_rgba(0,0,0,0.1)] p-3">
              <div className="bg-[#013a33] text-white py-2 px-6 text-center mb-4">
                <h3 className="text-xl font-bold">STAFF REGISTRY</h3>
              </div>

              <div className="overflow-x-auto">
                <article 
                  className="prose prose-sm max-w-none 
                    /* Standard Table Styles matching screenshot */
                    [&_table]:w-full [&_table]:border-collapse
                    [&_th]:bg-[#025248] [&_th]:text-white [&_th]:p-4 [&_th]:border-2 [&_th]:border-[#e3e6e4] [&_th]:text-left
                    [&_td]:p-4 [&_td]:border-2 [&_td]:border-[#e3e6e4] [&_td]:text-gray-800 [&_td]:bg-white
                    [&_thead]:border-none
                  "
                  dangerouslySetInnerHTML={{ __html: processedHtml }} 
                />
              </div>
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