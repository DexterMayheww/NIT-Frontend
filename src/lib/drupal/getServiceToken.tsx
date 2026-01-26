// src/lib/drupal/getServiceToken.tsx

/**
 * Fetches a Client Credentials access token for system-level requests.
 * This allows the Next.js server to "log in" as a service account to bypass 403s.
 */
export async function getServiceAccessToken(): Promise<string | null> {
  const DRUPAL_DOMAIN = process.env.NEXT_PUBLIC_DRUPAL_DOMAIN?.replace(/\/$/, '');
  
  const response = await fetch(`${DRUPAL_DOMAIN}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.DRUPAL_CLIENT_ID || '',
      client_secret: process.env.DRUPAL_CLIENT_SECRET || '',
      scope: 'phone',
    }),
    cache: 'no-store', // Tokens should not be cached long-term in this fetch
  });

  if (!response.ok) {
    console.error("[OAuth] Failed to fetch service token", await response.text());
    return null;
  }

  const data = await response.json();
  return data.access_token;
}