import { NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { randomBytes } from "crypto"
import { z } from "zod"
import { checkRateLimit } from "@/lib/rate-limit"

// Simple in-memory user store for development
interface User {
  id: string
  email: string
  password: string
  name: string
  emailVerified: Date | null
}

const users: User[] = []

// Input validation schema
const signUpSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s\-']+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"),
  email: z
    .string()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters")
    .transform(email => email.toLowerCase()),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 5 signups per IP per hour
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const rateLimitResult = await checkRateLimit(`signup:${ip}`)
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.message || "Too many signup attempts. Please try again later." },
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
          error: "Validation failed", 
          details: errors
        },
        { status: 400 }
      )
    }

    const { email, password, name } = validationResult.data

    // Check if user already exists
    const existingUser = users.find(u => u.email === email)
    
    if (existingUser) {
      return NextResponse.json(
        { error: "An account already exists with this email" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user with hashed password
    const user: User = {
      id: `user_${Date.now()}`,
      email,
      password: hashedPassword,
      name,
      emailVerified: null, // Will be set after verification
    }

    users.push(user)

    // In development, auto-verify
    if (process.env.NODE_ENV !== 'production') {
      user.emailVerified = new Date()
    }

    return NextResponse.json({
      success: true,
      message: "Account created successfully! " + (process.env.NODE_ENV !== 'production' ? "You can now sign in." : "Please check your email to verify your account."),
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })
  } catch (error) {
    console.error("Sign-up error:", error)
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    )
  }
}

// Export for use in other routes
export function findUserByEmail(email: string) {
  return users.find(u => u.email === email)
}

export function getUser(id: string) {
  return users.find(u => u.id === id)
}
