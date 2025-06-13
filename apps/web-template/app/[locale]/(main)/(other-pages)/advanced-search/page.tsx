import { Suspense } from 'react';
import AdvancedAlgoliaSearch from '@/components/search/AdvancedAlgoliaSearch';

// Loading component for the advanced search
function SearchLoading() {
  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
    </div>
  );
}

export default function AdvancedSearchPage({ params }: { params: { locale: string } }) {
  return (
    <Suspense fallback={<SearchLoading />}>
      <AdvancedAlgoliaSearch params={params} />
    </Suspense>
  );
}

export const metadata = {
  title: 'Advanced AI-Powered Search | Product Discovery',
  description:
    'Experience next-generation product search with AI-powered understanding, voice commands, and personalized recommendations.',
  keywords: ['search', 'products', 'AI', 'voice search', 'personalization', 'e-commerce'],
  openGraph: {
    title: 'Advanced AI-Powered Search',
    description: 'Discover products with intelligent search technology',
    type: 'website',
  },
};
