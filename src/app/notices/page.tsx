// app/notices/page.tsx
import { getNotices, getNodeByPath } from '@/lib/drupal/generated';
import { getDrupalDomain } from '@/lib/drupal/customFetch';
import NoticeItem from '@/components/NoticeItem';

export default async function Page() {
    const DRUPAL_DOMAIN = getDrupalDomain();

    // 1. Try to fetch the Notices Container Node (optional)
    let containerTitle = 'Notices';
    try {
        const { data: containerData } = await getNodeByPath('/notices');
        if (containerData?.title) {
            containerTitle = containerData.title;
        }
    } catch (e) {
        console.error('Could not fetch notices container:', e);
    }

    // 2. Fetch Notice Items
    let notices: Awaited<ReturnType<typeof getNotices>>['data'] = [];
    let total = 0;
    let debugInfo: any = { drupalDomain: DRUPAL_DOMAIN, endpoint: '/jsonapi/node/notice' };

    try {
        const result = await getNotices(20, 0);
        notices = result.data;
        total = result.total;
        debugInfo.status = result.status;
        debugInfo.noticeCount = notices.length;
    } catch (e) {
        console.error('Could not fetch notices:', e);
        debugInfo.error = String(e);
    }

    return (
        <main className="bg-gray-50 min-h-screen">
            <div className="bg-white border-b">
                <div className="max-w-5xl mx-auto px-10 py-12 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900">{containerTitle}</h1>
                        <p className="text-gray-500 mt-2">Official announcements and circulars</p>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto p-10">
                <div className="space-y-6">
                    {notices.length > 0 ? (
                        notices.map((notice) => (
                            <NoticeItem
                                key={notice.id}
                                id={notice.id}
                                nid={notice.nid}
                                title={notice.title}
                                date={new Date(notice.createdAt).toLocaleDateString(undefined, {
                                    year: 'numeric', month: 'long', day: 'numeric'
                                })}
                                bodyHtml={notice.editor || '<p>No content available.</p>'}
                            />
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
                            <p>No active notices found.</p>
                            <p className="text-xs mt-4">
                                Trying to fetch from: <code className="bg-gray-100 px-2 py-1 rounded">{DRUPAL_DOMAIN}/jsonapi/node/notice</code>
                            </p>
                        </div>
                    )}
                </div>

                {/* Debug Section */}
                <details className="mt-20 border rounded-xl p-6 bg-white shadow-sm overflow-hidden" open>
                    <summary className="text-xs font-bold cursor-pointer uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors">
                        Data Audit: {notices.length} Items Found
                    </summary>
                    <div className="mt-6 space-y-4">
                        {notices.map((notice, index) => (
                            <div key={notice.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100 font-mono text-[10px] leading-relaxed">
                                <div className="flex justify-between border-b border-gray-200 pb-2 mb-2">
                                    <span className="text-blue-600 font-bold">NODE_{index + 1}</span>
                                    <span className="text-gray-400">{notice.id}</span>
                                </div>
                                <div className="grid grid-cols-[80px_1fr] gap-2">
                                    <span className="text-gray-400 italic">TITLE:</span>
                                    <span className="text-gray-900 font-bold uppercase">{notice.title}</span>
                                    
                                    <span className="text-gray-400 italic">CREATED:</span>
                                    <span className="text-gray-700">{notice.createdAt}</span>

                                    <span className="text-gray-400 italic">EDITOR_HTML:</span>
                                    <div className="text-gray-600 break-all bg-white p-2 border rounded border-gray-200 max-h-32 overflow-y-auto">
                                        {notice.editor || 'null'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </details>
            </div>
        </main>
    );
}

