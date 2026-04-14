import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    role: string
    tenantId: string | null
    passwordVerifiedAt: string | null
  }

  interface Session {
    user: {
      id: string
      role: string
      tenantId: string | null
      passwordVerifiedAt: string | null
    } & DefaultSession["user"]
  }
}
