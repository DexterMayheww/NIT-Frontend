'use client';

import { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getDrupalDomain } from '@/lib/drupal/customFetch';

interface NoticeProps {
    id: string;      // UUID
    nid?: number;    // Numeric ID for Drupal Backend (Ensure this is in your data fetch)
    title: string;
    date: string;
    bodyHtml: string;
}

export default function NoticeItem({ id, nid, title, date, bodyHtml }: NoticeProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const DRUPAL_DOMAIN = getDrupalDomain();

    const isAdmin = (session?.user as any)?.role === 'administrator';
    const csrfToken = (session?.user as any)?.accessToken;

    const processedHtml = useMemo(() => {
        return bodyHtml
            .replace(/src="\/sites/g, `src="${DRUPAL_DOMAIN}/sites`)
            .replace(/href="\/sites/g, `href="${DRUPAL_DOMAIN}/sites`);
    }, [bodyHtml, DRUPAL_DOMAIN]);

    /**
     * Requirement 1: Redirect to Drupal Backend Edit Page
     */
    const handleEditRedirect = () => {
        console.log("NID: ", nid);
        // Drupal backend paths use the numeric NID. 
        // If NID isn't provided, we fall back to the content overview.
        const editPath = nid
            ? `${DRUPAL_DOMAIN}/node/${nid}/edit`
            : `${DRUPAL_DOMAIN}/admin/content`;

        window.open(editPath, '_blank');
    };

    /**
     * Requirement 2: Implement Deletion via JSON:API
     */
    const handleDelete = async () => {
        const confirmed = window.confirm(`Are you sure you want to delete: "${title}"?`);
        if (!confirmed) return;

        setIsDeleting(true);

        try {
            const response = await fetch(`${DRUPAL_DOMAIN}/jsonapi/node/notice/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/vnd.api+json',
                    'X-CSRF-Token': csrfToken // Required for Drupal auth
                },
            });

            if (response.ok || response.status === 204) {
                alert("Notice deleted successfully.");
                router.refresh(); // Triggers Server Component re-fetch
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error("Delete failed:", errorData);
                alert(`Failed to delete: ${response.statusText}`);
            }
        } catch (error) {
            console.error("Network error during delete:", error);
            alert("A network error occurred. Check console.");
        } finally {
            setIsDeleting(false);
        }
    };

    const contentClasses = [
        "p-5 pt-0 border-t border-gray-100 text-gray-700 prose max-w-none",
        "[&_a]:text-blue-600 [&_a]:underline [&_a]:hover:text-blue-800",
        "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4",
        "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4",
        "[&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4 [&_blockquote]:text-gray-600",
        "[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-4 [&_img]:shadow-sm"
    ].join(" ");

    return (
        <div className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group relative ${isDeleting ? 'opacity-50 grayscale' : ''}`}>

            {/* Admin Controls Overlay */}
            {isAdmin && (
                <div className="absolute top-[50%] -translate-y-1/2 right-14 flex gap-2 z-20">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleEditRedirect(); }}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-3 py-1 rounded text-[10px] uppercase tracking-tighter transition-all"
                    >
                        Edit
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                        disabled={isDeleting}
                        className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-3 py-1 rounded text-[10px] uppercase tracking-tighter transition-all disabled:opacity-50"
                    >
                        {isDeleting ? '...' : 'Delete'}
                    </button>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-gray-50 transition-colors focus:outline-none"
                aria-expanded={isOpen}
            >
                <div className="flex-1 pr-4">
                    <h2 className={`text-xl font-bold transition-colors leading-tight ${isOpen ? 'text-blue-700' : 'text-gray-900'}`}>
                        {title}
                    </h2>
                    <p className="text-xs uppercase tracking-widest text-gray-400 mt-2 font-semibold">
                        {date}
                    </p>
                </div>

                <div className={`text-gray-300 transition-transform duration-500 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 9l6 6 6-6" />
                    </svg>
                </div>
            </button>

            <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className={contentClasses}>
                        <div dangerouslySetInnerHTML={{ __html: processedHtml }} />
                    </div>
                </div>
            </div>
        </div>
    );
}