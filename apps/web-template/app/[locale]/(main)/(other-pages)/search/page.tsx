import { redirect } from 'next/navigation';

interface SearchPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Redirect to the optimized Next.js 15 search implementation
export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;

  // Filter searchParams to only include serializable values (exclude Symbols)
  const serializableParams = Object.fromEntries(
    Object.entries(resolvedSearchParams).filter(([_, value]) => {
      if (typeof value === 'string') return true;
      if (Array.isArray(value)) {
        return value.every((v: any) => typeof v === 'string');
      }
      return false;
    }),
  );

  const queryParams = new URLSearchParams(serializableParams as Record<string, string>).toString();
  const redirectUrl = `/${locale}/nextjs-search${queryParams ? `?${queryParams}` : ''}`;

  redirect(redirectUrl);
}
