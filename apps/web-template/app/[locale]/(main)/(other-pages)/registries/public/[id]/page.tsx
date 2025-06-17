import { notFound } from 'next/navigation';
import PublicRegistryView from './public-registry-view';
import { getRegistry } from '@/actions/registries';

interface PublicRegistryPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function PublicRegistryPage({ params }: PublicRegistryPageProps) {
  const { id } = await params;

  const result = await getRegistry(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const registry = result.data;

  // Check if registry is public
  if (!registry.isPublic) {
    notFound();
  }

  return <PublicRegistryView registry={registry} />;
}
