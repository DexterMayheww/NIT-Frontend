// components/RichText.tsx
import { getDrupalDomain } from '@/lib/drupal/customFetch';

interface RichTextProps {
    content: string;
}

export default function RichText({ content }: RichTextProps) {
    if (!content) return null;

    const DRUPAL_DOMAIN = getDrupalDomain();

    // Fix relative media paths from Drupal
    // Drupal typically uses /sites/default/files/ for media
    const processedHtml = content
        .replace(/src="\/sites/g, `src="${DRUPAL_DOMAIN}/sites`)
        .replace(/href="\/sites/g, `href="${DRUPAL_DOMAIN}/sites`);

    return (
        <div
            className="
        text-gray-700 leading-relaxed
        [&_p]:mb-4
        [&_a]:text-blue-600 [&_a]:underline [&_a]:font-medium [&_a]:hover:text-blue-800
        [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
        [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4
        [&_li]:mb-2
        [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:text-gray-900
        [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:text-gray-800
        [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2
        [&_blockquote]:border-l-4 [&_blockquote]:border-blue-200 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-6
        [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:shadow-md [&_img]:my-6
        [&_table]:w-full [&_table]:border-collapse [&_table]:mb-6
        [&_th]:bg-gray-100 [&_th]:border [&_th]:p-2 [&_th]:text-left
        [&_td]:border [&_td]:p-2
      "
            dangerouslySetInnerHTML={{ __html: processedHtml }}
        />
    );
}
