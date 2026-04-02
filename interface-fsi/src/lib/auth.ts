import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Mock supplier credentials for demo
const MOCK_SUPPLIERS = [
  { fstId: "FST001", password: "demo123", name: "Fournisseur Alpha" },
  { fstId: "FST002", password: "demo123", name: "Fournisseur Beta" },
  { fstId: "admin", password: "admin", name: "Administrateur FSI" },
];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        fstId: { label: "FST ID", type: "text" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.fstId || !credentials?.password) {
          return null;
        }

        const supplier = MOCK_SUPPLIERS.find(
          (s) =>
            s.fstId === credentials.fstId && s.password === credentials.password
        );

        if (supplier) {
          return {
            id: supplier.fstId,
            name: supplier.name,
            email: `${supplier.fstId}@fournisseur.tn`,
          };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/",
    error: "/",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.fstId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { fstId?: string }).fstId = token.fstId as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-change-in-production",
};
