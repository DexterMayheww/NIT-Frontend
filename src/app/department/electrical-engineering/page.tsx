import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getDrupalData } from '@/lib/drupal/getDrupalData';
import { GalleryCarousel } from '@/components/GalleryCarousel';
import { Footer } from '@/components/Footer';
import { parseDepartmentEditor } from '@/lib/parser';
import { parse } from 'node-html-parser';
import { NoticeBoard } from '@/components/HomeClient';
import { getNotices } from '@/lib/drupal/generated';
import { useSession } from 'next-auth/react';

export default async function ComputerScienceEngineering() {
	// const { session } = useSession();
	// const isAdmin = (session?.user as any)?.role === 'administrator';
	// const isDeptHead = (session?.user as any)?.role === 'administrator';

	const IMG_ONLY = 'field_images,field_images.field_media_image';
	const HOD_INCLUDES = 'field_images, field_images.field_media_image';
	const FILES_ONLY = 'field_files';

	const [deptData, hodData, noticesRes, newsBoardData] = await Promise.all([
		getDrupalData('/department/electrical-engineering', IMG_ONLY),
		getDrupalData('/department/electrical-engineering/head', HOD_INCLUDES),
		getNotices(6, 0),
		getDrupalData('/news-board', FILES_ONLY),
	]);

	if (!deptData) notFound();

	// Data mapping
	const heroImages = deptData.images || [];
	const aboutText = deptData.details;
	const { vision, mission, programs: rawProgramsHtml } = parseDepartmentEditor(deptData.editor || '');

	const programsRoot = parse(rawProgramsHtml);
	const introParagraphs = programsRoot.querySelectorAll('p')
		.map(p => p.outerHTML)
		.join('');
	const tableHtml = programsRoot.querySelector('table')?.outerHTML || '';

	const aboutBg = heroImages[1]?.url || '/photo/aboutNit.png';
	const hodPhoto = hodData?.images?.[0]?.url;
	const rawHodMessage = hodData?.editor || '';
	const root = parse(rawHodMessage);
	const cleanedHodMessage = root.toString();

	const hodName = hodData?.details || 'Head of Department';

	return (
		<main className="min-h-screen bg-[#013A33] text-white font-sans">

			{/* Hero Section (Static Carousel Placeholder) */}
			<section className="relative h-[100vh] min-h-[400px] w-full overflow-hidden">
				{heroImages.length > 0 && (
					<Image
						src={heroImages[1].url}
						alt="Hero"
						fill
						className="object-cover opacity-50"
						priority
						unoptimized={process.env.NODE_ENV === 'development'}
					/>
				)}
				<div className="absolute inset-0 bg-gradient-to-t from-[#013A33] to-transparent" />
				<div className="relative z-10 h-full flex items-center justify-center text-center px-4">
					<h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none pt-10">
						Electrical <span className="text-[#00FFCC]">&nbsp;Engineering</span>
					</h1>
				</div>
			</section>

			<section className='m-12'>
				<NoticeBoard notices={noticesRes.data as any} newsFiles={newsBoardData?.files} />
			</section>

			{/* --- VISION, MISSION, ABOUT CLUSTER (Home Page Style) --- */}
			<section className="py-20 mx-12">
				<div className="flex flex-col-reverse lg:flex-row items-stretch gap-10">

					{/* Left: About Box with Background */}
					<div
						style={{ backgroundImage: `url(${aboutBg})` }}
						className="lg:w-1/2 flex flex-col justify-center bg-cover bg-center rounded-[2.5rem] overflow-hidden relative min-h-[600px] shadow-2xl group border border-white/10"
					>
						<div className="absolute inset-0 bg-gradient-to-t from-[#001D1B] via-[#001D1B]/80 to-transparent p-10 md:p-14 flex flex-col justify-end">
							<h2 className="text-4xl md:text-5xl font-black mb-6 text-white group-hover:text-[#00FFCC] transition-colors uppercase">
								About Us
							</h2>
							<p className="text-lg font-light leading-relaxed text-gray-200">
								{aboutText}
							</p>
						</div>
					</div>

					{/* Right: Vision & Mission Stack */}
					<div className="flex flex-col gap-8 lg:w-1/2">
						{/* Vision Card */}
						<div className="flex-1 bg-white text-[#002A28] p-10 rounded-t-[2.5rem] rounded-br-[2.5rem] shadow-xl border-t-8 border-[#00FFCC]">
							<h2 className="text-4xl font-black mb-6 border-b-4 border-[#013A33] inline-block pb-1 uppercase tracking-tight">Vision</h2>
							<div
								className="prose prose-invert max-w-none text-lg leading-relaxed
                          [&_ul]:list-none [&_li]:relative [&_li]:pl-10 [&_li]:mb-4
                          [&_li::before]:content-['➤'] [&_li::before]:absolute [&_li::before]:left-0 [&_li::before]:text-[#396b61]"
								dangerouslySetInnerHTML={{ __html: vision }}
							/>
						</div>

						{/* Mission Card */}
						<div className="flex-1 bg-[#00463C] text-white p-10 rounded-b-[2.5rem] rounded-tl-[2.5rem] shadow-xl border border-[#006A58]">
							<h2 className="text-4xl font-black mb-6 inline-block pb-1 uppercase tracking-tight">Mission</h2>
							<div
								className="prose prose-invert max-w-none text-lg leading-relaxed
                          [&_ul]:list-none [&_li]:relative [&_li]:pl-10 [&_li]:mb-4
                          [&_li::before]:content-['➤'] [&_li::before]:absolute [&_li::before]:left-0 [&_li::before]:text-[#00FFCC]"
								dangerouslySetInnerHTML={{ __html: mission }}
							/>
						</div>
					</div>
				</div>
			</section>

			{/* --- HOD MESSAGE --- */}
			<section className="py-32 bg-[#002A28] border-y border-white/5 relative overflow-hidden">
				<div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00FFCC]/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />

				<div className="max-w-4xl mx-auto px-6 text-center relative z-10">
					<h2 className="text-[50px] font-black uppercase mb-16 text-[#00FFCC] opacity-80">
						Message From HoD
					</h2>

					<div className="relative w-48 h-48 mx-auto mb-12">
						<div className="absolute inset-0 bg-[#00FFCC] blur-2xl opacity-10 rounded-full" />
						<div className="relative w-full h-full rounded-full overflow-hidden border-2 border-[#00FFCC]/30 p-1 bg-[#013A33]">
							<div className="w-full h-full rounded-full overflow-hidden relative">
								{hodPhoto ? (
									<Image src={hodPhoto} alt={hodName} fill className="object-cover grayscale hover:grayscale-0 transition-all duration-700" />
								) : (
									<div className="w-full h-full bg-[#013A33] flex items-center justify-center text-xs opacity-50 uppercase tracking-widest">{hodName}</div>
								)}
							</div>
						</div>
					</div>

					<h3 className="text-4xl font-black mb-3 uppercase tracking-tight text-white">{hodName}</h3>
					<p className="text-[#00FFCC] font-mono text-xs mb-14 tracking-[0.3em] uppercase opacity-70">Head of Department</p>

					<div className="relative group">
						<span className="absolute -top-12 -left-8 text-[12rem] text-[#00FFCC]/5 font-serif pointer-events-none select-none group-hover:text-[#00FFCC]/10 transition-colors duration-500">&ldquo;</span>

						{/* [FIX: RENDER AS HTML] */}
						<div
							className="prose prose-invert prose-lg max-w-none italic font-light leading-relaxed text-gray-300 mx-auto
                            [&_p]:mb-4 last:[&_p]:mb-0 selection:bg-[#00FFCC] selection:text-[#013A33]"
							dangerouslySetInnerHTML={{ __html: cleanedHodMessage }}
						/>

						<span className="absolute -bottom-20 -right-8 text-[12rem] text-[#00FFCC]/5 font-serif pointer-events-none select-none group-hover:text-[#00FFCC]/10 transition-colors duration-500">&rdquo;</span>
					</div>
				</div>
			</section>


			{/* --- GALLERY --- */}
			<section className="py-24 mx-12 px-4">
				<h2 className="text-5xl font-black uppercase tracking-tighter text-center mb-20">Department <span className="text-[#00FFCC]">Gallery</span></h2>
				<GalleryCarousel images={heroImages} />
			</section>

			{/* --- PROGRAMS OFFERED (The "Blueprint" Section) --- */}
			<section className="py-32 bg-[#013A33] relative overflow-hidden">
				<div className="absolute inset-0 opacity-[0.03] pointer-events-none"
					style={{ backgroundImage: `radial-gradient(#00FFCC 1px, transparent 0)`, backgroundSize: '40px 40px' }} />

				<div className="mx-12 px-6 relative z-10">
					<div className="flex flex-col lg:flex-row gap-16 items-start">

						{/* Left Column: Dynamic Intro Text from Editor */}
						<div className="lg:w-1/3">
							<h2 className="text-5xl font-black uppercase tracking-tighter leading-none mb-8">
								Academic <br />
								<span className="text-[#00FFCC]">Framework</span>
							</h2>
							<div className="h-1 w-20 bg-[#00FFCC] mb-8" />

							{/* Dynamically parsed Paragraph Text */}
							<div
								className="prose prose-invert prose-lg text-gray-400 font-light leading-relaxed
                               [&_p]:mb-6 last:[&_p]:mb-0 selection:bg-[#00FFCC] selection:text-[#013A33]"
								dangerouslySetInnerHTML={{ __html: introParagraphs }}
							/>
						</div>

						{/* Right Column: Dynamic Table from Editor */}
						<div className="lg:w-2/3 w-full">
							<div className="relative group">
								<div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-[#00FFCC]/40" />
								<div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-[#00FFCC]/40" />

								<div className="bg-[#002A28]/50 backdrop-blur-sm border border-white/5 p-1 rounded-sm overflow-x-auto">
									<div
										className="prose prose-invert max-w-none 
                            [&_table]:w-full [&_table]:border-collapse
                            [&_thead]:bg-[#00FFCC]/5
                            [&_th]:py-5 [&_th]:px-6 [&_th]:text-[#00FFCC] [&_th]:text-[10px] [&_th]:uppercase [&_th]:tracking-[0.2em] [&_th]:font-black [&_th]:text-left [&_th]:border-b [&_th]:border-white/10
                            [&_td]:py-6 [&_td]:px-6 [&_td]:text-gray-300 [&_td]:border-b [&_td]:border-white/5 [&_td]:text-sm [&_td]:font-light
                            [&_tr:hover]:bg-white/[0.02] [&_tr]:transition-colors
                            [&_td:nth-child(2)]:font-mono [&_td:nth-child(2)]:text-[#00FFCC]/70 [&_td:nth-child(2)]:text-sm
                            [&_td:first-child]:text-white [&_td:first-child]:font-bold [&_td:first-child]:tracking-tight [&_td:first-child]:text-base"
										dangerouslySetInnerHTML={{ __html: tableHtml }}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
			<Footer />
		</main>
	);
}