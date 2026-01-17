// app/gallery/page.tsx

import { getDrupalData } from '@/lib/drupal/getDrupalData';
import { Footer } from '@/components/Footer';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Play, Camera } from 'lucide-react';

export default async function GalleryPage() {
    const GALLERY_INCLUDES = 'field_images,field_images.field_media_image,field_videos,field_videos.field_media_video_file';

    // Fetch data from Drupal
    const galleryData = await getDrupalData('/gallery', GALLERY_INCLUDES);

    if (!galleryData) {
        notFound();
    }

    const { images, videos, title } = galleryData;

    return (
        <>
            <main className="min-h-screen bg-[#001D1B] text-white pt-32 pb-24 font-sans selection:bg-[#00FFCC] selection:text-[#002A28]">

                {/* --- HERO HEADER --- */}
                <section className="max-w-7xl mx-auto px-6 mb-20">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-12">
                        <div>
                            <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-none">
                                {title || 'Gallery'}
                            </h1>
                            <p className="mt-4 text-[#00FFCC] font-bold uppercase tracking-[0.4em] text-sm">
                                Visual Archives • NIT Manipur
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex flex-col items-end">
                                <span className="text-4xl font-light italic">{images?.length || 0}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Captures</span>
                            </div>
                            <div className="w-[1px] bg-white/20 h-12"></div>
                            <div className="flex flex-col items-end">
                                <span className="text-4xl font-light italic">{videos?.length || 0}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Films</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- IMAGE GRID (Bento-style Layout) --- */}
                <section className="max-w-[1600px] mx-auto px-6 mb-32">
                    <div className="flex items-center gap-4 mb-10">
                        <Camera className="text-[#00FFCC]" size={24} />
                        <h2 className="text-2xl font-bold uppercase tracking-tight">Image Collection</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {images?.map((img, idx) => (
                            <div
                                key={idx}
                                className="relative aspect-square overflow-hidden group rounded-2xl bg-[#013A33] border border-white/5"
                            >
                                <Image
                                    src={img.url}
                                    alt={img.alt || 'Gallery Image'}
                                    fill
                                    className="object-cover transition-all duration-700 grayscale group-hover:grayscale-0 group-hover:scale-110"
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                    unoptimized={process.env.NODE_ENV === 'development'}
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-[#002A28] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-8 flex flex-col justify-end">
                                    <p className="text-white font-bold text-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                        {img.alt || 'Campus Life'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* --- VIDEO COLLECTION --- */}
                {videos && videos.length > 0 && (
                    <section className="bg-[#002A28] py-32 border-y border-white/5">
                        <div className="max-w-7xl mx-auto px-6">
                            <div className="flex items-center gap-4 mb-16">
                                <Play className="text-[#00FFCC]" size={24} />
                                <h2 className="text-2xl font-bold uppercase tracking-tight">Institutional Films</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {videos.map((vid, idx) => (
                                    <div key={idx} className="group cursor-pointer">
                                        <div className="relative aspect-video rounded-[2rem] overflow-hidden border border-white/10 mb-6">
                                            <video
                                                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700"
                                                muted
                                                playsInline
                                            >
                                                <source src={vid.url} type="video/mp4" />
                                            </video>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#00FFCC] group-hover:border-none transition-all duration-500">
                                                    <Play className="text-white group-hover:text-[#002A28] fill-current" size={32} />
                                                </div>
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold tracking-tight px-4 group-hover:text-[#00FFCC] transition-colors uppercase">
                                            {vid.name || `Video Resource ${idx + 1}`}
                                        </h3>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* --- EMPTY STATE --- */}
                {(!images || images.length === 0) && (!videos || videos.length === 0) && (
                    <div className="py-40 text-center">
                        <p className="text-gray-500 italic text-xl">The visual archives are currently being digitized.</p>
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
}