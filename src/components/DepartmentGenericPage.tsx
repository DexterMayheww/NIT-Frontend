// src/components/DepartmentGenericPage.tsx

import { notFound } from 'next/navigation';
import { getDrupalData } from '@/lib/drupal/getDrupalData';
import { drupalFetch } from '@/lib/drupal/customFetch';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { parseGenericDepartmentContent } from '@/lib/parser';
import { ExternalLink, FileText, Download } from 'lucide-react';
import { DrupalJsonApiResponse } from '@/types/drupal';


interface Props {
    path: string;
    deptName?: string;
    deptSlug?: string;
    category?: string;
    mode?: 'generic' | 'faculty' | 'staff' | 'students';
}

export default async function DepartmentGenericPage({
    path,
    deptName = "Civil Engineering",
    deptSlug = "civil-engineering",
    category,
    mode = 'generic'
}: Props) {
    // 1. Fetch Auth & Department Node Info
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    // For all modes, we potentially need the dept UUID for permission checks
    const deptNodePath = `/department/${deptSlug}`;
    const deptNode = await getDrupalData(deptNodePath, '');
    if (!deptNode) {
        console.error(`[DepartmentGenericPage] Dept Node not found: ${deptNodePath}`);
        notFound();
    }
    const deptUuid = deptNode.id;

    // 2. Fetch Page-Specific Data
    let pageData: any = null;
    let users: any[] = [];
    let files: any[] = [];

    if (mode === 'faculty' || mode === 'staff') {
        const roleFilter = mode;
        const facultyRes = await drupalFetch<DrupalJsonApiResponse<any[]>>('/jsonapi/user/user', {
            params: {
                'filter[field_assigned_department.id]': deptUuid,
                'include': 'user_picture,roles',
            },
            authenticated: true,
            next: { revalidate: 0 }
        });

        const rawUsers = facultyRes.data?.data || [];
        const included = facultyRes.data?.included || [];

        // Fetch profile nodes to get aliases
        const profilesRes = await drupalFetch<DrupalJsonApiResponse<any[]>>('/jsonapi/node/profile_page', {
            params: {
                'filter[field_parent_type.id]': deptUuid,
            },
            authenticated: true,
            next: { revalidate: 0 }
        });
        const profiles = profilesRes.data?.data || [];

        // Build Maps
        const fileMap = included.reduce((acc: any, item) => {
            if (item.type === 'file--file') {
                acc[item.id] = item.attributes.uri.url;
            }
            return acc;
        }, {});

        const roleMap = included.reduce((acc: any, item) => {
            if (item.type === 'user_role--user_role') {
                acc[item.id] = item.attributes.drupal_internal__id;
            }
            return acc;
        }, {});

        users = rawUsers.map(u => {
            const rolesRel = u.relationships?.roles?.data || [];
            const userRoles = rolesRel.map((r: any) => {
                return r.meta?.drupal_internal__target_id || roleMap[r.id];
            });

            if (!userRoles.includes(roleFilter)) return null;

            const uid = u.attributes.drupal_internal__uid;
            const pictureId = u.relationships?.user_picture?.data?.id;

            // Permission Logic
            let canEdit = false;
            if (user) {
                if (user.role === 'administrator') {
                    canEdit = true;
                } else if (user.role === 'department_head' && user.departmentId === deptUuid) {
                    canEdit = true;
                } else if (user.role === roleFilter && String(user.id) === String(uid)) {
                    canEdit = true;
                }
            }

            // Link Logic: Find profile node for this user
            const profile = profiles.find(p => p.relationships?.field_profile_owner?.data?.id === u.id);
            const profilePath = profile?.attributes?.path?.alias || `/department/${deptSlug}/${mode}/${uid}`;

            return {
                id: u.id,
                uid: uid,
                display_name: u.attributes.display_name,
                mail: u.attributes.mail,
                designation: u.attributes.field_designation || (roleFilter === 'faculty' ? 'Faculty Member' : 'Staff Member'),
                image: resolvedUrlOrNull(pictureId, fileMap),
                canEdit: canEdit,
                profilePath: profilePath
            };
        }).filter(Boolean);

        pageData = {
            title: mode === 'faculty' ? 'Faculty' : 'Staff',
            nid: null
        };
    } else {
        // Generic content or Students (files)
        // Important: Pass 'field_files' include if mode is students
        const includes = (mode === 'students' || mode === 'generic') ? 'field_files' : '';
        pageData = await getDrupalData(path, includes);

        if (!pageData) {
            console.error(`[DepartmentGenericPage] Page Data not found: ${path}`);
            notFound();
        }
        files = pageData.files || [];
    }

    const nid = pageData.nid;
    const canEditPage = user && (
        user.role === 'administrator' ||
        (user.role === 'department_head' && user.departmentId === deptUuid)
    );

    return (
        <main className="min-h-screen bg-[#013A33] text-white font-sans">

            {/* Header Section */}
            <section className="relative pt-32 pb-20 px-12 border-b border-white/5">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-[#00FFCC]/5 to-transparent pointer-events-none" />

                <nav className="flex gap-4 mb-8 text-[10px] uppercase tracking-[0.3em] text-[#00FFCC]/60 font-mono">
                    <Link href={`/department/${deptSlug}`} className="hover:text-[#00FFCC]">Department</Link>
                    <span>/</span>
                    {category && (
                        <>
                            <span className="text-white uppercase">{category}</span>
                            <span>/</span>
                        </>
                    )}
                    <span className="text-white uppercase">{pageData.title}</span>
                </nav>

                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-6">
                    {pageData.title.split(' ').slice(0, -1).join(' ')} <span className="text-[#00FFCC]">{pageData.title.split(' ').slice(-1)}</span>
                </h1>
                <p className="text-gray-400 max-w-2xl font-light text-lg italic">
                    {mode === 'faculty' || mode === 'staff'
                        ? `Distinguished ${mode} members shaping the future of ${deptName} through technical excellence and dedication.`
                        : `Official information and resources regarding ${pageData.title.toLowerCase()} for the ${deptName} department.`}
                </p>
            </section>

            {/* Main Content Section */}
            <section className="py-24 px-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(#00FFCC 1px, transparent 0)', backgroundSize: '30px 30px' }} />

                <div className="max-w-7xl mx-auto relative z-10">

                    {/* GLOBAL EDIT BUTTON (Nodes only) */}
                    {mode !== 'faculty' && mode !== 'staff' && canEditPage && nid && (
                        <div className="flex justify-end mb-12">
                            <a
                                href={`https://dev-nit-backend.pantheonsite.io/node/${nid}/edit`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#00FFCC] text-[#013A33] px-6 py-2 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-white transition-all shadow-xl hover:-translate-y-1 flex items-center gap-2"
                            >
                                Edit Page Content
                                <ExternalLink size={14} />
                            </a>
                        </div>
                    )}

                    {/* RENDERING BLOCKS */}

                    {/* 1. USERS MODE (Faculty/Staff) */}
                    {(mode === 'faculty' || mode === 'staff') && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 relative z-10">
                            {users.length > 0 ? (
                                users.map((member: any) => (
                                    <div key={member.id} className="group relative">
                                        <div className="absolute -inset-2 border border-white/5 group-hover:border-[#00FFCC]/30 transition-colors duration-500 rounded-sm" />

                                        <div className="relative aspect-4/5 overflow-hidden mb-6 bg-[#002A28] block">
                                            <Link href={member.profilePath} className="absolute inset-0 z-10">
                                                {member.image ? (
                                                    <Image
                                                        src={`${process.env.NEXT_PUBLIC_DRUPAL_DOMAIN}${member.image}`}
                                                        alt={member.display_name}
                                                        fill
                                                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center opacity-20 text-[10px] uppercase tracking-widest font-mono">No Portrait</div>
                                                )}
                                            </Link>

                                            {member.canEdit && (
                                                <div className="absolute top-4 right-4 z-20">
                                                    <a
                                                        href={`https://dev-nit-backend.pantheonsite.io/user/${member.uid}/edit`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="bg-[#00FFCC] text-[#013A33] px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-colors shadow-lg"
                                                    >
                                                        Edit Profile
                                                    </a>
                                                </div>
                                            )}
                                            <div className="absolute top-0 right-0 w-8 h-8 bg-[#013A33] translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-l border-white/10 z-20" />
                                        </div>

                                        <div className="relative">
                                            <Link href={member.profilePath}>
                                                <h3 className="text-2xl font-bold uppercase tracking-tight group-hover:text-[#00FFCC] transition-colors">
                                                    {member.display_name}
                                                </h3>
                                            </Link>
                                            <p className="text-[#00FFCC]/60 font-mono text-[14px] uppercase tracking-widest mb-1">
                                                {member.designation}
                                            </p>
                                            <p className="text-[#00FFCC]/60 font-mono text-[10px] uppercase tracking-widest mb-4">
                                                {deptName}
                                            </p>
                                            <div className="pt-4 border-t border-white/5 flex flex-col gap-2">
                                                <a href={`mailto:${member.mail}`} className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 bg-[#00FFCC] rounded-full" />
                                                    {member.mail}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-lg">
                                    <p className="text-gray-500 font-mono uppercase tracking-widest">No data found for this role.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 2. STUDENTS MODE (Files) */}
                    {mode === 'students' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
                            <div className="lg:col-span-1">
                                <h2 className="text-3xl font-bold uppercase tracking-tight mb-8">Resources</h2>
                                <div className="h-1 w-20 bg-[#00FFCC] mb-8" />
                                <p className="text-gray-400 font-light leading-relaxed mb-8">
                                    Official documents and academic resources provided to assist students within the department.
                                </p>
                            </div>

                            <div className="lg:col-span-2 w-full">
                                <div className="bg-[#002A28]/50 backdrop-blur-sm border border-white/5 rounded-sm p-4 md:p-8 shadow-2xl">
                                    {files.length > 0 ? (
                                        <div className="space-y-4">
                                            {files.map((file, idx) => (
                                                <div key={idx} className="group/item flex items-center justify-between p-5 bg-white/5 border border-white/5 hover:border-[#00FFCC]/30 hover:bg-[#00FFCC]/5 transition-all duration-300 rounded-sm">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-12 h-12 flex items-center justify-center bg-[#013A33] border border-white/10 group-hover/item:border-[#00FFCC]/50 transition-colors">
                                                            <FileText className="text-[#00FFCC]" size={24} />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-bold group-hover/item:text-[#00FFCC] transition-colors">{file.filename}</h3>
                                                            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-mono mt-1">Resource Document</p>
                                                        </div>
                                                    </div>
                                                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-[#00FFCC] hover:text-[#013A33] transition-all rounded-full border border-white/10"><Download size={18} /></a>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-20 text-center border border-dashed border-white/10 rounded-lg">
                                            <p className="text-gray-500 font-mono uppercase tracking-widest text-sm">No files uploaded.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3. GENERIC MODE (Tables/Text) */}
                    {mode === 'generic' && (
                        <div className="space-y-24">
                            {parseGenericDepartmentContent(pageData.editor || pageData.body || '').map((section, idx) => (
                                <div key={idx} className="flex flex-col lg:flex-row gap-16 items-start">
                                    <div className="lg:w-1/3">
                                        <h2 className="text-3xl font-bold uppercase tracking-tight mb-8">
                                            {section.title || pageData.title}
                                        </h2>
                                        <div className="h-1 w-20 bg-[#00FFCC] mb-8" />
                                    </div>

                                    <div className="lg:w-2/3 w-full">
                                        <div className="relative group">
                                            <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-[#00FFCC]/40" />
                                            <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-[#00FFCC]/40" />

                                            <div className="bg-[#002A28]/50 backdrop-blur-sm border border-white/5 p-1 rounded-sm overflow-x-auto shadow-2xl">
                                                <div
                                                    className="prose prose-invert max-w-none 
														[&_table]:w-full [&_table]:border-collapse
														[&_thead]:bg-[#00FFCC]/10
														[&_th]:py-5 [&_th]:px-6 [&_th]:text-[#00FFCC] [&_th]:text-[11px] [&_th]:uppercase [&_th]:tracking-[0.2em] [&_th]:font-black [&_th]:text-left [&_th]:border-b [&_th]:border-white/20
														[&_td]:py-6 [&_td]:px-6 [&_td]:text-gray-300 [&_td]:border-b [&_td]:border-white/5 [&_td]:text-[15px] [&_td]:font-light
														[&_tr:hover]:bg-white/2 [&_tr]:transition-colors
														[&_td:first-child]:text-white [&_td:first-child]:font-bold [&_td:first-child]:tracking-tight [&_td:first-child]:text-base"
                                                    dangerouslySetInnerHTML={{ __html: section.content }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {files.length > 0 && (
                                <div className="flex flex-col lg:flex-row gap-16 items-start pt-12 border-t border-white/5">
                                    <div className="lg:w-1/3">
                                        <h2 className="text-3xl font-bold uppercase tracking-tight mb-8">
                                            Attachments
                                        </h2>
                                        <div className="h-1 w-20 bg-[#00FFCC] mb-8" />
                                        <p className="text-gray-400 font-light text-sm italic">
                                            Supplementary documents and resources related to this page.
                                        </p>
                                    </div>

                                    <div className="lg:w-2/3 w-full">
                                        <div className="bg-[#002A28]/50 backdrop-blur-sm border border-white/5 rounded-sm p-4 md:p-8 shadow-2xl">
                                            <div className="space-y-4">
                                                {files.map((file, idx) => (
                                                    <div key={idx} className="group/item flex items-center justify-between p-5 bg-white/5 border border-white/5 hover:border-[#00FFCC]/30 hover:bg-[#00FFCC]/5 transition-all duration-300 rounded-sm">
                                                        <div className="flex items-center gap-5">
                                                            <div className="w-12 h-12 flex items-center justify-center bg-[#013A33] border border-white/10 group-hover/item:border-[#00FFCC]/50 transition-colors">
                                                                <FileText className="text-[#00FFCC]" size={24} />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-lg font-bold group-hover/item:text-[#00FFCC] transition-colors">{file.filename}</h3>
                                                                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-mono mt-1">Resource Document</p>
                                                            </div>
                                                        </div>
                                                        <a href={file.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-[#00FFCC] hover:text-[#013A33] transition-all rounded-full border border-white/10">
                                                            <Download size={18} />
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </section>

            <Footer />
        </main >
    );
}

// Helper to avoid repetitive logic in map
function resolvedUrlOrNull(id: string | null, map: any) {
    if (!id) return null;
    return map[id] || null;
}
