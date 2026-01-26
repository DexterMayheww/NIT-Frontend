// src/lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getDrupalDomain } from "./drupal/customFetch";

if (process.env.NODE_ENV === 'development') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const DRUPAL_DOMAIN = getDrupalDomain();
const DRUPAL_API_BASE = DRUPAL_DOMAIN.replace(/\/$/, "");
const DRUPAL_ISSUER = `${DRUPAL_API_BASE}/`; 
const NEXTAUTH_URL = (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "");

/**
 * RESILIENT ROLE MAPPING
 * Checks Drupal Roles first. If missing, falls back to Email/Name patterns.
 */
const mapRole = (
    email?: string | null, 
    sub?: string | null, 
    roles: string[] = [], 
    name?: string | null
): string => {
    
    const safeRoles = roles.map(r => r.toLowerCase());
    const lowerEmail = email?.toLowerCase() || '';
    const lowerName = name?.toLowerCase() || '';

    // 1. Super Admin (Hardcoded or Explicit Role)
    if (lowerEmail === "admin@example.com" || sub === "1" || safeRoles.includes('administrator')) {
        return 'administrator';
    }

    // 2. Department Head (Role OR Pattern Match)
    // Checks if role exists OR if email/name starts with 'hod'
    if (
        safeRoles.some(r => ['hod', 'department_head', 'chairperson'].includes(r)) || 
        lowerEmail.startsWith('hod') || 
        lowerName.startsWith('hod')
    ) {
        return 'department_head';
    }

    // 3. Faculty (Role OR Pattern Match)
    if (
        safeRoles.some(r => ['faculty', 'teacher', 'professor'].includes(r)) ||
        lowerEmail.includes('faculty') ||
        lowerName.includes('faculty')
    ) {
        return 'faculty';
    }

    // 4. Staff
    if (safeRoles.includes('staff') || lowerEmail.includes('staff')) {
        return 'staff';
    }

    // 5. Default
    return 'faculty';
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
                    
                    try {
                        // Attempt to fetch roles and phone
                        const jsonApiUrl = `${DRUPAL_API_BASE}/jsonapi/user/user?filter[drupal_internal__uid]=${profile.sub}&include=roles`;
                        const extraDataRes = await fetch(jsonApiUrl, {
                            headers: { 
                                'Authorization': `Bearer ${context.tokens.access_token}`,
                                'Accept': 'application/vnd.api+json'
                            }
                        });

                        if (extraDataRes.ok) {
                            const data = await extraDataRes.json();
                            
                            let phone = data.data?.[0]?.attributes?.field_phone_number;
                            if (Array.isArray(phone)) phone = phone[0];
                            
                            const departmentId = data.data?.[0]?.relationships?.field_assigned_department?.data?.id || null;

                            const drupalRoles: string[] = [];
                            if (data.included) {
                                data.included.forEach((item: any) => {
                                    if (item.type === 'user_role' && item.attributes?.drupal_internal__id) {
                                        drupalRoles.push(item.attributes.drupal_internal__id);
                                    }
                                });
                            }

                            return { 
                                ...profile, 
                                phone_number: phone || null,
                                drupal_roles: drupalRoles,
                                department_id: departmentId
                            };
                        }
                    } catch (e) { 
                        console.error("OIDC Extra Data Fetch Error", e); 
                    }
                    
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
                    role: mapRole(profile.email, profile.sub, profile.drupal_roles || profile.roles, profile.name),
                    phone: profile.phone_number || null,
                    departmentId: profile.department_id || null,
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

                    // Fetch extra data for credentials login as well
                    const extraDataRes = await fetch(`${DRUPAL_API_BASE}/jsonapi/user/user?filter[drupal_internal__uid]=${loginData.current_user.uid}`, {
                        headers: { 'Accept': 'application/vnd.api+json' }
                    });
                    const extraData = await extraDataRes.json();
                    const departmentId = extraData.data?.[0]?.relationships?.field_assigned_department?.data?.id || null;

                    return {
                        id: loginData.current_user.uid,
                        name: loginData.current_user.name,
                        email: loginData.current_user.mail,
                        role: mapRole(
                            loginData.current_user.mail, 
                            loginData.current_user.uid, 
                            loginData.current_user.roles, 
                            loginData.current_user.name
                        ),
                        phone: null, 
                        departmentId: departmentId,
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
                token.departmentId = (user as any).departmentId;
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
                (session.user as any).departmentId = token.departmentId;
                (session.user as any).accessToken = token.accessToken;
                (session.user as any).otpVerified = token.otpVerified;
            }
            return session;
        }
    },
    pages: { signIn: '/login' },
    secret: process.env.NEXTAUTH_SECRET,
};