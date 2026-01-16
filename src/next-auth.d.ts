import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      phone?: string | null
      otpVerified?: boolean
      role?: string
      id?: string
      accessToken?: string
    } & DefaultSession["user"]
  }

  interface User {
    phone?: string | null
    role?: string
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    phone?: string | null
    otpVerified?: boolean
    role?: string
    accessToken?: string
  }
}