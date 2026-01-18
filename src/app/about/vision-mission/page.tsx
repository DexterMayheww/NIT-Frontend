// app/about/vision-mission/page.tsx

import { getNodeByPath } from '@/lib/drupal/generated';
import { notFound } from 'next/navigation';
import { Target, Eye } from 'lucide-react';
import { Footer } from '@/components/Footer';
import { Sidebar } from '@/components/Sidebar';

export default async function VisionMissionPage() {
    const { data, status } = await getNodeByPath('/about/vision-mission');

    if (!data || status !== 200) {
        notFound();
    }

    const quickLinks = [
        { label: 'About NIT', href: '/about/about-nit-manipur' },
        { label: 'Vision And Mission', href: '/about/vision-mission', active: true },
        { label: 'Our History', href: '/about/our-history' },
        { label: 'Key Documents', href: '/about/key-documents' },
        { label: "Institute newsletter 'reportage'", href: '/about/institute-newsletter' },
        { label: 'NIRF Data', href: '/about/nirf-data' },
    ];

    return (
        <>
            <div className="min-h-screen bg-white pt-32 pb-20 px-4">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12">

                    {/* --- MAIN CONTENT AREA --- */}
                    <main className="w-full lg:w-[65%] bg-white p-8 md:p-12 shadow-[5px_5px_15px_rgba(0,0,0,0.1)] rounded-sm border border-gray-100 order-2 lg:order-1">

                        {/* Header Title */}
                        <h1 className="text-4xl font-bold text-[#013a33] mb-8 border-b-2 border-gray-100 pb-4">
                            {data.title || 'Vision & Mission'}
                        </h1>

                        {/* Vision Section */}
                        <div className="bg-white border border-gray-100 rounded-xl p-8 mb-8 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center gap-3 mb-4 text-[#013a33]">
                                <Eye size={28} className="text-[#00FFCC]" />
                                <h3 className="text-2xl font-bold">Vision</h3>
                            </div>
                            <p className="text-gray-700 text-lg leading-relaxed pl-2 border-l-4 border-[#00FFCC]/30">
                                {data.details || 'Vision content loading...'}
                            </p>
                        </div>

                        {/* Mission Section */}
                        <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center gap-3 mb-6 text-[#013a33]">
                                <Target size={28} className="text-[#00FFCC]" />
                                <h3 className="text-2xl font-bold">Mission</h3>
                            </div>
                            <div
                                className="prose prose-green max-w-none text-gray-700
                  [&_ul]:list-none [&_ul]:pl-0
                  [&_li]:relative [&_li]:pl-10 [&_li]:mb-4 [&_li]:text-lg
                  [&_li::before]:content-['➤'] [&_li::before]:absolute [&_li::before]:left-0 
                  [&_li::before]:text-[#013a33] [&_li::before]:text-xl
                "
                                dangerouslySetInnerHTML={{ __html: data.editor || '' }}
                            />
                        </div>
                    </main>

                    {/* --- SIDEBAR AREA --- */}
                    <Sidebar links={quickLinks} />

                </div>
            </div>
            <Footer />
        </>
    );
}