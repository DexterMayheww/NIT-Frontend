// about/key-documents/page.tsx

import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { getDrupalData } from '@/lib/drupal/getDrupalData';

export default async function KeyDocumentsPage() {
    const FILES_ONLY = 'field_files';

    const data = await getDrupalData('/about/key-documents', FILES_ONLY);

    if (!data) {
        notFound();
    }

    const quickLinks = [
        { label: 'About NIT', href: '/about/about-nit-manipur' },
        { label: 'Vision And Mission', href: '/about/vision-mission' },
        { label: 'Our History', href: '/about/our-history' },
        { label: 'Key Documents', href: '/about/key-documents', active: true },
        { label: "Institute newsletter 'reportage'", href: '/about/institute-newsletter' },
        { label: 'NIRF Data', href: '/about/nirf-data' },
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
                    <div className="w-full lg:w-[65%] order-2 lg:order-1 text-center">
                        <h1 className="text-3xl md:text-4xl font-black text-[#013a33] uppercase tracking-tight mb-10">
                            KEY DOCUMENTS
                        </h1>
                        <div className="bg-[#f9f9f9] p-8 md:p-12 shadow-[5px_5px_15px_rgba(0,0,0,0.2)] rounded-sm flex flex-col md:flex-row justify-around gap-6">

                            {/* Box 1 (Left Column of Links) */}
                            <div className="flex flex-col flex-1 gap-4">
                                {leftColumnFiles.length > 0 ? (
                                    leftColumnFiles.map((file, index) => (
                                        <a
                                            key={index}
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-[#013a33] p-4 text-white text-lg md:text-xl font-medium shadow-[5px_5px_10px_rgba(0,0,0,0.3)] transition-all duration-300 hover:bg-[#77a071] hover:text-black hover:scale-105 text-center md:text-left border-l-4 border-[#00FFCC] rounded-lg"
                                        >
                                            {file.filename.replace(/\.[^/.]+$/, "").replace(/_/g, " ")}
                                        </a>
                                    ))
                                ) : (
                                    <p className="text-gray-400 italic">No documents found.</p>
                                )}
                            </div>

                            {/* Box 2 (Right Column of Links) */}
                            <div className="flex flex-col flex-1 gap-4">
                                {rightColumnFiles.map((file, index) => (
                                    <a
                                        key={index}
                                        href={file.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-[#013a33] p-4 text-white text-lg md:text-xl font-medium shadow-[5px_5px_10px_rgba(0,0,0,0.3)] transition-all duration-300 hover:bg-[#77a071] hover:text-black hover:scale-105 text-center md:text-left"
                                    >
                                        {file.filename.replace(/\.[^/.]+$/, "").replace(/_/g, " ")}
                                    </a>
                                ))}
                            </div>

                        </div>

                        {/* Optional fallback text if specific important documents are expected */}
                        {files.length === 0 && (
                            <div className="mt-8 p-6 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700">
                                Please upload administrative documents (Annual Reports, Minutes, RTI, etc.) to the <strong>field_files</strong> in Drupal.
                            </div>
                        )}
                    </div>

                    {/* --- SIDEBAR --- */}
                    <Sidebar links={quickLinks} />

                </div>
            </main>

            <Footer />
        </>
    );
}