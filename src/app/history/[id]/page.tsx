import Link from 'next/link';

interface RecordingDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RecordingDetailPage({ params }: RecordingDetailPageProps) {
  const { id } = await params;

  return (
    <main className="flex min-h-screen flex-col p-8">
      <div className="max-w-4xl w-full mx-auto space-y-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4">
          <Link 
            href="/history"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to History
          </Link>
        </div>

        <h1 className="text-3xl font-bold">Recording Details</h1>

        {/* Recording Info */}
        <div className="bg-white border rounded-lg p-6">
          <div className="text-sm text-gray-500 mb-2">Recording ID: {id}</div>
          <div className="text-sm text-gray-500">Date: [To be implemented]</div>
          <div className="text-sm text-gray-500">Duration: [To be implemented]</div>
        </div>

        {/* Audio Playback */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Audio</h2>
          <div className="text-gray-500">Audio playback will be implemented here</div>
        </div>

        {/* Transcription */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Transcription</h2>
          <div className="text-gray-700 whitespace-pre-wrap">
            [Transcribed text will appear here]
          </div>
        </div>

        {/* Enriched Output */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">AI-Enriched Output</h2>
          <div className="text-gray-700 whitespace-pre-wrap">
            [AI-enriched content will appear here]
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            📋 Copy Transcription
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            📋 Copy Enriched
          </button>
          <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
            💾 Export
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            🗑️ Delete
          </button>
        </div>
      </div>
    </main>
  );
}
