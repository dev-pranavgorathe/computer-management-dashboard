import type { NextAuthConfig } from "next-auth"

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/auth/signin",
  },
  providers: [], // Providers are added in [...nextauth]/route.ts
}

export default authConfig
