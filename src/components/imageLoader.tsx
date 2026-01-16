// components/imageLoader.tsx
import { ImageLoaderProps } from 'next/image';

const DRUPAL_DOMAIN = process.env.NEXT_PUBLIC_DRUPAL_DOMAIN || 'http://drupal-college-cms.ddev.site';

export default function drupalImageLoader({ src, width, quality }: ImageLoaderProps): string {
    // If it's already an absolute URL, return as-is
    if (src.startsWith('http://') || src.startsWith('https://')) {
        return src;
    }

    // Otherwise prepend Drupal domain
    return `${DRUPAL_DOMAIN}${src}`;
}
