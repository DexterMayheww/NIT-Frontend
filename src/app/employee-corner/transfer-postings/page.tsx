import { getNodeByPath } from '@/lib/drupal/generated';
import { getDrupalDomain } from '@/lib/drupal/customFetch';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { parse } from 'node-html-parser';

interface AdministrativeOrder {
    type: string;
    date: string;
    href: string;
    rawTitle: string;
}

/**
 * PARSER: Logic to extract and structure "Transfers & Postings" data
 */
function parseOrders(html: string, domain: string): AdministrativeOrder[] {
    if (!html) return [];
    const root = parse(html);
    const listItems = root.querySelectorAll('li');

    return listItems.map(li => {
        const link = li.querySelector('a');
        const rawTitle = link?.text.trim() || li.text.trim();
        let href = link?.getAttribute('href') || "#";
        if (href.startsWith('/')) href = `${domain}${href}`;

        // Avant-Garde Split: Separating the Order Type from the Date
        // Pattern: "[Type] order dated [Date]"
        const parts = rawTitle.split(/dated/i);
        const type = parts[0]?.trim() || "Administrative Order";
        const date = parts[1]?.trim() || "N/A";

        return { type, date, href, rawTitle };
    });
}

export default async function TransferPostingsPage() {
    const DRUPAL_DOMAIN = getDrupalDomain();
    const { data, status } = await getNodeByPath('/employee-corner/transfer-postings');

    if (!data || status !== 200) {
        notFound();
    }

    const orders = parseOrders(data.editor || "", DRUPAL_DOMAIN);

    const employeeLinks = [
        { label: "APAR - Teaching", href: "/employee-corner/apar-formats/teaching" },
        { label: "APAR - Non-Teaching", href: "/employee-corner/apar-formats/non-teaching" },
        { label: "Forms", href: "/employee-corner/forms" },
        { label: "IPR Format", href: "/employee-corner/ipr-format" },
        { label: "No Due Certificate", href: "/employee-corner/no-due-certificate" },
        { label: "CPDA Guidelines", href: "/employee-corner/cdpa-guidelines" },
        { label: "Basic Approval Form", href: "/employee-corner/basic-approval-form" },
        { label: "Transfers & Postings", href: "/employee-corner/transfer-postings", active: true },
        { label: "Tours & Travels", href: "/employee-corner/tours-travels" },
    ];

    return (
        <>
            <main className="min-h-screen bg-[#002A28] pt-32 font-sans selection:bg-[#00FFCC] selection:text-[#002A28]">
                
                {/* --- HERO SECTION --- */}
                <div className="relative h-64 flex items-center mb-16 overflow-hidden bg-[#013A33]">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                    <div className="container mx-auto px-6 relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="w-8 h-[1px] bg-[#00FFCC]"></span>
                            <span className="text-[#00FFCC] font-mono text-[10px] uppercase tracking-[0.5em]">Establishment Section</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter">
                            Transfers & <br />Postings
                        </h1>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 pb-24 flex flex-col lg:flex-row gap-16">
                    
                    {/* --- MAIN CONTENT AREA --- */}
                    <div className="w-full lg:w-[70%] order-2 lg:order-1 flex flex-col gap-10">
                        
                        <div className="flex items-center justify-between border-b border-white/5 pb-6">
                            <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Official Order Log</h2>
                            <span className="bg-[#00FFCC] text-[#002A28] text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                Live Repository
                            </span>
                        </div>

                        <div className="flex flex-col gap-4">
                            {orders.length > 0 ? (
                                orders.map((order, idx) => (
                                    <a 
                                        key={idx}
                                        href={order.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex flex-col md:flex-row md:items-center justify-between bg-[#013A33] p-6 md:p-8 rounded-[1.5rem] border border-white/5 hover:border-[#00FFCC]/40 transition-all duration-300"
                                    >
                                        <div className="flex items-center gap-6">
                                            {/* Order Type Icon */}
                                            <div className="w-12 h-12 rounded-full bg-[#002A28] border border-white/10 flex items-center justify-center text-[#00FFCC] group-hover:scale-110 transition-transform">
                                                {order.type.toLowerCase().includes('posting') ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                                    </svg>
                                                )}
                                            </div>

                                            <div>
                                                <h4 className="text-lg font-bold text-gray-100 group-hover:text-white transition-colors">
                                                    {order.type}
                                                </h4>
                                                <p className="text-[#00FFCC] font-mono text-xs mt-1 uppercase tracking-widest">
                                                    Dated: {order.date}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 md:mt-0 flex items-center gap-4">
                                            <div className="h-px w-12 bg-white/5 hidden md:block"></div>
                                            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-white transition-colors">
                                                View Document
                                            </div>
                                            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-[#00FFCC] group-hover:text-[#002A28] transition-all">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                            </div>
                                        </div>
                                    </a>
                                ))
                            ) : (
                                <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
                                    <p className="text-gray-600 font-mono text-sm uppercase tracking-widest italic">No orders archived in this session.</p>
                                </div>
                            )}
                        </div>

                        {/* ARCHIVE NOTICE */}
                        <div className="mt-12 p-8 rounded-[2rem] border border-white/5 bg-[#002A28] group">
                            <p className="text-[11px] text-gray-500 leading-relaxed font-mono uppercase tracking-tight">
                                <span className="text-[#00FFCC] mr-2">●</span>
                                Notice: The orders displayed above are for internal institutional record-keeping. 
                                Physical copies of all transfer and posting orders are maintained within the 
                                Office of the Registrar, NIT Manipur. Discrepancies should be reported to the MIS cell.
                            </p>
                        </div>
                    </div>

                    {/* --- SIDEBAR --- */}
                    <Sidebar links={employeeLinks} />

                </div>
            </main>

            <Footer />
        </>
    );
}