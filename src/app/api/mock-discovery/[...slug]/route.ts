// app/api/mock-discovery/[...slug]/route.ts
import { NextResponse } from 'next/server';
import { getDrupalDomain } from '@/lib/drupal/customFetch';

export async function GET() {
  // CRITICAL: Matches the error log "got: https://drupal-college-cms.ddev.site/"
  // We hardcode the slash to ensure they match perfectly.
  const DRUPAL_DOMAIN = getDrupalDomain(); 

  return NextResponse.json({
    // The issuer must match the 'iss' claim in the token EXACTLY (including trailing slash if present)
    issuer: `${DRUPAL_DOMAIN}/`, 
    
    authorization_endpoint: `${DRUPAL_DOMAIN}/oauth/authorize`,
    token_endpoint: `${DRUPAL_DOMAIN}/oauth/token`,
    userinfo_endpoint: `${DRUPAL_DOMAIN}/oauth/userinfo`,
    jwks_uri: `${DRUPAL_DOMAIN}/oauth/jwks`,
    
    scopes_supported: ["openid", "email", "profile", "phone"],
    response_types_supported: ["code"],
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["RS256"],
    claims_supported: ["sub", "email", "name", "phone_number", "roles"]
  });
}