// app/page.tsx
import { getDepartments, getNotices } from '@/lib/drupal/generated';
import { NoticeBoard, AdmissionTabs } from '@/components/HomeClient';
import Link from 'next/link';
import Image from 'next/image';
import { StatsSection } from '@/components/StatsSection';
import { GalleryCarousel } from '@/components/GalleryCarousel';
import { Footer } from '@/components/Footer';
import { getDrupalData } from '@/lib/drupal/getDrupalData';
import { parseQuickLinks, parseCompanyMarquee, parsePlacementTable } from '@/lib/parser';

export default async function Page() {
	// const DRUPAL_DOMAIN = getDrupalDomain();

	const IMG_ONLY = 'field_images,field_images.field_media_image';
	const VID_ONLY = 'field_videos,field_videos.field_media_video_file';
	const IMG_AND_FILES = 'field_images,field_images.field_media_image,field_files';
	const FILES_ONLY = 'field_files';
	const GALLERY_INCLUDES = 'field_images,field_images.field_media_image,field_videos,field_videos.field_media_video_file';

	const [
		homeData,
		newsBoardData,
		visionMission,
		aboutNit,
		director,
		btech,
		mtech,
		msc,
		phd,
		gallery,
		departmentsRes,
		noticesRes
	] = await Promise.all([
		getDrupalData('/home', VID_ONLY),
		getDrupalData('/news-board', FILES_ONLY),
		getDrupalData('/about/vision-mission', IMG_ONLY),
		getDrupalData('/about/about-nit-manipur', IMG_ONLY),
		getDrupalData('/administration/director', IMG_ONLY),
		getDrupalData('/academics/academic-forms/btech', IMG_AND_FILES),
		getDrupalData('/academics/academic-forms/mtech', IMG_AND_FILES),
		getDrupalData('/academics/academic-forms/msc', IMG_AND_FILES),
		getDrupalData('/academics/academic-forms/phd', IMG_AND_FILES),
		getDrupalData('/gallery', GALLERY_INCLUDES),
		getDepartments(),
		getNotices(6, 0),
	]);

	const departments = departmentsRes.data.map((dept) => ({
		data: dept,
		link: dept.path || `/department/${dept.title.toLowerCase().replace(/\s+/g, '-')}`,
	}));

	const quickLinks = homeData?.editors?.[0] ? parseQuickLinks(homeData.editors[0]) : [];
	const placementCompanies = homeData?.editors?.[1] ? parseCompanyMarquee(homeData.editors[1]) : [];
	const placementStudents = homeData?.editors?.[2] ? parsePlacementTable(homeData.editors[2]) : [];


	const homeVideo = homeData?.videos?.[0]?.url || '/vid/nitDrone.mp4';
	const directorImg = director?.images?.[0]?.url || '/photo/nitDirector.png';
	const aboutImg = aboutNit?.images?.[0]?.url || '/photo/aboutNit.png';

	

	return (
		<>
			<main className="min-h-screen bg-[#013A33] text-white font-sans selection:bg-[#00FFCC] selection:text-[#002A28]">

				{/* --- SECTION 1: HERO & NOTICES --- */}
				<section className="relative w-full min-h-screen lg:h-[85vh] flex items-center justify-center overflow-hidden">
					{/* Background Video */}
					<video autoPlay muted loop playsInline className="absolute top-0 left-0 z-0 object-cover w-full h-full opacity-40">
						<source src={homeVideo} type="video/mp4" />
					</video>

					<div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#013A33] to-transparent z-0"></div>
				</section>

				{/* --- SECTION 2: QUICK LINKS MARQUEE --- */}
				<div className="bg-[#002A28] py-4 border-y border-[#006A58] overflow-hidden sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
					<div className="flex gap-16 whitespace-nowrap animate-marquee">
						{quickLinks.map((link, i) => (
							<Link key={i} href={link.href} className="text-[#00FFCC] font-bold text-lg hover:text-white transition-colors flex items-center gap-2">
								<span className="text-xs">⚡</span> {link.title}
							</Link>
						))}
						{/* Duplicate for seamless loop */}
						{quickLinks.map((link, i) => (
							<Link key={`dup-${i}`} href={link.href} className="text-[#00FFCC] font-bold text-lg hover:text-white transition-colors flex items-center gap-2">
								<span className="text-xs">⚡</span> {link.title}
							</Link>
						))}
					</div>
				</div>


				<section className='m-12'>
					<NoticeBoard notices={noticesRes.data as any} newsFiles={newsBoardData?.files} />
				</section>


				{/* --- SECTION 3: VISION, MISSION & ABOUT --- */}
				<section className="py-20 px-4 bg-[#013A33] m-12">
					<div className="flex flex-col-reverse items-stretch gap-10 mx-auto lg:flex-row">

						{/* Left: About Text */}
						<div style={{ backgroundImage: `url(${aboutImg})` }} className={`lg:w-1/2 flex flex-col justify-center bg-cover bg-center bg-no-repeat rounded-3xl overflow-hidden relative min-h-[500px] shadow-2xl group`}>
							<div className="absolute inset-0 bg-gradient-to-t from-[#001D1B] via-[#001D1B]/80 to-transparent p-8 md:p-12 flex flex-col justify-end">
								{/* <Image
                src={aboutImg}
                alt="About NIT"
                className="relative z-10 w-full rounded-2xl shadow-lg transform transition duration-500 hover:scale-[1.02]"
                width={100}
                height={100}
                unoptimized={process.env.NODE_ENV === 'development'}
              /> */}
								<h1 className="text-4xl md:text-5xl font-black mb-6 text-white group-hover:text-[#00FFCC] transition-colors">
									{aboutNit?.title || 'About NIT Manipur'}
								</h1>
								<p className="text-sm font-light leading-relaxed text-gray-200">
									{aboutNit?.homeDetails || 'Loading content...'}
								</p>
								<Link href="/about/about-nit-manipur" className="mt-6 text-[#00FFCC] font-bold uppercase tracking-widest hover:underline">
									Read More →
								</Link>
							</div>
						</div>

						{/* Right: Vision & Mission Cards */}
						<div className="flex flex-col gap-6 lg:w-1/2">
							{/* Vision */}
							<div className="flex-1 bg-white text-[#002A28] p-8 md:p-10 rounded-t-3xl rounded-br-3xl shadow-xl hover:-translate-y-2 transition-transform duration-300">
								<h2 className="text-4xl font-bold mb-4 border-b-4 border-[#002A28] inline-block pb-1">Vision</h2>
								<p className="text-lg font-medium leading-relaxed">
									{visionMission?.details || 'Vision loading...'}
								</p>
							</div>
							{/* Mission */}
							<div className="flex-1 bg-[#00463C] text-white p-8 md:p-10 rounded-b-3xl rounded-tl-3xl shadow-xl hover:-translate-y-2 transition-transform duration-300 border border-[#006A58]">
								<h2 className="inline-block pb-1 mb-4 text-4xl font-bold">Mission</h2>
								<div className="prose prose-invert max-w-none text-lg leading-relaxed
                                [&_ul]:list-none [&_li]:relative [&_li]:pl-8 [&_li]:mb-3
                                [&_li::before]:content-['➤'] [&_li::before]:absolute [&_li::before]:left-0 [&_li::before]:text-[#00FFCC]
                            ">
									{visionMission?.editor && (
										<div dangerouslySetInnerHTML={{ __html: visionMission.editor }} />
									)}
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* --- SECTION 4: DIRECTOR'S MESSAGE --- */}
				<section className="py-20 bg-[#002A28] relative">
					<div className="px-4 m-12">
						<h2 className="mb-16 text-5xl font-bold text-center text-white drop-shadow-lg">Director&apos;s Message</h2>

						<div className="flex flex-col lg:flex-row items-center gap-12 bg-[#013A33] rounded-3xl p-8 md:p-12 shadow-2xl border border-[#006A58]">
							<div className="relative lg:w-1/5">
								<div className="absolute inset-0 bg-[#00FFCC] blur-3xl opacity-10 rounded-full"></div>
								<Image
									src={directorImg}
									alt="Director"
									className="relative z-10 rounded-2xl shadow-lg transform transition duration-500 hover:scale-[1.02] h-[400px] w-auto"
									width={100}
									height={100}
									unoptimized={process.env.NODE_ENV === 'development'}
								/>
							</div>

							<div className="text-center lg:w-4/5 lg:text-left">
								<h3 className="text-3xl md:text-4xl font-bold mb-2 text-[#00FFCC]">
									{director?.title || 'Prof. D V L N Somayajulu'}
								</h3>
								<p className="mb-8 text-xl font-medium text-gray-400">Director, NIT Manipur</p>

								<p className="text-lg italic leading-relaxed text-gray-200">
									{director?.details}
								</p>

								<button className="mt-8 px-8 py-3 bg-transparent border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-[#002A28] transition-all">
									<Link href="/administration/director">View Profile</Link>
								</button>
							</div>
						</div>
					</div>
				</section>

				{/* --- SECTION 5: ADMISSION --- */}
				<section className="py-20 bg-[#013A33] px-4 max-w-7xl mx-auto">
					<h2 className="mb-4 text-5xl font-bold text-center text-white">Admission</h2>
					<div className="w-24 h-1 bg-[#00FFCC] mx-auto mb-10 rounded-full"></div>
					<AdmissionTabs
						btech={btech ? { title: btech.title, details: btech.details, fileLink: btech.files?.[0].url || '' } : null}
						mtech={mtech ? { title: mtech.title, details: mtech.details, fileLink: mtech.files?.[0].url || '' } : null}
						msc={msc ? { title: msc.title, details: msc.details, fileLink: msc.files?.[0].url || '' } : null}
						phd={phd ? { title: phd.title, details: phd.details, fileLink: phd.files?.[0].url || '' } : null}
					/>
				</section>

				{/* --- SECTION 6: DEPARTMENTS --- */}
				<section className="py-20 bg-[#002A28] px-4">
					<div className="mx-auto max-w-7xl">
						<h2 className="mb-16 text-5xl font-bold text-center text-white">Departments</h2>

						<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
							{departments.map((dept, index) => (
								<Link key={index} href={dept.link} className="group">
									<div className="relative h-80 rounded-2xl overflow-hidden shadow-lg transform transition duration-500 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(0,255,204,0.2)]">
										<div
											className="absolute inset-0 transition-transform duration-700 bg-center bg-cover group-hover:scale-110"
											style={{ backgroundImage: `url(${aboutImg})` }}
										></div>

										<div className="absolute inset-0 bg-gradient-to-t from-[#001D1B] via-[#001D1B]/70 to-transparent opacity-90 group-hover:opacity-100 transition-opacity"></div>

										<div className="absolute inset-0 flex flex-col justify-end p-8">
											<h3 className="text-2xl font-bold mb-2 text-white group-hover:text-[#00FFCC] transition-colors">
												{dept.data.title}
											</h3>
											<p className="text-sm text-gray-300 transition-all duration-500 translate-y-4 opacity-0 line-clamp-3 group-hover:translate-y-0 group-hover:opacity-100">
												{dept.data.details || 'Departmental details and curriculum information...'}
											</p>
										</div>

										<div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00FFCC] to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
									</div>
								</Link>
							))}
						</div>
					</div>
				</section>

				{/* --- PLACEMENT COMPANIES MARQUEE --- */}
				<div className="bg-[#002A28] py-4 border-y border-[#006A58] overflow-hidden sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
					<div className="flex gap-16 whitespace-nowrap animate-marquee">
						{placementCompanies.map((co, i) => (
							<span key={i} className="text-3xl font-black text-white tracking-tighter">{co}</span>
						))}
						{placementCompanies.map((co, i) => (
							<span key={`dup-${i}`} className="text-3xl font-black text-white tracking-tighter">{co}</span>
						))}
						{placementCompanies.map((co, i) => (
							<span key={`dup-${i}`} className="text-3xl font-black text-white tracking-tighter">{co}</span>
						))}
					</div>
				</div>

				{/* --- PLACEMENT STUDENT CARDS --- */}
				<section className="py-24 bg-[#013A33] overflow-hidden border-t border-[#006A58]/20">
					<div className="max-w-7xl mx-auto px-4 mb-20 text-center">
						<h2 className="mb-16 text-5xl font-bold text-center text-white">Placements</h2>
					</div>

					<div className="marquee-container">
						<div className="marquee-track my-10">
							{[...placementStudents, ...placementStudents].map((student, idx) => (
								<div key={idx} className="marquee-card mx-6">
									<div className="group w-[420px] bg-[#002A28] rounded-[3rem] overflow-hidden border border-[#006A58]/40 hover:border-[#00FFCC]/60 relative transition-all duration-500 hover:-translate-y-4 hover:shadow-[0_30px_60px_rgba(0,0,0,0.5)]">

										<div className="relative h-72 w-full overflow-hidden">
											{student.image && (
												<Image
													src={student.image}
													alt={student.name}
													fill
													className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
													sizes="420px"
													unoptimized={process.env.NODE_ENV === 'development'}
												/>
											)}
											<div className="absolute inset-0 bg-gradient-to-t from-[#002A28] via-transparent to-transparent" />

											{/* Placement Badge */}
											<div className="absolute top-8 right-8 bg-[#00FFCC] text-[#002A28] text-[12px] font-bold px-5 py-2 rounded-full uppercase tracking-[0.2em] shadow-xl z-20">
												{student.badge}
											</div>
										</div>

										{/* Content Section */}
										<div className="p-10 pt-8 relative -mt-10 bg-[#002A28] rounded-t-[3.5rem] border-t border-[#006A58]/50">
											<div className="flex items-center gap-3 mb-6">
												<span className="text-[#00FFCC] font-mono text-s font-bold px-3 py-1 rounded border border-[#00FFCC]/20 bg-[#00FFCC]/5">
													{student.company}
												</span>
												<span className="h-[1px] flex-grow bg-[#006A58]/50" />
											</div>

											<div className="min-h-[140px] flex flex-col justify-start">
												<h3 className="text-4xl font-black text-white mb-2 leading-[1.1] group-hover:text-[#00FFCC] transition-colors break-words">
													{student.name}
												</h3>
												<p className="text-2xl font-light text-gray-400">{student.package}</p>
											</div>

											<div className="bg-[#013A33] p-6 rounded-2xl border border-[#006A58]/30 mb-8 h-[100px] flex items-center">
												<p className="text-gray-300 text-sm leading-relaxed line-clamp-2 italic">
													&quot;{student.desc}&quot;
												</p>
											</div>

											<div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
												<span className="">{student.dept}</span>
												<span className="text-[#00FFCC]">Class of 2024</span>
											</div>
										</div>

										{/* Micro-interaction corner element */}
										<div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-br from-transparent to-[#00FFCC]/10 clip-path-poly group-hover:to-[#00FFCC]/30 transition-all" />
									</div>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* --- SECTION 7: GALLERY --- */}
				<section className="py-20 bg-[#013A33] flex flex-col items-center">
					{/* Gallery Title Capsule */}
					<h2 className="text-5xl font-bold text-center text-white">Gallery</h2>

					{/* Carousel Logic */}
					{gallery?.images && gallery.images.length > 0 ? (
						<div className="w-full max-w-[1600px]">
							<GalleryCarousel images={gallery.images.slice(0, 10)} />
						</div>
					) : (
						<p className="text-center text-gray-400">No images available</p>
					)}

					{/* Footer Link */}
					<Link
						href="/gallery"
						className="mt-4 text-2xl font-bold text-white hover:text-[#00FFCC] transition-colors relative group"
					>
						View More
						<span className="absolute -bottom-1 left-0 w-full h-[2px] bg-white group-hover:bg-[#00FFCC] transition-all"></span>
					</Link>
				</section>

				{/* --- SECTION 8: STATS BUBBLES --- */}
				{homeData && <StatsSection stats={homeData.stats} />}

			</main>
			{/* --- SECTION 9: FOOTER --- */}
			<Footer />
		</>
	);
}