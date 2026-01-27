import { fetchDrupalContent } from '@/utils/fetchItem';
import { getChildNodes } from '@/lib/drupal/generated';
import { getDrupalDomain, drupalFetch, getDrupalFileUrl } from '@/lib/drupal/customFetch';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ProfilePage from '@/components/ProfilePage';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { parseProfileEditor } from '@/lib/parser';
import { DrupalJsonApiResponse } from '@/types/drupal';

interface DrupalPageProps {
    slug: string[];
}

export default async function DrupalPage({ slug }: DrupalPageProps) {
    const path = `/${slug.join('/')}`;
    const DRUPAL_DOMAIN = getDrupalDomain();

    const data = await fetchDrupalContent(path);
    if (!data) return notFound();

    /**
     * Bespoke Child Mapping
     * Determines which content types belong to the current section
     */
    let childContentType = '';
    const section = `/${slug[0]}`;

    // Only fetch children if we are at the top-level section page
    if (slug.length === 1) {
        if (section === '/about') childContentType = 'about_us_child';
        else if (section === '/academics') childContentType = 'academics_child';
        else if (section === '/administration') childContentType = 'administration_child';
        else if (section === '/department') childContentType = 'department_types';
        else if (section === '/facilities') childContentType = 'facility_child';
        else if (section === '/employee-corner') childContentType = 'employee_corner_child';
        else if (section === '/outreach-activities') childContentType = 'outreach_child';
    }
    // Handle specific nested children if needed
    else if (path === '/academics/academic-forms') childContentType = 'academic_course_forms';
    else if (path === '/employee-corner/apar-formats') childContentType = 'apar_formats_child';
    else if (path === '/employee-corner/forms') childContentType = 'employee_forms';

    let children: { id: string; title: string; path: string | null }[] = [];
    if (childContentType) {
        try {
            const childRes = await getChildNodes(path, childContentType);
            children = childRes.data.map((c) => ({
                id: c.id,
                title: c.title,
                path: c.path,
            }));
        } catch (e) {
            console.error("Error fetching children:", e);
        }
    }

    // Process rich text content
    let processedHtml = data.editor || '';
    if (processedHtml) {
        processedHtml = processedHtml
            .replace(/src="\/sites/g, `src="${DRUPAL_DOMAIN}/sites`)
            .replace(/href="\/sites/g, `href="${DRUPAL_DOMAIN}/sites`);
    }

    // Handle Profile Page specifically
    if (data.raw.type === 'node--profile_page' || data.raw.type === 'node--faculty_profile' || data.raw.type === 'profile_page') {
        const session = await getServerSession(authOptions);
        const user = session?.user as Record<string, unknown>;
        const profileAttrs = data.raw.attributes as Record<string, any>;
        const profileRels = data.raw.relationships as Record<string, any>;

        // Permissions logic
        let canEdit = false;
        const profileOwnerId = profileRels.field_profile_owner?.data?.id;
        const profileDeptId = profileRels.field_parent_type?.data?.id;

        // Fetch User Picture from /jsonapi/user/user
        let userPictureUrl = data.images?.[0]?.url || null;
        if (profileOwnerId) {
            const userRes = await drupalFetch<DrupalJsonApiResponse<any>>(`/jsonapi/user/user/${profileOwnerId}`, {
                params: { 'include': 'user_picture' },
                authenticated: true
            });

            if (userRes.data?.included) {
                const picture = userRes.data.included.find((inc: any) => inc.type === 'file--file');
                if (picture?.attributes?.uri?.url) {
                    userPictureUrl = getDrupalFileUrl(picture.attributes.uri.url);
                }
            }
        }

        if (user) {
            if (user.role === 'administrator') {
                canEdit = true;
            } else if (user.role === 'department_head' && String(user.departmentId) === String(profileDeptId)) {
                canEdit = true;
            } else if (String(user.id) === String(profileOwnerId)) {
                canEdit = true;
            }
        }

        const profileData = {
            title: data.title,
            details: data.details,
            image: userPictureUrl,
            email: profileAttrs.field_email || (data.details?.match(/Email: ([\w.-]+@[\w.-]+\.\w+)/)?.[1]) || null,
            designation: profileAttrs.field_designation || null,
            department: slug[1]?.replace(/-/g, ' ') || 'Department',
            departmentSlug: slug[1] || 'civil-engineering',
            sections: parseProfileEditor(data.editor || '') as Record<string, string>,
            canEdit,
            editUrl: `${DRUPAL_DOMAIN}/node/${data.nid}/edit`,
        };

        return <ProfilePage data={profileData} />;
    }

    return (
        <main className="min-h-screen bg-white">
            <div className="bg-slate-50 border-b py-16 px-10">
                <div className="max-w-5xl mx-auto">
                    <nav className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">
                        {slug.join(' / ')}
                    </nav>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">{data.title}</h1>
                    {data.details && (
                        <p className="text-xl text-slate-600 italic border-l-4 border-blue-500 pl-6 max-w-3xl">{data.details}</p>
                    )}
                </div>
            </div>

            <div className="max-w-5xl mx-auto p-10">
                {/* SUB-NAVIGATION MENU */}
                {children.length > 0 && (
                    <div className="mb-16">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Related Sections</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {children.map((child) => (
                                <Link
                                    key={child.id}
                                    href={child.path || '#'}
                                    className="p-4 border border-slate-200 rounded-lg flex justify-between items-center group hover:bg-blue-50 hover:border-blue-300 transition"
                                >
                                    <span className="font-bold text-slate-700 group-hover:text-blue-700">{child.title}</span>
                                    <span className="text-slate-300 group-hover:translate-x-1 transition-transform">→</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Images */}
                {!path.includes('gallery') && data.images?.length > 0 && (
                    <div className="grid grid-cols-1 gap-6 mb-12">
                        {data.images.map((img, i) => (
                            <div key={i} className="relative w-full h-125">
                                <Image
                                    src={img.url}
                                    alt={img.alt || ''}
                                    fill
                                    className="rounded-xl shadow-lg object-cover"
                                    unoptimized
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Rich Text Editor Content */}
                {processedHtml && (
                    <div
                        className="
                            text-gray-800 leading-relaxed text-lg
                            [&_p]:mb-6 [&_a]:text-blue-600 [&_a]:underline
                            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-6
                            [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-6
                            [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-4
                            [&_img]:rounded-lg [&_img]:my-6
                        "
                        dangerouslySetInnerHTML={{ __html: processedHtml }}
                    />
                )}

                {/* Gallery Items */}
                {path.includes('gallery') && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {data.images?.map((img, i) => (
                            <div key={i} className="relative aspect-square">
                                <Image
                                    src={img.url}
                                    alt={img.alt || ''}
                                    fill
                                    className="object-cover rounded-lg shadow hover:scale-105 transition duration-300"
                                    unoptimized
                                />
                            </div>
                        ))}
                        {data.videos?.map((vid, i) => (
                            <video key={i} controls className="rounded-lg bg-black"><source src={vid.url} /></video>
                        ))}
                    </div>
                )}

                {/* Files Download */}
                {data.files && data.files.length > 0 && (
                    <div className="mt-12">
                        <h3 className="text-lg font-bold text-gray-700 mb-4">Downloads</h3>
                        <ul className="space-y-2">
                            {data.files.map((file, i) => (
                                <li key={i}>
                                    <a
                                        href={file.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline flex items-center gap-2"
                                    >
                                        📄 {file.filename}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <details className="mt-32 opacity-20 border-t pt-8">
                    <summary className="cursor-pointer text-xs font-mono uppercase">Debug: Current Item</summary>
                    <pre className="text-xs overflow-auto bg-gray-50 p-4 mt-4">{JSON.stringify(data, null, 2)}</pre>
                </details>
            </div>
        </main>
    );
}

