export default function RutasLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-8 w-64 bg-gray-200 rounded" />
        <div className="h-4 w-48 bg-gray-100 rounded mt-2" />
      </div>
      <div className="grid sm:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-80 bg-gray-200 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
