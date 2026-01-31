import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-4">404</div>
        <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
        <p className="text-gray-600 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
