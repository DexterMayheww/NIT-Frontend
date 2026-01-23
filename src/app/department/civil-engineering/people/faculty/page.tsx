import { notFound } from 'next/navigation';
import Image from 'next/image';
import { drupalFetch } from '@/lib/drupal/customFetch';
import { getDrupalData } from '@/lib/drupal/getDrupalData';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { DrupalJsonApiResponse } from '@/types/drupal';

export default async function CivilEngineeringFacultyPage() {
  // 1. Fetch the Department node to get its internal UUID
  const deptNode = await getDrupalData('/department/civil-engineering', '');
  if (!deptNode) notFound();

  const deptUuid = deptNode.id;

  // 2. Fetch Faculty members assigned to this department
  // We filter by role (faculty) and the assigned department ID
  const facultyRes = await drupalFetch<DrupalJsonApiResponse<any[]>>('/jsonapi/user/user', {
    params: {
      'filter[field_assigned_department.id]': deptUuid,
    },
    next: { revalidate: 3600 } // Cache for 1 hour
  });

  const facultyMembers = facultyRes.data?.data || [];

  console.log("Faculty Members: ", facultyRes.data);

  return (
    <main className="min-h-screen bg-[#013A33] text-white font-sans">
      {/* Header Section */}
      <section className="relative pt-32 pb-20 px-12 border-b border-white/5">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#00FFCC]/5 to-transparent pointer-events-none" />

        <nav className="flex gap-4 mb-8 text-[10px] uppercase tracking-[0.3em] text-[#00FFCC]/60 font-mono">
          <Link href="/department/civil-engineering" className="hover:text-[#00FFCC]">Department</Link>
          <span>/</span>
          <span className="text-white">Faculty</span>
        </nav>

        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-4">
          The <span className="text-[#00FFCC]">Faculty</span>
        </h1>
        <p className="text-gray-400 max-w-2xl font-light text-lg italic">
          Distinguished educators and researchers shaping the future of Civil Engineering through technical excellence and sustainable innovation.
        </p>
      </section>

      {/* Faculty Grid */}
      <section className="py-24 px-12 relative">
        {/* Decorative Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#00FFCC 1px, transparent 0)', backgroundSize: '30px 30px' }} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 relative z-10">
          {facultyMembers.length > 0 ? (
            facultyMembers.map((member: any) => (
              <div key={member.id} className="group relative">
                {/* Border Frame */}
                <div className="absolute -inset-2 border border-white/5 group-hover:border-[#00FFCC]/30 transition-colors duration-500 rounded-sm" />

                {/* Image Container */}
                <div className="relative aspect-[4/5] overflow-hidden mb-6 bg-[#002A28]">
                  {member.user_picture?.uri?.url ? (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_DRUPAL_DOMAIN}${member.user_picture.uri.url}`}
                      alt={member.display_name}
                      fill
                      className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-20 text-[10px] uppercase tracking-widest font-mono">
                      No Portrait
                    </div>
                  )}
                  {/* Accent Corner */}
                  <div className="absolute top-0 right-0 w-8 h-8 bg-[#013A33] translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-l border-white/10" />
                </div>

                {/* Details */}
                <div className="relative">
                  <h3 className="text-2xl font-bold uppercase tracking-tight group-hover:text-[#00FFCC] transition-colors">
                    {member.display_name}
                  </h3>
                  <p className="text-[#00FFCC]/60 font-mono text-[10px] uppercase tracking-widest mb-4">
                    {member.field_designation || 'Faculty Member'}
                  </p>

                  <div className="pt-4 border-t border-white/5 flex flex-col gap-2">
                    <a href={`mailto:${member.mail}`} className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#00FFCC] rounded-full" />
                      {member.mail}
                    </a>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-lg">
              <p className="text-gray-500 font-mono uppercase tracking-widest">No faculty data found for this department.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}