import { redirect } from 'next/navigation'

export default function HomePage() {
  // Redirect to shipments as the main entry point
  // Overview is handled by (with-sidebar)/page.tsx at "/" route
  redirect('/shipments')
}
