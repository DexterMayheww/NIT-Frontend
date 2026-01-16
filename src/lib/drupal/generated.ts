// lib/drupal/generated.ts
// Drupal JSON:API client functions

import {
  DrupalJsonApiResponse,
  DrupalNode,
  DrupalNodeBase,
  DrupalIncluded,
  ProcessedDrupalContent,
  CalendarEvent,
} from '@/types/drupal';
import { drupalFetch, fetchByPath, getDrupalFileUrl } from './customFetch';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract file URLs from included resources
 */
function resolveMediaFromIncludes(
  relationship: { data: { type: string; id: string } | { type: string; id: string }[] | null } | undefined,
  included: DrupalIncluded[] | undefined,
  mediaType: 'image' | 'video'
): { url: string; alt: string; name: string }[] {
  if (!relationship?.data || !included) return [];

  const refs = Array.isArray(relationship.data) ? relationship.data : [relationship.data];
  const results: { url: string; alt: string; name: string }[] = [];

  for (const ref of refs) {
    // Find the media entity
    const media = included.find((inc) => inc.type === ref.type && inc.id === ref.id);
    if (!media) continue;

    // Find the file reference within the media
    const fileField = mediaType === 'image' ? 'field_media_image' : 'field_media_video_file';
    const fileRel = (media.relationships as Record<string, { data?: { type: string; id: string } }>)?.[fileField];
    if (!fileRel?.data) continue;

    // Find the file entity
    const file = included.find((inc) => inc.type === fileRel.data!.type && inc.id === fileRel.data!.id) as
      | (DrupalIncluded & { attributes: { uri?: { url: string } } })
      | undefined;
    if (!file?.attributes?.uri?.url) continue;

    results.push({
      url: getDrupalFileUrl(file.attributes.uri.url),
      alt: (media.attributes?.name as string) || '',
      name: (media.attributes?.name as string) || '',
    });
  }

  return results;
}

/**
 * Process a Drupal node into a simplified format
 */
export function processNode(
  node: DrupalNodeBase,
  included?: DrupalIncluded[]
): ProcessedDrupalContent {
  const attrs = node.attributes as any; // Cast as any to access custom fields easily

  const images = resolveMediaFromIncludes(node.relationships?.field_images, included, 'image');
  const videos = resolveMediaFromIncludes(node.relationships?.field_videos, included, 'video');

  // Resolve files
  const files: { url: string; filename: string }[] = [];
  if (node.relationships?.field_files?.data && included) {
    const fileRefs = Array.isArray(node.relationships.field_files.data)
      ? node.relationships.field_files.data
      : [node.relationships.field_files.data];

    for (const ref of fileRefs) {
      const file = included.find((inc) => inc.type === ref.type && inc.id === ref.id) as any;
      if (file?.attributes?.uri?.url) {
        files.push({
          url: getDrupalFileUrl(file.attributes.uri.url),
          filename: file.attributes.filename || '',
        });
      }
    }
  }

  return {
    id: node.id,
    nid: attrs.drupal_internal__nid, 
    title: attrs.title,
    path: attrs.path?.alias || null,
    details: attrs.field_details || null,
    homeDetails: attrs.field_home_details || null,
    editor: attrs.field_editor?.processed || attrs.body?.processed || null,
    images: images.map((img) => ({ url: img.url, alt: img.alt })),
    videos: videos.map((vid) => ({ url: vid.url, name: vid.name })),
    files,
    stats: {
      citations: attrs.field_citations ?? 0,
      staff: attrs.field_staff ?? 0,
      patents: attrs.field_patents ?? 0,
      phd_produced: attrs.field_phd_produced ?? 0,
      faculties: attrs.field_faculties ?? 0,
      publications: attrs.field_publications ?? 0,
      students: attrs.field_students ?? 0,
      departments: attrs.field_departments ?? 0,
    },
    createdAt: attrs.created,
    updatedAt: attrs.changed,
    raw: node,
  };
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * NEW: Path-to-Bundle Mapper
 * Maps URL patterns to Drupal Content Type (Bundle) machine names
 * Based on the typesFieldsDrupal.md architecture
 */
function resolveBundleFromPath(path: string): string {
  const cleanPath = path.replace(/\/$/, '');
  if (cleanPath.startsWith('/about')) return 'about_us_child';
  if (cleanPath.startsWith('/academics')) return 'academics_child';
  if (cleanPath.startsWith('/administration')) return 'administration_child';
  if (cleanPath.startsWith('/department')) return 'department_types';
  if (cleanPath.startsWith('/facilities')) return 'facility_child';
  if (cleanPath.startsWith('/employee-corner')) return 'employee_corner_child';
  if (cleanPath.startsWith('/outreach-activities')) return 'outreach_child';
  return 'page';
}

/**
 * Updated: Get a single node by its URL alias/path
 */
export async function getNodeByPath(
  path: string,
  options?: RequestInit
): Promise<{ data: ProcessedDrupalContent | null; status: number }> {
  
  // Standard inclusions for all pages
  const fetchOptions = {
    ...options,
  };

  // 1. Resolve and fetch the specific entity
  // Note: We expect a single DrupalNode, not an array
  const response = await fetchByPath<DrupalJsonApiResponse<DrupalNode>>(
    path, 
    fetchOptions
  );

  // 2. Error handling
  if (!response || response.status !== 200 || !response.data?.data) {
    console.error(`[getNodeByPath] Failed to fetch data for: ${path}`);
    return { data: null, status: response?.status || 404 };
  }

  // 3. Process the single node
  // In a collection fetch, data is an array. In an individual fetch, data is a single object.
  const node = response.data.data;

  return {
    data: processNode(node, response.data.included),
    status: 200,
  };
}

/**
 * Get nodes by content type
 */
export async function getNodesByType(
  contentType: string,
  params?: {
    limit?: number;
    offset?: number;
    sort?: string;
    include?: string;
  },
  options?: RequestInit
): Promise<{ data: ProcessedDrupalContent[]; total: number; status: number }> {
  const queryParams: Record<string, string> = {
    include: params?.include || 'field_images,field_images.field_media_image,field_videos,field_videos.field_media_video_file,field_files',
  };

  if (params?.limit) {
    queryParams['page[limit]'] = params.limit.toString();
  }
  if (params?.offset) {
    queryParams['page[offset]'] = params.offset.toString();
  }
  if (params?.sort) {
    queryParams['sort'] = params.sort;
  }

  const response = await drupalFetch<DrupalJsonApiResponse<DrupalNode[]>>(
    `/jsonapi/node/${contentType}`,
    { ...options, params: queryParams }
  );

  if (response.status !== 200 || !response.data?.data) {
    return { data: [], total: 0, status: response.status };
  }

  const nodes = response.data.data.map((node) => processNode(node, response.data.included));

  return {
    data: nodes,
    total: response.data.meta?.count || nodes.length,
    status: 200,
  };
}

/**
 * Get a single node by UUID
 */
export async function getNodeById(
  contentType: string,
  id: string,
  options?: RequestInit
): Promise<{ data: ProcessedDrupalContent | null; status: number }> {
  const response = await drupalFetch<DrupalJsonApiResponse<DrupalNode>>(
    `/jsonapi/node/${contentType}/${id}`,
    {
      ...options,
      params: {
        include: 'field_images,field_images.field_media_image,field_videos,field_videos.field_media_video_file,field_files',
      },
    }
  );

  if (response.status !== 200 || !response.data?.data) {
    return { data: null, status: response.status };
  }

  return {
    data: processNode(response.data.data, response.data.included),
    status: 200,
  };
}

/**
 * Get all notices (sorted by created date descending)
 * Note: Notice content type only has field_editor and field_parent_type, no media fields
 */
export async function getNotices(
  limit = 10,
  offset = 0,
  options?: RequestInit
): Promise<{ data: ProcessedDrupalContent[]; total: number; status: number }> {
  const queryParams: Record<string, string> = {
    'page[limit]': limit.toString(),
    'page[offset]': offset.toString(),
    sort: '-created',
  };

  const response = await drupalFetch<DrupalJsonApiResponse<DrupalNode[]>>(
    '/jsonapi/node/notice',
    { ...options, params: queryParams }
  );

  if (response.status !== 200 || !response.data?.data) {
    return { data: [], total: 0, status: response.status };
  }

  const nodes = response.data.data.map((node) => processNode(node, response.data.included));

  return {
    data: nodes,
    total: response.data.meta?.count || nodes.length,
    status: response.status,
  };
}

/**
 * Get child nodes by parent path pattern
 * Used for fetching children like /about/* or /department/*
 */
export async function getChildNodes(
  parentPath: string,
  contentType: string,
  options?: RequestInit
): Promise<{ data: ProcessedDrupalContent[]; status: number }> {
  // Use a collection fetch with a filter to find children
  const response = await drupalFetch<DrupalJsonApiResponse<DrupalNode[]>>(
    `/jsonapi/node/${contentType}`,
    {
      ...options,
      params: {
        'filter[path.alias][condition][path]': 'path.alias',
        'filter[path.alias][condition][operator]': 'STARTS_WITH',
        'filter[path.alias][condition][value]': `${parentPath}/`,
        'include': 'field_images,field_images.field_media_image',
        'sort': 'title',
      },
    }
  );

  if (response.status !== 200 || !response.data?.data) {
    return { data: [], status: response.status };
  }

  return { 
    data: response.data.data.map((node) => processNode(node, response.data.included)), 
    status: 200 
  };
}

/**
 * Get departments
 */
export async function getDepartments(
  options?: RequestInit
): Promise<{ data: ProcessedDrupalContent[]; status: number }> {
  return getChildNodes('/department', 'department_types', options).then((res) => ({
    data: res.data,
    status: res.status,
  }));
}

/**
 * Get gallery content
 */
export async function getGallery(
  options?: RequestInit
): Promise<{ data: ProcessedDrupalContent | null; status: number }> {
  return getNodeByPath('/gallery', options);
}

/**
 * Get calendar events for display on calendar
 */
export async function getCalendarEvents(
  year?: number,
  options?: RequestInit
): Promise<{ data: CalendarEvent[]; status: number }> {
  const queryParams: Record<string, string> = {
    include: 'field_images,field_images.field_media_image',
    sort: 'field_date',
  };

  // Filter by year if provided
  if (year) {
    queryParams['filter[field_date][condition][path]'] = 'field_date';
    queryParams['filter[field_date][condition][operator]'] = 'STARTS_WITH';
    queryParams['filter[field_date][condition][value]'] = `${year}`;
  }

  const response = await drupalFetch<DrupalJsonApiResponse<DrupalNode[]>>(
    '/jsonapi/node/calendar_event',
    { ...options, params: queryParams }
  );

  if (response.status !== 200 || !response.data?.data) {
    return { data: [], status: response.status };
  }

  const events: CalendarEvent[] = response.data.data.map((node) => {
    const attrs = node.attributes as any;
    const images = resolveMediaFromIncludes(node.relationships?.field_images, response.data.included, 'image');

    return {
      id: node.id,
      nid: attrs.drupal_internal__nid,
      title: attrs.title,
      date: attrs.field_date ? attrs.field_date.split('T')[0] : '', // Extract YYYY-MM-DD
      location: attrs.field_location || null,
      images: images.map((img) => ({ url: img.url, alt: img.alt })),
      editor: attrs.field_editor?.processed || attrs.body?.processed || null,
    };
  });

  return { data: events, status: 200 };
}
