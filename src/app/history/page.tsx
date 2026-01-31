import Link from 'next/link';

export default function HistoryPage() {
  return (
    <main className="flex min-h-screen flex-col p-8">
      <div className="max-w-6xl w-full mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Recording History</h1>
          <div className="flex gap-2">
            <input 
              type="search" 
              placeholder="Search recordings..." 
              className="px-4 py-2 border rounded w-64"
            />
            <select className="px-3 py-2 border rounded">
              <option>Sort by Date</option>
              <option>Sort by Duration</option>
              <option>Sort by Name</option>
            </select>
          </div>
        </div>

        {/* Filter Options */}
        <div className="bg-white border rounded-lg p-4">
          <div className="flex gap-4 items-center">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50">
              All
            </button>
            <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50">
              This Week
            </button>
            <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50">
              This Month
            </button>
            <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50">
              Custom Range
            </button>
          </div>
        </div>

        {/* Recording List */}
        <div className="space-y-4">
          {/* Empty State */}
          <div className="bg-white border rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">📜</div>
            <h2 className="text-xl font-semibold mb-2">No recordings yet</h2>
            <p className="text-gray-600 mb-6">
              Your recording history will appear here once you start recording
            </p>
            <Link 
              href="/record"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
            >
              Start Recording
            </Link>
          </div>

          {/* Example Recording Item (will be populated dynamically) */}
          {/* <div className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Recording Title</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  Transcription preview text goes here...
                </p>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>📅 Jan 1, 2024</span>
                  <span>⏱️ 2:30</span>
                  <span>🎤 Transcribed</span>
                  <span>✨ Enriched</span>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50">
                  View
                </button>
                <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50">
                  Export
                </button>
              </div>
            </div>
          </div> */}
        </div>

        {/* Bulk Actions */}
        <div className="bg-white border rounded-lg p-4">
          <div className="flex gap-4 items-center">
            <span className="text-sm font-medium text-gray-700">Bulk Actions:</span>
            <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50">
              Export Selected
            </button>
            <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50 text-red-600">
              Delete Selected
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
