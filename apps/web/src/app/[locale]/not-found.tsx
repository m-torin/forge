import { seoManager } from "@/lib/seo-config";

export const metadata = seoManager.createErrorMetadata(404);

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="mt-4 text-xl text-gray-600">Page not found</p>
        <a
          href="/"
          className="mt-6 inline-block rounded-md bg-blue-600 px-4 py-2 text-white"
        >
          Go back home
        </a>
      </div>
    </div>
  );
}
