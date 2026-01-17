// app/administration/director/page.tsx

import { getNodeByPath } from '@/lib/drupal/generated';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import Image from 'next/image';
import { parse } from 'node-html-parser';
import { Phone, Printer, Mail } from 'lucide-react';
import { getDrupalData } from '@/lib/drupal/getDrupalData';

interface DirectorData {
  phone?: string;
  fax?: string;
  email?: string;
  bioHtml: string;
}

/**
 * Parses the field_editor to extract contact info lines 
 * and separates them from the main bio text.
 */
function parseDirectorContent(html: string): DirectorData {
  if (!html) return { bioHtml: '' };
  const root = parse(html);
  const data: DirectorData = { bioHtml: '' };

  const paragraphs = root.querySelectorAll('p');
  
  paragraphs.forEach((p) => {
    const text = p.text.toLowerCase();
    let identified = false;

    if (text.includes('phone:')) {
      data.phone = p.text.replace(/phone:?/i, '').trim();
      identified = true;
    } else if (text.includes('fax:')) {
      data.fax = p.text.replace(/fax:?/i, '').trim();
      identified = true;
    } else if (text.includes('email:')) {
      data.email = p.text.replace(/email:?/i, '').trim();
      identified = true;
    }

    // If it was a contact line, remove it from the main flow
    if (identified) {
      p.remove();
    }
  });

  data.bioHtml = root.toString();
  return data;
}

export default async function DirectorPage() {
    const IMG_ONLY = 'field_images,field_images.field_media_image';

    const data = await getDrupalData('/administration/director', IMG_ONLY);

    if (!data) {
        notFound();
    }

  const parsedContent = parseDirectorContent(data.editor || '');

  const quickLinks = [
    { label: 'Director', href: '/administration/director', active: true },
    { label: 'Registrar', href: '/administration/registrar' },
    { label: 'Board of Governors', href: '/administration/board-of-governors' },
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
          
          {/* --- MAIN CONTENT AREA --- */}
          <div className="w-full lg:w-[65%] order-2 lg:order-1">
            <div className="bg-[#f9f9f9] shadow-[5px_5px_10px_gray] rounded-sm overflow-hidden border border-gray-100">
              
              {/* Profile Top Section */}
              <div className="p-6 md:p-10 flex flex-col md:flex-row items-center gap-10 border-b border-gray-200">
                {/* Director Photo */}
                <div className="w-full md:w-1/3">
                  <div className="relative group">
                    <Image
                      src={data.images?.[0]?.url || '/photo/director.jpg'}
                      alt={data.images?.[0]?.alt || data.title}
                      width={300}
                      height={400}
                      className="w-full h-auto rounded-sm border border-gray-300 p-1 bg-white shadow-[-5px_5px_10px_gray] transition-transform duration-500 group-hover:scale-[1.02]"
                      priority
                      unoptimized={process.env.NODE_ENV === 'development'}
                    />
                  </div>
                </div>

                {/* Director Identity & Contact */}
                <div className="w-full md:w-2/3 text-center md:text-left">
                  <h1 className="text-3xl font-black text-[#013A33] uppercase tracking-tight mb-1">
                    {data.title || 'Prof. D V L N Somayajulu'}
                  </h1>
                  <p className="text-sm font-black text-[#013A33] opacity-80 mb-6 tracking-[0.2em] uppercase">
                    Director, NIT Manipur
                  </p>

                  <div className="space-y-3">
                    {parsedContent.phone && (
                      <div className="flex items-center justify-center md:justify-start gap-3 text-[#013A33] font-medium">
                        <Phone size={18} className="text-[#013A33]" />
                        <span>{parsedContent.phone}</span>
                      </div>
                    )}
                    {parsedContent.fax && (
                      <div className="flex items-center justify-center md:justify-start gap-3 text-[#013A33] font-medium">
                        <Printer size={18} className="text-[#013A33]" />
                        <span>{parsedContent.fax}</span>
                      </div>
                    )}
                    {parsedContent.email && (
                      <div className="flex items-center justify-center md:justify-start gap-3 text-[#013A33] font-medium">
                        <Mail size={18} className="text-[#013A33]" />
                        <a href={`mailto:${parsedContent.email}`} className="hover:underline">{parsedContent.email}</a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Biography / Body Section */}
              <div className="p-8 md:p-12">
                <article 
                  className="prose prose-lg max-w-none text-gray-800 leading-relaxed
                    [&_p]:mb-6 [&_p]:text-justify
                    [&_strong]:text-[#013A33] [&_strong]:font-black
                  "
                  dangerouslySetInnerHTML={{ __html: parsedContent.bioHtml }} 
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