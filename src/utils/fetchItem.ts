// utils/fetchItem.ts
import { getNodeByPath } from '@/lib/drupal/generated';
import { ProcessedDrupalContent } from '@/types/drupal';

/**
 * Fetch Drupal content by URL path
 * Returns null if not found
 */
export async function fetchDrupalContent(
  path: string
): Promise<ProcessedDrupalContent | null> {
  const cleanPath = path === '/' || path === '' ? '/' : path;
  
  const { data, status } = await getNodeByPath(cleanPath, {
    next: { revalidate: 60 }, // Cache for 60 seconds
  });

  if (status === 404 || !data) {
    return null;
  }

  return data;
}

/**
 * Get the Drupal domain from environment
 */
export function getDrupalDomain(): string {
  return process.env.NEXT_PUBLIC_DRUPAL_DOMAIN || 'http://drupal-college-cms.ddev.site';
}
