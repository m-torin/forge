import { getRegistry, getProductsForSelect, getCollectionsForSelect } from '@/actions/registries';
import { auth } from '@repo/auth/server/next';
import { notFound, redirect } from 'next/navigation';
import { type Metadata } from 'next';
import { RegistryDetail } from './registry-detail';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const result = await getRegistry(id);

  if (!result.success || !result.data) {
    return { title: 'Registry Not Found' };
  }

  return {
    title: result.data.title,
    description: result.data.description || `View ${result.data.title} registry`,
  };
}

export default async function RegistryDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  const [registry, productsResult, collectionsResult] = await Promise.all([
    getRegistry(id),
    getProductsForSelect(),
    getCollectionsForSelect(),
  ]);

  if (!registry) {
    notFound();
  }
  const products = productsResult || [];
  const collections = collectionsResult || [];

  // Check if user has access to this registry
  const isOwner = registry.createdByUserId === session.user.id;
  const hasAccess = isOwner || registry.users?.some((u: any) => u.userId === session.user.id);

  if (!hasAccess && !registry.isPublic) {
    notFound();
  }

  return (
    <RegistryDetail
      registry={registry}
      products={products}
      collections={collections}
      locale={locale}
      userId={session.user.id}
    />
  );
}
