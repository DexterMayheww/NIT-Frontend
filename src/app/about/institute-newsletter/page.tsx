// app/about/institute-newsletter/page.tsx

import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { FileText, Download, Eye } from 'lucide-react';
import { getDrupalData } from '@/lib/drupal/getDrupalData';
import PDFViewer from '@/components/PdfViewer';

export default async function InstituteNewsletterPage() {
    const FILES_ONLY = 'field_files';

    const data = await getDrupalData('/about/institute-newsletter', FILES_ONLY);

    if (!data) {
        notFound();
    }

    const quickLinks = [
        { label: 'About NIT', href: '/about/about-nit-manipur' },
        { label: 'Vision And Mission', href: '/about/vision-mission' },
        { label: 'Our History', href: '/about/our-history' },
        { label: 'Key Documents', href: '/about/key-documents' },
        { label: "Institute newsletter 'reportage'", href: '/about/institute-newsletter', active: true },
        { label: 'NIRF Data', href: '/about/nirf-data' },
    ];

    const newsletters = data.files || [];
    const latestNewsletter = newsletters[0];
    const archives = newsletters.slice(1);

    const proxiedUrl = latestNewsletter 
    ? `/api/proxy-pdf?url=${encodeURIComponent(latestNewsletter.url)}` 
    : '';

    return (
        <>
            <main className="min-h-screen bg-[#F4F7F6] pt-32 pb-20 px-4 font-sans">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">

                    {/* --- MAIN CONTENT: PDF VIEWER --- */}
                    <div className="w-full lg:w-[65%] order-2 lg:order-1">
                        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">

                            {/* Header Tab */}
                            <div className="bg-[#013a33] p-6 text-white flex flex-col md:flex-row justify-between items-center gap-4">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
                                        {data.title || 'Institute Newsletter'}
                                    </h1>
                                    <p className="text-[#00FFCC] text-xs font-bold tracking-[0.2em] uppercase mt-1">
                                        Official Publication: Reportage
                                    </p>
                                </div>

                                {latestNewsletter && (
                                    <a
                                        href={latestNewsletter.url}
                                        target='_blank'
                                        download
                                        className="flex items-center gap-2 bg-[#00FFCC] text-[#013a33] px-5 py-2 rounded-full font-black text-xs uppercase hover:bg-white transition-all shadow-lg"
                                    >
                                        <Download size={16} />
                                        Download PDF
                                    </a>
                                )}
                            </div>

                            {/* PDF Interaction Zone */}
                            <div className="p-4 bg-gray-100">
                                {latestNewsletter ? (
                                    <div className="relative group">
                                        {/* Responsive Iframe for PDF viewing */}
                                        <div className="aspect-[1/1.4] w-full bg-white rounded-lg shadow-inner overflow-hidden border border-gray-300">
                                            <PDFViewer url={proxiedUrl} />
                                        </div>

                                        {/* Mobile Fallback / Overlay Action */}
                                        <div className="mt-4 md:hidden">
                                            <a
                                                href={latestNewsletter.url}
                                                target="_blank"
                                                className="w-full flex items-center justify-center gap-2 bg-[#013a33] text-white p-4 rounded-xl font-bold"
                                            >
                                                <Eye size={20} /> View Full Newsletter
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-20 text-center">
                                        <FileText size={64} className="mx-auto text-gray-300 mb-4" />
                                        <p className="text-gray-500 font-medium italic">No newsletters have been uploaded yet.</p>
                                    </div>
                                )}
                            </div>

                            {/* Archive Section (If multiple files exist) */}
                            {archives.length > 0 && (
                                <div className="p-8 border-t border-gray-100 bg-white">
                                    <h3 className="text-xl font-bold text-[#013a33] mb-6 border-b pb-2">Previous Editions</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {archives.map((file, idx) => (
                                            <a
                                                key={idx}
                                                href={file.url}
                                                target="_blank"
                                                className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-[#00FFCC] hover:bg-[#F0FFFB] transition-all group"
                                            >
                                                <div className="bg-gray-100 p-3 rounded-lg group-hover:bg-[#013a33] group-hover:text-white transition-colors">
                                                    <FileText size={20} />
                                                </div>
                                                <span className="text-sm font-bold text-gray-700 group-hover:text-[#013a33]">
                                                    {file.filename.replace(/\.[^/.]+$/, "").replace(/_/g, " ")}
                                                </span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Content Context from HTML */}
                        <div className="mt-10 p-8 bg-white/50 backdrop-blur-md rounded-2xl border border-white">
                            <h4 className="text-[#013a33] font-black text-xl mb-4">About Reportage</h4>
                            <p className="text-gray-600 leading-relaxed text-sm italic">
                                {data.details}
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