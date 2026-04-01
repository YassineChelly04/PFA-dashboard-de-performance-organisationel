import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        employeeId: { label: "Numéro d'employé", type: 'text' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.employeeId || !credentials?.password) {
          return null
        }

        const technicien = await prisma.technicien.findUnique({
          where: { employeeId: credentials.employeeId },
        })

        if (!technicien) {
          return null
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          technicien.password
        )

        if (!isValidPassword) {
          return null
        }

        return {
          id: technicien.id,
          employeeId: technicien.employeeId,
          name: `${technicien.prenom} ${technicien.nom}`,
          email: technicien.email,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.employeeId = (user as any).employeeId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
        ;(session.user as any).employeeId = token.employeeId
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
