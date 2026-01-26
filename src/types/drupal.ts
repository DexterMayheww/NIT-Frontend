// app/types/drupal.ts
// TypeScript interfaces for Drupal JSON:API responses

export interface DrupalJsonApiResponse<T> {
  jsonapi: { version: string; meta?: Record<string, unknown> };
  data: T;
  included?: DrupalIncluded[];
  links?: DrupalLinks;
  meta?: { count?: number };
}

export interface DrupalLinks {
  self?: { href: string };
  next?: { href: string };
  prev?: { href: string };
}

export interface DrupalIncluded {
  type: string;
  id: string;
  attributes: DrupalAttributes;
  relationships?: Record<string, DrupalRelationship>;
}

export interface DrupalAttributes {
  filename: string;
  uri: { value: string; url: string }
  drupal_internal__id: string;
}

export interface DrupalRelationship {
  data: { type: string; id: string } | { type: string; id: string }[] | null;
  links?: { related?: { href: string } };
}

// Base node structure
export interface DrupalNodeBase {
  type: string;
  id: string;
  attributes: {
    drupal_internal__nid: number;
    title: string;
    created: string;
    changed: string;
    path?: { alias: string | null; pid: number | null; langcode: string };
    body?: { value: string; format: string; processed: string; summary: string };
    field_details?: string;
    field_editor?: { value: string; format: string; processed: string; summary: string };
    // ADD THESE: Institutional Stats Fields
    field_citations?: number;
    field_departments?: number;
    field_faculties?: number;
    field_patents?: number;
    field_phd_produced?: number;
    field_publications?: number;
    field_staff?: number;
    field_students?: number;
  };
  relationships?: {
    field_images?: DrupalRelationship;
    field_videos?: DrupalRelationship;
    field_files?: DrupalRelationship;
    field_parent_type?: DrupalRelationship;
  };
}

// Specific content type nodes
export interface DrupalAboutUsNode extends DrupalNodeBase {
  type: 'node--about_us' | 'node--about_us_child';
}

export interface DrupalAcademicsNode extends DrupalNodeBase {
  type: 'node--academics' | 'node--academics_child' | 'node--academic_course_forms';
}

export interface DrupalAdministrationNode extends DrupalNodeBase {
  type: 'node--administration' | 'node--administration_child';
}

export interface DrupalDepartmentNode extends DrupalNodeBase {
  type: 'node--department' | 'node--department_types';
}

export interface DrupalFacilitiesNode extends DrupalNodeBase {
  type: 'node--facilities' | 'node--facility_child';
}

export interface DrupalGalleryNode extends DrupalNodeBase {
  type: 'node--gallery';
}

export interface DrupalNoticesNode extends DrupalNodeBase {
  type: 'node--notices';
}

export interface DrupalNoticeNode extends DrupalNodeBase {
  type: 'node--notice';
}

export interface DrupalOutreachNode extends DrupalNodeBase {
  type: 'node--outreach_activities' | 'node--outreach_child' | 'node--cdbe_child';
}

export interface DrupalEmployeeCornerNode extends DrupalNodeBase {
  type: 'node--employee_corner' | 'node--employee_corner_child' | 'node--apar_formats_child' | 'node--employee_forms';
}

export interface DrupalContactUsNode extends DrupalNodeBase {
  type: 'node--contact_us';
}

// Union type for all nodes
export type DrupalNode =
  | DrupalAboutUsNode
  | DrupalAcademicsNode
  | DrupalAdministrationNode
  | DrupalDepartmentNode
  | DrupalFacilitiesNode
  | DrupalGalleryNode
  | DrupalNoticesNode
  | DrupalNoticeNode
  | DrupalOutreachNode
  | DrupalEmployeeCornerNode
  | DrupalContactUsNode
  | DrupalNodeBase;

// Media types
export interface DrupalMediaImage {
  type: 'media--image';
  id: string;
  attributes: {
    drupal_internal__mid: number;
    name: string;
  };
  relationships?: {
    field_media_image?: {
      data: { type: 'file--file'; id: string };
    };
  };
}

export interface DrupalMediaVideo {
  type: 'media--video';
  id: string;
  attributes: {
    drupal_internal__mid: number;
    name: string;
  };
  relationships?: {
    field_media_video_file?: {
      data: { type: 'file--file'; id: string };
    };
  };
}

export interface DrupalFile {
  type: 'file--file';
  id: string;
  attributes: {
    drupal_internal__fid: number;
    filename: string;
    uri: { value: string; url: string };
  };
}

// Helper type for processed content (after resolving includes)
export interface ProcessedDrupalContent {
  id: string;
  nid: number; // Changed to number to match Drupal internal
  title: string;
  path: string | null;
  details: string | null;
  homeDetails: string | null;
  editor: string | null;
  editors: string[],
  images: { url: string; alt: string }[];
  videos: { url: string; name: string }[];
  files: { url: string; filename: string }[];
  stats: {
    citations: number;
    departments: number;
    faculties: number;
    patents: number;
    phd_produced: number;
    publications: number;
    staff: number;
    students: number;
  };
  createdAt: string;
  updatedAt: string;
  raw: DrupalNode;
}

// Calendar Event Types
export interface DrupalCalendarEventNode extends DrupalNodeBase {
  type: 'node--calendar_event';
  attributes: DrupalNodeBase['attributes'] & {
    field_date: string; // ISO date string
    field_location?: string;
  };
}

export interface CalendarEvent {
  id: string;
  nid: number;
  title: string;
  date: string; // YYYY-MM-DD
  location: string | null;
  images: { url: string; alt: string }[];
  editor: string | null;
}