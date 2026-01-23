// department/civil-engineering/page.tsx

import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import Image from 'next/image';
import { getDrupalData } from '@/lib/drupal/getDrupalData';

export default async function CivilEngineeringPage() {
    const IMG_ONLY = 'field_images,field_images.field_media_image';

    const data = await getDrupalData('/department/chemistry', IMG_ONLY);

    if (!data) {
        notFound();
    }

  const quickLinks = [
    { label: 'Chemistry', href: '/department/chemistry' },
    { label: 'Civil Engineering', href: '/department/civil-engineering', active: true },
    { label: 'Computer Science and Engineering', href: '/department/computer-science-engineering' },
    { label: 'Electrical Engineering', href: '/department/electrical-engineering' },
    { label: 'Electronics & Communication Engineering', href: '/department/electronics-communication-engineering' },
    { label: 'Humanities & Social Science', href: '/department/humanities-social-science' },
    { label: 'Institution Innovation Council', href: '/department/institution-innovation-council' },
    { label: 'Mathematics', href: '/department/mathematics' },
    { label: 'Mechanical Engineering', href: '/department/mechanical-engineering' },
    { label: 'Physics', href: '/department/physics' },
    { label: 'Visvesvaraya Scheme', href: '/department/visvesvaraya-scheme' },
  ];

  const deptImage = data.images?.[0];

  return (
    <>
      <div className="min-h-screen bg-white pt-32 pb-20 px-4 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
          
          {/* --- MAIN CONTENT AREA --- */}
          <div className="w-full lg:w-[65%] order-2 lg:order-1">
            <div className="bg-white p-8 md:p-12 shadow-[0_10px_30px_rgba(0,0,0,0.05)] rounded-xl border border-gray-100">
              
              <h1 className="text-4xl font-black text-[#013A33] mb-8 border-b-4 border-[#013A33] inline-block pb-2 uppercase tracking-tighter">
                {data.title || 'Department of Civil Engineering'}
              </h1>

              {/* Departmental Feature Image */}
              <div className="mb-10 overflow-hidden rounded-2xl shadow-2xl border border-gray-200">
                {deptImage ? (
                  <div className="relative group">
                    <Image
                      src={deptImage.url}
                      alt={deptImage.alt || 'Chemistry Department'}
                      width={1000}
                      height={600}
                      className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-[1.03]"
                      priority
                      unoptimized={process.env.NODE_ENV === 'development'}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                ) : (
                  <div className="h-64 bg-gray-100 flex items-center justify-center italic text-gray-400">
                    No departmental image uploaded yet.
                  </div>
                )}
              </div>

              {/* Department Static Content (Since only field_images is connected) */}
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
                <p>{data.details}</p>
              </div>
            </div>
          </div>

          {/* --- SIDEBAR --- */}
          <Sidebar links={quickLinks} />
          
        </div>
      </div>
      <Footer />
    </>
  );
}