// src/lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getDrupalDomain } from "./drupal/customFetch";

if (process.env.NODE_ENV === 'development') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const DRUPAL_DOMAIN = getDrupalDomain();
const DRUPAL_API_BASE = (process.env.NEXT_PUBLIC_DRUPAL_DOMAIN || "https://drupal-college-cms.ddev.site").replace(/\/$/, "");
const DRUPAL_ISSUER = `${DRUPAL_API_BASE}/`; 
const NEXTAUTH_URL = (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "");

/**
 * ADMINISTRATIVE OVERRIDE LOGIC
 * Since Drupal OIDC is not returning roles, we identify the admin by identity.
 */
const isAdminIdentity = (email?: string | null, sub?: string | null, roles?: string[]) => {
    const ADMIN_EMAIL = "admin@example.com";
    const ADMIN_UID = "1";

    // Check 1: By Email
    if (email === ADMIN_EMAIL) return true;
    // Check 2: By Drupal UID (the 'sub' claim in OIDC)
    if (sub === ADMIN_UID) return true;
    // Check 3: By explicit role array (from Credentials login)
    if (roles?.includes('administrator')) return true;

    return false;
};

const mapRole = (email?: string | null, sub?: string | null, roles?: string[]): string => {
    return isAdminIdentity(email, sub, roles) ? 'administrator' : 'student';
};

export const authOptions: NextAuthOptions = {
    providers: [
        {
            id: "drupal",
            name: "Drupal OAuth",
            type: "oauth",
            version: "2.0",
            wellKnown: `${NEXTAUTH_URL}/api/mock-discovery`,
            authorization: {
                url: `${DRUPAL_API_BASE}/oauth/authorize`,
                params: { scope: "openid email profile phone" }
            },
            token: `${DRUPAL_API_BASE}/oauth/token`,
            userinfo: {
                async request(context) {
                    const profileRes = await fetch(`${DRUPAL_API_BASE}/oauth/userinfo`, {
                        headers: { 'Authorization': `Bearer ${context.tokens.access_token}` }
                    });
                    const profile = await profileRes.json();
                    
                    // JSON:API fetch for phone number remains the same
                    try {
                        const jsonApiUrl = `${DRUPAL_API_BASE}/jsonapi/user/user?filter[drupal_internal__uid]=${profile.sub}`;
                        const phoneRes = await fetch(jsonApiUrl, {
                            headers: { 
                                'Authorization': `Bearer ${context.tokens.access_token}`,
                                'Accept': 'application/vnd.api+json'
                            }
                        });
                        if (phoneRes.ok) {
                            const phoneData = await phoneRes.json();
                            let phone = phoneData.data?.[0]?.attributes?.field_phone_number;
                            if (Array.isArray(phone)) phone = phone[0];
                            return { ...profile, phone_number: phone || null };
                        }
                    } catch (e) { console.error("OIDC Phone Fetch Error", e); }
                    
                    return profile;
                }
            },
            issuer: DRUPAL_ISSUER,
            idToken: true,
            checks: ["pkce", "state"],
            clientId: process.env.DRUPAL_CLIENT_ID,
            clientSecret: process.env.DRUPAL_CLIENT_SECRET,
            client: { id_token_signed_response_alg: 'RS256' },
            profile(profile) {
                return {
                    id: profile.sub,
                    name: profile.name,
                    email: profile.email,
                    // Identity-based role mapping
                    role: mapRole(profile.email, profile.sub, profile.roles),
                    phone: profile.phone_number || null,
                };
            },
        },
        CredentialsProvider({
            name: "Drupal",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                try {
                    const loginRes = await fetch(`${DRUPAL_DOMAIN}/user/login?_format=json`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: credentials.email, pass: credentials.password })
                    });
                    const loginData = await loginRes.json();
                    if (!loginRes.ok || !loginData.current_user) return null;

                    return {
                        id: loginData.current_user.uid,
                        name: loginData.current_user.name,
                        email: loginData.current_user.mail,
                        // Consistently use the same identity mapping
                        role: mapRole(loginData.current_user.mail, loginData.current_user.uid, loginData.current_user.roles),
                        phone: null, // Phone usually handled via separate fetch or OIDC
                    };
                } catch (e) { return null; }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, account, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.phone = (user as any).phone;
                token.email = user.email;
                token.otpVerified = false;
            }
            if (account) token.accessToken = account.access_token;
            if (trigger === "update" && session?.otpVerified) token.otpVerified = true;
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
                (session.user as any).phone = token.phone;
                (session.user as any).accessToken = token.accessToken;
                (session.user as any).otpVerified = token.otpVerified;
            }
            return session;
        }
    },
    pages: { signIn: '/login' },
    secret: process.env.NEXTAUTH_SECRET,
};