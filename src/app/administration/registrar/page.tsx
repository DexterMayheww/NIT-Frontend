// app/administration/registrar/page.tsx

import { getNodeByPath } from '@/lib/drupal/generated';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import Image from 'next/image';
import { parse } from 'node-html-parser';
import { Phone, Printer, Mail } from 'lucide-react';
import { getDrupalData } from '@/lib/drupal/getDrupalData';

interface RegistrarProfile {
  name: string;
  phone?: string;
  fax?: string;
  email?: string;
}

/**
 * Parses the Registrar field_editor to extract contact details.
 * Structure: <h2>REGISTRAR</h2> <p>Name</p> <p>Phone: ...</p> etc.
 */
function parseRegistrarContent(html: string): RegistrarProfile {
  const profile: RegistrarProfile = { name: 'Registrar' };
  if (!html) return profile;

  const root = parse(html);
  const paragraphs = root.querySelectorAll('p, div');
  
  // The first paragraph (after the H2) is usually the Name
  // We filter out the "REGISTRAR" header text if it appears in a P tag
  const contentLines = paragraphs
    .map(p => p.text.trim())
    .filter(t => t.length > 0 && t.toUpperCase() !== 'REGISTRAR');

  if (contentLines.length > 0) {
    // Basic heuristic mapping
    profile.name = contentLines[0];
    
    contentLines.forEach(line => {
      const lower = line.toLowerCase();
      if (lower.includes('phone:')) profile.phone = line.replace(/phone:?/i, '').trim();
      else if (lower.includes('fax:')) profile.fax = line.replace(/fax:?/i, '').trim();
      else if (lower.includes('email:')) profile.email = line.replace(/email:?/i, '').trim();
    });
  }

  return profile;
}

export default async function RegistrarPage() {
    const IMG_ONLY = 'field_images,field_images.field_media_image';

    const data = await getDrupalData('/administration/registrar', IMG_ONLY);

    if (!data) {
        notFound();
    }

  const profile = parseRegistrarContent(data.editor || '');

  const quickLinks = [
    { label: 'Director', href: '/administration/director' },
    { label: 'Registrar', href: '/administration/registrar', active: true },
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
          
          {/* --- MAIN CONTENT: REGISTRAR CARD --- */}
          <div className="w-full lg:w-[65%] order-2 lg:order-1 flex justify-center items-start">
            <div className="w-full bg-[#f9f9f9] shadow-[5px_5px_15px_gray] rounded-sm overflow-hidden border border-gray-100 transition-all duration-500 hover:shadow-[8px_8px_20px_rgba(0,0,0,0.2)]">
              
              <div className="flex flex-col items-center text-center p-10 md:p-16 gap-8">
                {/* Registrar Image */}
                <div className="w-full max-w-[280px]">
                  <div className="relative group">
                    <Image
                      src={data.images?.[0]?.url || '/photo/registrar.jpg'}
                      alt={data.images?.[0]?.alt || profile.name}
                      width={300}
                      height={350}
                      className="w-full h-auto rounded-sm border border-gray-300 p-1.5 bg-white shadow-[-5px_5px_10px_rgba(0,0,0,0.3)] transition-transform duration-500 group-hover:scale-[1.03]"
                      priority
                      unoptimized={process.env.NODE_ENV === 'development'}
                    />
                  </div>
                </div>

                {/* Identity Section */}
                <div className="flex flex-col gap-2">
                  <h1 className="text-3xl md:text-4xl font-black text-[#013A33] uppercase tracking-tighter">
                    {profile.name}
                  </h1>
                  <p className="text-sm font-black text-[#013A33] opacity-70 tracking-[0.3em] uppercase mb-4">
                    Registrar, NIT Manipur
                  </p>
                  
                  <div className="w-24 h-1 bg-[#013A33] mx-auto rounded-full mb-4"></div>

                  {/* Contact Grid */}
                  <div className="flex flex-col gap-4 text-[#013A33]">
                    {profile.phone && (
                      <div className="flex items-center justify-center gap-3 font-bold group">
                        <Phone size={18} className="group-hover:scale-110 transition-transform" />
                        <span className="text-lg">{profile.phone}</span>
                      </div>
                    )}
                    {profile.fax && (
                      <div className="flex items-center justify-center gap-3 font-bold group">
                        <Printer size={18} className="group-hover:scale-110 transition-transform" />
                        <span className="text-lg">{profile.fax}</span>
                      </div>
                    )}
                    {profile.email && (
                      <div className="flex items-center justify-center gap-3 font-bold group">
                        <Mail size={18} className="group-hover:scale-110 transition-transform" />
                        <a 
                          href={`mailto:${profile.email}`} 
                          className="text-lg hover:underline decoration-2 underline-offset-4"
                        >
                          {profile.email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Decorative Footer Bar */}
              <div className="h-2 bg-gradient-to-r from-[#013A33] via-[#00FFCC] to-[#013A33] opacity-30"></div>
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