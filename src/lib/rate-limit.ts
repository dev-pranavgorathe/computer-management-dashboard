// Simple in-memory rate limiter for development and production without Redis
// For production with high traffic, consider using Upstash Redis or similar

interface RateLimitRecord {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitRecord>()

// Clean up expired entries every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key)
      }
    }
  }, 10 * 60 * 1000)
}

export async function checkRateLimit(
  identifier: string,
  maxRequests: number = 5,
  windowMs: number = 60 * 1000
): Promise<{ 
  success: boolean
  remaining: number
  reset: number
  message?: string 
}> {
  const now = Date.now()
  const record = rateLimitStore.get(identifier)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, { 
      count: 1, 
      resetTime: now + windowMs 
    })
    return { 
      success: true, 
      remaining: maxRequests - 1, 
      reset: now + windowMs 
    }
  }

  if (record.count >= maxRequests) {
    return {
      success: false,
      remaining: 0,
      reset: record.resetTime,
      message: "Too many requests. Please try again later."
    }
  }

  record.count++
  return {
    success: true,
    remaining: maxRequests - record.count,
    reset: record.resetTime
  }
}
