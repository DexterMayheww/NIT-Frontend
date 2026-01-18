// about/nirf-data/page.tsx

import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { getDrupalData } from '@/lib/drupal/getDrupalData';

export default async function NirfDataPage() {
    const FILES_ONLY = 'field_files';

    const data = await getDrupalData('/about/nirf-data', FILES_ONLY);

    if (!data) {
        notFound();
    }

    const quickLinks = [
        { label: 'About NIT', href: '/about/about-nit-manipur' },
        { label: 'Vision And Mission', href: '/about/vision-mission' },
        { label: 'Our History', href: '/about/our-history' },
        { label: 'Key Documents', href: '/about/key-documents' },
        { label: "Institute newsletter 'reportage'", href: '/about/institute-newsletter' },
        { label: 'NIRF Data', href: '/about/nirf-data', active: true },
    ];

    const files = data.files || [];
    const half = Math.ceil(files.length / 2);
    const leftColumnFiles = files.slice(0, half);
    const rightColumnFiles = files.slice(half);

    return (
        <>
            <main className="min-h-screen bg-white pt-32 pb-20 px-4 font-sans">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">

                    {/* --- MAIN CONTENT (Inner Content) --- */}
                    <div className="w-full lg:w-[65%] order-2 lg:order-1">
                        <div className="text-center mb-10">
                            <h1 className="text-3xl md:text-4xl font-black text-[#013a33] uppercase tracking-tight mb-2">
                                National Institutional Ranking Framework - NIRF
                            </h1>
                            <p className="text-gray-500 font-bold uppercase text-xs tracking-[0.2em]">
                                Year wise NIRF data for NIT Manipur
                            </p>
                        </div>

                        <div className="bg-[#f9f9f9] p-8 md:p-12 shadow-[5px_5px_15px_rgba(0,0,0,0.2)] rounded-sm flex flex-col md:flex-row justify-around gap-6">

                            {/* Left Column of File Links */}
                            <div className="flex flex-col flex-1 gap-4">
                                {leftColumnFiles.length > 0 ? (
                                    leftColumnFiles.map((file, index) => (
                                        <a
                                            key={index}
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-[#013a33] p-4 text-white text-lg font-bold shadow-[5px_5px_10px_rgba(0,0,0,0.3)] transition-all duration-300 hover:bg-[#77a071] hover:text-black hover:scale-105 text-center md:text-left border-l-4 border-[#00FFCC] rounded-lg"
                                        >
                                            {file.filename.replace(/\.[^/.]+$/, "").replace(/_/g, " ")}
                                        </a>
                                    ))
                                ) : (
                                    <p className="text-gray-400 italic text-center w-full">No data available.</p>
                                )}
                            </div>

                            {/* Right Column of File Links */}
                            <div className="flex flex-col flex-1 gap-4">
                                {rightColumnFiles.map((file, index) => (
                                    <a
                                        key={index}
                                        href={file.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-[#013a33] p-4 text-white text-lg font-bold shadow-[5px_5px_10px_rgba(0,0,0,0.3)] transition-all duration-300 hover:bg-[#77a071] hover:text-black hover:scale-105 text-center md:text-left border-l-4 border-[#00FFCC]"
                                    >
                                        {file.filename.replace(/\.[^/.]+$/, "").replace(/_/g, " ")}
                                    </a>
                                ))}
                            </div>

                        </div>

                        {/* Context Note */}
                        <div className="mt-12 p-6 bg-[#013a33]/5 border-l-4 border-[#013a33] rounded-r-xl">
                            <p className="text-sm text-gray-600 leading-relaxed italic">
                                Note: The documents above contain the official data submitted by NIT Manipur to the NIRF for the respective academic years.
                                Click on any year to view or download the full PDF report.
                            </p>
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