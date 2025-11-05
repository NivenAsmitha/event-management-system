import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-gray-600 mb-6">Page not found.</p>
      <Link
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        to="/"
      >
        Go Home
      </Link>
    </div>
  );
}
