// components/Footer.tsx
import React from 'react';

export function Footer() {
	const importantLinks = ['DST', 'AICTE', 'CAT', 'JAM', 'MoE', 'GATE', 'UGC Portal'];
	const policies = ['About Us', 'Sitemap', 'Webmail', 'Archive', 'Events', 'Contact'];
	const support = ['Current Students', 'Faculty/Staff', 'Alumni', 'Scholarships', 'Documentation'];
	const quickLinks = ['JoSAA-2025', 'CSAB-2025', 'CCMT-2025', 'MIS Login'];
	const socials = ['Facebook', 'Twitter', 'LinkedIn', 'YouTube'];

	return (
		<footer className="bg-[#001D1B] pt-20 pb-10 px-4 border-t border-[#006A58]">
			<div className="grid grid-cols-1 gap-10 m-12 my-0 text-sm text-gray-300 md:grid-cols-2 lg:grid-cols-5">

				{/* Column 1 */}
				<div>
					<h5 className="mb-6 text-lg font-bold tracking-wider text-white uppercase">Important Links</h5>
					<ul className="space-y-3">
						{importantLinks.map((item) => (
							<li key={item}>
								<a href="#" className="hover:text-[#00FFCC] transition-colors">➜ {item}</a>
							</li>
						))}
					</ul>
				</div>

				{/* Column 2 */}
				<div>
					<h5 className="mb-6 text-lg font-bold tracking-wider text-white uppercase">Policies</h5>
					<ul className="space-y-3">
						{policies.map((item) => (
							<li key={item}>
								<a href="#" className="hover:text-[#00FFCC] transition-colors">➜ {item}</a>
							</li>
						))}
					</ul>
				</div>

				{/* Column 3 */}
				<div>
					<h5 className="mb-6 text-lg font-bold tracking-wider text-white uppercase">Support</h5>
					<ul className="space-y-3">
						{support.map((item) => (
							<li key={item}>
								<a href="#" className="hover:text-[#00FFCC] transition-colors">➜ {item}</a>
							</li>
						))}
					</ul>
				</div>

				{/* Column 4: Quick Links */}
				<div>
					<h5 className="mb-6 text-lg font-bold tracking-wider text-white uppercase">Quick Links</h5>
					<ul className="space-y-3">
						{quickLinks.map((item) => (
							<li key={item}>
								<a href="#" className="hover:text-[#00FFCC] transition-colors">➜ {item}</a>
							</li>
						))}
					</ul>
				</div>

				{/* Column 5: Map & Contact */}
				<div className="lg:col-span-1">
					<h5 className="mb-6 text-lg font-bold tracking-wider text-white uppercase">Get in Touch</h5>
					<div className="mb-4 overflow-hidden border border-gray-700 rounded-xl">
						<iframe
							src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d25610.280287484427!2d93.89190788657771!3d24.833304317935617!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x37492882674dc4bf%3A0x9d4548feb7e9541d!2sNational%20Institute%20of%20Technology%2C%20Manipur!5e1!3m2!1sen!2sin!4v1761021556952!5m2!1sen!2sin"
							width="100%"
							height="150"
							style={{ border: 0 }}
							allowFullScreen
							loading="lazy"
							title="NIT Manipur Location"
						></iframe>
					</div>
					<div className="space-y-2 text-xs">
						<p className="flex items-center gap-2"><span className="text-[#00FFCC]">📍</span>Langol, Imphal-795004</p>
						<p className="flex items-center gap-2"><span className="text-[#00FFCC]">✉️</span>admin@nitmanipur.ac.in</p>
						<p className="flex items-center gap-2"><span className="text-[#00FFCC]">📞</span>0385-2445812</p>
					</div>
				</div>
			</div>

			<div className="mx-12 mt-16 pt-8 border-t border-[#006A58] flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
				<p>© {new Date().getFullYear()} NIT Manipur. All rights reserved.</p>
				<div className="flex gap-4 mt-4 md:mt-0">
					{socials.map((social) => (
						<a key={social} href="#" className="transition-colors hover:text-white">{social}</a>
					))}
				</div>
			</div>
		</footer>
	);
}