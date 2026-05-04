import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";
import { AUTH_SECRET } from "@/lib/authSecret";
import { authCookieNames, authCookieOptions, authHttpOnlyCookieOptions } from "@/lib/authCookies";

// Mock admin credentials
const MOCK_ADMIN = {
  username: "admin",
  password: "admin",
  name: "Administrateur",
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Nom d'utilisateur", type: "text" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        if (
          credentials.username === MOCK_ADMIN.username &&
          credentials.password === MOCK_ADMIN.password
        ) {
          return {
            id: "admin-1",
            name: MOCK_ADMIN.name,
            email: "admin@tunisietelecom.tn",
          };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name: authCookieNames.sessionToken,
      options: authHttpOnlyCookieOptions,
    },
    callbackUrl: {
      name: authCookieNames.callbackUrl,
      options: authCookieOptions,
    },
    csrfToken: {
      name: authCookieNames.csrfToken,
      options: authHttpOnlyCookieOptions,
    },
  },
  callbacks: {
    async jwt({ token, user }): Promise<JWT> {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }): Promise<Session> {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
  secret: AUTH_SECRET,
};

