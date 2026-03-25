export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-4xl font-bold mb-8">Computer Management Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Shipments</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">13</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Complaints</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">24</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Repossessions</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">15</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Redeployments</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">7</p>
        </div>
      </div>
      <p className="mt-8 text-gray-600">Dashboard is being rebuilt with Supabase integration.</p>
    </main>
  )
}
