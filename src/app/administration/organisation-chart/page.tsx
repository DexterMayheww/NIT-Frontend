// app/administration/organisation-chart/page.tsx

import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import Image from 'next/image';
import { getDrupalData } from '@/lib/drupal/getDrupalData';
import { Download } from 'lucide-react'; // Added for the icon

export default async function OrganisationChartPage() {
    const IMG_ONLY = 'field_images,field_images.field_media_image';

    const data = await getDrupalData('/administration/organisation-chart', IMG_ONLY);

    if (!data) {
        notFound();
    }

    const quickLinks = [
        { label: 'Director', href: '/administration/director' },
        { label: 'Registrar', href: '/administration/registrar' },
        { label: 'Board of Governors', href: '/administration/board-of-governors' },
        { label: 'Building and Works Committee', href: '/administration/building-works-committee' },
        { label: 'Finance Committee', href: '/administration/finance-committee' },
        { label: 'Senate', href: '/administration/senate' },
        { label: 'NIT Council', href: '/administration/nit-council' },
        { label: 'Department Heads', href: '/administration/head-of-department' },
        { label: 'Dean', href: '/administration/dean' },
        { label: 'NIT Administration', href: '/administration/nit-administration' },
        { label: 'Organisation Chart', href: '/administration/organisation-chart', active: true },
        { label: 'Officers', href: '/administration/officers' },
        { label: 'Grant-in-aid received from MoE', href: '/administration/moe-grants' },
    ];

    const chartImage = data.images?.[0];

    return (
        <>
            <main className="min-h-screen bg-white pt-32 pb-20 px-4 font-sans">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">

                    {/* --- MAIN CONTENT: CHART VIEWER --- */}
                    <div className="w-full lg:w-[65%] order-2 lg:order-1">
                        <div className="bg-white p-4 md:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.1)] rounded-xl border border-gray-100 flex flex-col items-center">

                            {/* --- HEADER WITH DOWNLOAD BUTTON --- */}
                            <div className="w-full mb-8 border-b pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-black text-[#013A33] uppercase tracking-tight">
                                        Organisation Chart
                                    </h1>
                                    <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">
                                        NIT Manipur Administrative Structure
                                    </p>
                                </div>

                                {chartImage && (
                                    <a
                                        href={chartImage.url}
                                        download="NIT_Manipur_Organisation_Chart"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 bg-[#013A33] text-white px-5 py-2.5 rounded-lg text-sm font-bold uppercase transition-all hover:bg-[#025a4f] shadow-md hover:shadow-xl active:scale-95 w-fit"
                                    >
                                        <Download size={18} />
                                        Download Chart
                                    </a>
                                )}
                            </div>

                            {chartImage ? (
                                <div className="relative w-full overflow-hidden rounded-lg group">
                                    <Image
                                        src={chartImage.url}
                                        alt={chartImage.alt || 'Organisation Chart of NIT Manipur'}
                                        width={1200}
                                        height={800}
                                        className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-[1.02]"
                                        priority
                                        unoptimized={process.env.NODE_ENV === 'development'}
                                    />

                                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                        <span className="bg-[#013A33] text-white px-4 py-2 rounded-full text-xs font-bold uppercase shadow-xl">
                                            Official Chart
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-32 text-center w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl">
                                    <div className="mb-4 flex justify-center">
                                        <div className="w-16 h-16 border-4 border-[#013A33]/20 border-t-[#013A33] rounded-full animate-spin"></div>
                                    </div>
                                    <p className="text-gray-400 italic">The administrative hierarchy is currently being mapped...</p>
                                </div>
                            )}

                            {/* Functional Note */}
                            <div className="mt-10 p-6 bg-[#013A33]/5 border-l-4 border-[#013A33] rounded-r-lg w-full">
                                <p className="text-xs text-gray-600 leading-relaxed italic">
                                    Note: This chart illustrates the chain of command and functional relationships between the Board of Governors,
                                    the Director, and the various academic and administrative wings of the Institute.
                                    Updates are synchronized directly from the Drupal Content Management System.
                                </p>
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