import { redirect } from 'next/navigation'

export default function HomePage() {
  // Canonical entry point: avoid duplicate legacy homepage implementation
  redirect('/shipments')
}
