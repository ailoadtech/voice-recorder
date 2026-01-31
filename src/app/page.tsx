import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col p-8">
      <div className="max-w-6xl w-full mx-auto space-y-8">
        <div className="text-center animate-fadeIn">
          <h1 className="text-4xl font-bold mb-4 text-neutral-900 dark:text-neutral-100">Voice Intelligence Dashboard</h1>
          <p className="text-lg text-gray-600 dark:text-neutral-400">
            Record, transcribe, and enrich your voice notes with AI
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link 
            href="/record"
            className="p-6 border dark:border-neutral-700 rounded-lg hover:shadow-lg transition-all duration-300 bg-white dark:bg-neutral-800 hover:scale-105 hover:-translate-y-1 animate-slideIn"
            style={{ animationDelay: '0ms' }}
          >
            <div className="text-4xl mb-4">🎤</div>
            <h2 className="text-xl font-semibold mb-2 text-neutral-900 dark:text-neutral-100">Quick Record</h2>
            <p className="text-gray-600 dark:text-neutral-400 mb-4">Start recording with a hotkey or button</p>
            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Press Ctrl+Shift+Space</div>
          </Link>

          <Link 
            href="/history"
            className="p-6 border dark:border-neutral-700 rounded-lg hover:shadow-lg transition-all duration-300 bg-white dark:bg-neutral-800 hover:scale-105 hover:-translate-y-1 animate-slideIn"
            style={{ animationDelay: '100ms' }}
          >
            <div className="text-4xl mb-4">📜</div>
            <h2 className="text-xl font-semibold mb-2 text-neutral-900 dark:text-neutral-100">History</h2>
            <p className="text-gray-600 dark:text-neutral-400 mb-4">View and manage your recordings</p>
            <div className="text-sm text-gray-500 dark:text-neutral-500">Access past transcriptions</div>
          </Link>

          <Link 
            href="/settings"
            className="p-6 border dark:border-neutral-700 rounded-lg hover:shadow-lg transition-all duration-300 bg-white dark:bg-neutral-800 hover:scale-105 hover:-translate-y-1 animate-slideIn"
            style={{ animationDelay: '200ms' }}
          >
            <div className="text-4xl mb-4">⚙️</div>
            <h2 className="text-xl font-semibold mb-2 text-neutral-900 dark:text-neutral-100">Settings</h2>
            <p className="text-gray-600 dark:text-neutral-400 mb-4">Configure your preferences</p>
            <div className="text-sm text-gray-500 dark:text-neutral-500">Hotkeys, API keys, and more</div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-neutral-800 border dark:border-neutral-700 rounded-lg p-6 animate-slideUp" style={{ animationDelay: '300ms' }}>
          <h2 className="text-2xl font-semibold mb-4 text-neutral-900 dark:text-neutral-100">Recent Activity</h2>
          <div className="text-gray-500 dark:text-neutral-500 text-center py-8">
            No recordings yet. Start by clicking the Record button or pressing Ctrl+Shift+Space
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-neutral-800 border dark:border-neutral-700 rounded-lg p-6 transition-all duration-300 hover:shadow-md animate-scaleIn" style={{ animationDelay: '400ms' }}>
            <div className="text-sm text-gray-500 dark:text-neutral-500 mb-1">Total Recordings</div>
            <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">0</div>
          </div>
          <div className="bg-white dark:bg-neutral-800 border dark:border-neutral-700 rounded-lg p-6 transition-all duration-300 hover:shadow-md animate-scaleIn" style={{ animationDelay: '500ms' }}>
            <div className="text-sm text-gray-500 dark:text-neutral-500 mb-1">Total Duration</div>
            <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">0m</div>
          </div>
          <div className="bg-white dark:bg-neutral-800 border dark:border-neutral-700 rounded-lg p-6 transition-all duration-300 hover:shadow-md animate-scaleIn" style={{ animationDelay: '600ms' }}>
            <div className="text-sm text-gray-500 dark:text-neutral-500 mb-1">This Week</div>
            <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">0</div>
          </div>
        </div>
      </div>
    </main>
  );
}
