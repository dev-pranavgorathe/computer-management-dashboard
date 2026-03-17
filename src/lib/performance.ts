// Performance optimization utilities

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Lazy load images
export function lazyLoadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// Check if element is in viewport
export function isInViewport(element: Element): boolean {
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// Measure performance
export function measurePerformance(name: string, fn: () => void) {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const startTime = performance.now()
    fn()
    const endTime = performance.now()
    console.log(`${name} took ${endTime - startTime}ms`)
  } else {
    fn()
  }
}

// Check network speed
export async function checkNetworkSpeed(): Promise<'slow' | 'fast'> {
  if (typeof window === 'undefined' || !('navigator' in window)) {
    return 'fast'
  }

  const connection = (navigator as any).connection
  if (connection) {
    const { effectiveType, downlink } = connection
    if (effectiveType === 'slow-2g' || effectiveType === '2g' || downlink < 1) {
      return 'slow'
    }
  }
  
  return 'fast'
}

// Preload critical resources
export function preloadResource(href: string, as: 'script' | 'style' | 'image' | 'font') {
  if (typeof document === 'undefined') return
  
  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = href
  link.as = as
  document.head.appendChild(link)
}

// Optimize images based on screen size
export function getOptimizedImageUrl(
  url: string,
  width: number,
  quality: number = 75
): string {
  if (!url) return ''
  
  // If using a CDN that supports image optimization
  if (url.includes('supabase.co')) {
    return `${url}?width=${width}&quality=${quality}`
  }
  
  return url
}

// Memory-efficient scroll handler
export function createScrollHandler(
  callback: () => void,
  throttleMs: number = 100
) {
  let ticking = false
  
  return throttle(() => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        callback()
        ticking = false
      })
      ticking = true
    }
  }, throttleMs)
}
