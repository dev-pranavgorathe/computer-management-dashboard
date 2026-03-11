import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import prisma from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit-logger'

// Type for user role (now a string in SQLite)
type UserRole = string

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'your@email.com' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        try {
          await prisma.$connect()

          // Find user in database
          const user = await prisma.user.findUnique({
            where: { 
              email: credentials.email.toLowerCase() 
            },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              role: true,
              isActive: true,
              isDeleted: true,
            }
          })
          
          if (!user) {
            throw new Error('Invalid email or password')
          }

          // Check if user is active and not deleted
          if (!user.isActive || user.isDeleted) {
            throw new Error('Account is not active')
          }

          // Verify password
          const isPasswordValid = await compare(credentials.password, user.password)
          
          if (!isPasswordValid) {
            throw new Error('Invalid email or password')
          }

          // Create audit log for login
          await createAuditLog({
            action: 'LOGIN',
            entityType: 'User',
            entityId: user.id,
            userId: user.id,
            changes: { email: user.email, loginTime: new Date().toISOString() }
          })

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error('Authentication error:', error)
          throw error
        } finally {
          await prisma.$disconnect()
        }
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || ''
        session.user.role = token.role as UserRole
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
  },
  pages: {
    signIn: '/auth/signin',
    newUser: '/auth/signup',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
