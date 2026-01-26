// components/imageLoader.tsx
import { getDrupalDomain } from '@/lib/drupal/customFetch';
import { ImageLoaderProps } from 'next/image';

const DRUPAL_DOMAIN = getDrupalDomain();

export default function drupalImageLoader({ src, width, quality }: ImageLoaderProps): string {
    // If it's already an absolute URL, return as-is
    if (src.startsWith('http://') || src.startsWith('https://')) {
        return src;
    }

    // Otherwise prepend Drupal domain
    return `${DRUPAL_DOMAIN}${src}`;
}
