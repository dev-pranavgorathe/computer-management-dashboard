'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface ValidationError {
  field: string
  message: string
}

export default function SignUp() {
  const router = useRouter()
  const [errors, setErrors] = useState<string[]>([])
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrors([])
    setFieldErrors({})
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    console.log("Form submitted with:", { name, email, password: "***" })

    // Client-side validation
    const newFieldErrors: Record<string, string> = {}

    if (password !== confirmPassword) {
      newFieldErrors.confirmPassword = "Passwords do not match"
    }

    if (password.length < 8) {
      newFieldErrors.password = "Password must be at least 8 characters"
    } else if (!/[A-Z]/.test(password)) {
      newFieldErrors.password = "Password must contain an uppercase letter"
    } else if (!/[a-z]/.test(password)) {
      newFieldErrors.password = "Password must contain a lowercase letter"
    } else if (!/[0-9]/.test(password)) {
      newFieldErrors.password = "Password must contain a number"
    }

    if (name.length < 2) {
      newFieldErrors.name = "Name must be at least 2 characters"
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      newFieldErrors.email = "Please enter a valid email address"
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors)
      setLoading(false)
      console.log("Validation errors:", newFieldErrors)
      return
    }

    try {
      console.log("Sending request to API...")
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()
      console.log("API response:", data)

      if (!res.ok) {
        if (data.details) {
          // Field-specific errors from server
          const fieldErrs: Record<string, string> = {}
          data.details.forEach((err: ValidationError) => {
            fieldErrs[err.field] = err.message
          })
          setFieldErrors(fieldErrs)
        } else {
          setErrors([data.error || "Failed to create account"])
        }
        setLoading(false)
        return
      }

      // Redirect to sign-in page on success
      console.log("Success! Redirecting...")
      router.push("/auth/signin?registered=true")
    } catch (err) {
      console.error("Signup error:", err)
      setErrors(["Something went wrong. Please try again."])
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Apni Pathshala</h1>
          <p className="text-gray-500 mt-1">Create your account</p>
        </div>

        {errors.length > 0 && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {errors.map((error, i) => (
              <p key={i}>{error}</p>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                fieldErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
              placeholder="John Doe"
            />
            {fieldErrors.name && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                fieldErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
              placeholder="you@example.com"
            />
            {fieldErrors.email && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              required
              minLength={8}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                fieldErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
              placeholder="••••••••"
            />
            {fieldErrors.password ? (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">Min 8 chars, with uppercase, lowercase, and number</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              required
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                fieldErrors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
              placeholder="••••••••"
            />
            {fieldErrors.confirmPassword && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 font-medium">
            Sign in
          </Link>
        </p>

        <p className="mt-4 text-center text-xs text-gray-400">
          Computer Management Team authorized users only
        </p>
      </div>
    </div>
  )
}
