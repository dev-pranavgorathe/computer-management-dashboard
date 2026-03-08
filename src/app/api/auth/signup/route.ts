import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { signUpSchema } from '@/lib/validations'
import { checkRateLimit } from '@/lib/rate-limit'
import prisma from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit-logger'
import { getClientInfo } from '@/lib/auth-helpers'

/**
 * POST /api/auth/signup
 * Create a new user account
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 5 signups per IP per hour
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    const rateLimitResult = await checkRateLimit(`signup:${ip}`)
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.message || 'Too many signup attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()

    // Validate input with Zod
    const validationResult = signUpSchema.safeParse(body)
    
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }))
      
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: errors
        },
        { status: 400 }
      )
    }

    const { email, password, name } = validationResult.data

    // Connect to database
    await prisma.$connect()

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account already exists with this email' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user with Prisma
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'USER', // Default role
        emailVerified: process.env.NODE_ENV !== 'production' ? new Date() : null,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      }
    })

    // Create audit log
    const clientInfo = getClientInfo(request)
    await createAuditLog({
      action: 'CREATE',
      entityType: 'User',
      entityId: user.id,
      userId: user.id,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      changes: { email: user.email, name: user.name, role: user.role }
    })

    return NextResponse.json({
      success: true,
      message: 'Account created successfully! ' + (process.env.NODE_ENV !== 'production' 
        ? 'You can now sign in.' 
        : 'Please check your email to verify your account.'),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    })
  } catch (error) {
    console.error('Sign-up error:', error)
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
