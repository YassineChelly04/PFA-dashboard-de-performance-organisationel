import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

const demoEmployeeId = process.env.DEMO_EMPLOYEE_ID ?? '88234'
const demoPassword = process.env.DEMO_PASSWORD ?? 'demo123'
const useSecureCookies = process.env.NODE_ENV === 'production'
const cookiePrefix = useSecureCookies ? '__Secure-agent-tt' : 'agent-tt'

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

        if (
          credentials.employeeId === demoEmployeeId &&
          credentials.password === demoPassword
        ) {
          const hashedPassword = await bcrypt.hash(demoPassword, 10)
          const demoTechnicien = await prisma.technicien.upsert({
            where: { employeeId: demoEmployeeId },
            update: {
              password: hashedPassword,
              nom: 'Ben Ali',
              prenom: 'Mohamed',
              email: 'mohamed.benali@tunisietelecom.tn',
            },
            create: {
              employeeId: demoEmployeeId,
              password: hashedPassword,
              nom: 'Ben Ali',
              prenom: 'Mohamed',
              email: 'mohamed.benali@tunisietelecom.tn',
            },
          })

          return {
            id: demoTechnicien.id,
            employeeId: demoEmployeeId,
            name: 'Mohamed Ben Ali',
            email: 'mohamed.benali@tunisietelecom.tn',
          }
        }

        let technicien = await prisma.technicien.findUnique({
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
        if ('employeeId' in user) {
          token.employeeId = user.employeeId
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.id) {
          session.user.id = token.id
        }
        if (token.employeeId) {
          session.user.employeeId = token.employeeId
        }
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
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
      },
    },
    callbackUrl: {
      name: `${cookiePrefix}.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
      },
    },
    csrfToken: {
      name: `${cookiePrefix}.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
