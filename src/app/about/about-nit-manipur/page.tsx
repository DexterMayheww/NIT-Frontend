// app/about/about-nit-manipur/page.tsx

import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Footer } from '@/components/Footer';
import { getDrupalData } from '@/lib/drupal/getDrupalData';
import { Sidebar } from '@/components/Sidebar';

export default async function AboutNITPage() {
    const IMG_ONLY = 'field_images,field_images.field_media_image';

    const data = await getDrupalData('/about/about-nit-manipur', IMG_ONLY);

    if (!data) {
        notFound();
    }

    const quickLinks = [
        { label: 'About NIT', href: '/about/about-nit-manipur', active: true },
        { label: 'Vision And Mission', href: '/about/vision-mission' },
        { label: 'Our History', href: '/about/our-history' },
        { label: 'Key Documents', href: '/about/key-documents' },
        { label: "Institute newsletter 'reportage'", href: '/about/institute-newsletter' },
        { label: 'NIRF Data', href: '/about/nirf-data' },
    ];

    return (
        <>
            <div className="min-h-screen bg-[#f9f9f9] pt-32 pb-20 px-4">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">

                    {/* --- MAIN CONTENT (Inner Content) --- */}
                    <main className="w-full lg:w-[65%] bg-white p-8 md:p-12 shadow-[5px_5px_15px_rgba(0,0,0,0.1)] rounded-sm border border-gray-100 order-2 lg:order-1">
                        <h1 className="text-4xl font-bold text-[#013a33] mb-8 border-b-2 border-gray-100 pb-4">
                            {data.title || 'Profile of the Institute'}
                        </h1>

                        {/* Featured Image */}
                        {data.images && data.images.length > 0 && (
                            <div className="flex justify-center mb-10">
                                <div className="relative group">
                                    <Image
                                        src={data.images[0].url}
                                        alt={data.images[0].alt || data.title}
                                        width={800}
                                        height={500}
                                        className="rounded-[20px] border border-gray-200 shadow-[-10px_10px_20px_rgba(0,0,0,0.15)] transition-transform duration-500 group-hover:scale-[1.01]"
                                        priority
                                        unoptimized={process.env.NODE_ENV === 'development'}
                                        
                                    />
                                </div>
                            </div>
                        )}

                        {/* Dynamic Body Content */}
                        <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed space-y-6">
                            {data.details ? (
                                <div
                                    className="whitespace-pre-line [&>p]:mb-6 [&>p:last-child]:mb-0"
                                    dangerouslySetInnerHTML={{ __html: data.details }}
                                />
                            ) : (
                                <p className="italic text-gray-400">Content is being updated...</p>
                            )}
                        </div>
                    </main>

                    {/* --- SIDEBAR (Quick Links) --- */}
                    <Sidebar links={quickLinks} />

                </div>
            </div>
            <Footer />
        </>
    );
}