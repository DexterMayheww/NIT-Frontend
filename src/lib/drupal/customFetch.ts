// lib/drupal/customFetch.ts
const DRUPAL_DOMAIN = (process.env.NEXT_PUBLIC_DRUPAL_DOMAIN || 'http://drupal-college-cms.ddev.site').replace(/\/$/, '');
console.log("DEBUG: Drupal Domain is set to:", DRUPAL_DOMAIN);

export interface FetchOptions extends RequestInit {
	params?: Record<string, string | string[]>;
}

/**
 * Custom fetch wrapper for Drupal JSON:API
 * Automatically prepends the Drupal domain and handles JSON:API format
 */
export async function drupalFetch<T>(
	endpoint: string,
	options: FetchOptions = {}
): Promise<{ data: T; status: number; headers: Headers }> {
	const { params, ...fetchOptions } = options;

	let url: string;
	if (endpoint.startsWith('http')) {
		url = endpoint;
	} else {
		// Ensure endpoint starts with / and normalize URL
		const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
		url = `${DRUPAL_DOMAIN}${normalizedEndpoint}`;
	}

	if (params) {
		const searchParams = new URLSearchParams();
		Object.entries(params).forEach(([key, value]) => {
			if (Array.isArray(value)) {
				value.forEach((v) => searchParams.append(key, v));
			} else {
				searchParams.append(key, value);
			}
		});
		const queryString = searchParams.toString();
		if (queryString) {
			// Check if url already has query params
			url += (url.includes('?') ? '&' : '?') + queryString;
		}
	}

	// Build headers - only include Content-Type for non-GET requests
	const method = fetchOptions.method || 'GET';
	const headers: HeadersInit = {
		Accept: 'application/vnd.api+json',
		...fetchOptions.headers,
	};

	// Only add Content-Type for requests with body (POST, PATCH, etc.)
	if (method !== 'GET' && method !== 'HEAD') {
		(headers as Record<string, string>)['Content-Type'] = 'application/vnd.api+json';
	}

	console.log(`[Drupal Fetch] ${method} ${url}`);

	const response = await fetch(url, {
		...fetchOptions,
		method,
		headers,
	});

	console.log(`[Drupal Fetch] Response status: ${response.status}`);

	let responseData: T;
	try {
		responseData = await response.json();
	} catch {
		responseData = null as T;
	}

	return {
		data: responseData,
		status: response.status,
		headers: response.headers,
	};
}

/**
 * Fetch a resource by its path alias using the decoupled router
 */
export async function fetchByPath<T>(
	path: string,
	options: FetchOptions = {}
): Promise<{ data: T; status: number; headers: Headers } | null> {
	try {
		const cleanPath = path.startsWith('/') ? path : `/${path}`;

		// 1. RESOLVE: Hit the Decoupled Router
		const routerUrl = `/router/translate-path?path=${encodeURIComponent(cleanPath)}`;
		const routerResponse = await drupalFetch<{
			jsonapi?: { individual?: string };
		}>(routerUrl, {
			next: options.next // Pass through revalidation settings
		});

		if (routerResponse.status !== 200 || !routerResponse.data?.jsonapi?.individual) {
			console.warn(`[fetchByPath] Route not found: ${cleanPath}`);
			return null;
		}

		// 2. FETCH INDIVIDUAL: Get the specific URL from the router response
		const individualUrl = routerResponse.data.jsonapi.individual;

		// IMPORTANT: We must pass the options (includes, etc.) to this second call
		// because the router's individual link is just the raw entity.
		return await drupalFetch<T>(individualUrl, options);
	} catch (error) {
		console.error(`[fetchByPath] Router error for: ${path}`, error);
		return null;
	}
}

/**
 * Get the full URL for a Drupal file/media
 */
export function getDrupalFileUrl(relativePath: string): string {
	if (!relativePath) return '';
	if (relativePath.startsWith('http')) return relativePath;
	return `${DRUPAL_DOMAIN}${relativePath}`;
}

/**
 * Get the Drupal domain
 */
export function getDrupalDomain(): string {
	return DRUPAL_DOMAIN;
}
