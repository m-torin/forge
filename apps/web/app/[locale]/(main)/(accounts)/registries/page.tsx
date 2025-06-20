import { getRegistries } from '@/actions/registries';
import { auth } from '@repo/auth/server/next';
import { type Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

export const metadata: Metadata = {
  description: 'Manage your gift registries and wishlists',
  title: 'My Registries',
};

export default async function RegistriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  // Get user's registries
  const registriesResult = await getRegistries({
    // Filter by user once we have user association in registry schema
    limit: 20,
  });

  const registries = registriesResult.data || [];

  return (
    <div className="flex flex-col gap-y-10 sm:gap-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">My Registries</h1>
          <p className="mt-2.5 text-neutral-500 dark:text-neutral-400">
            Create and manage gift registries for special occasions.
          </p>
        </div>

        <Link href={`/${locale}/registries/new`}>
          <Button leftSection={<IconPlus size={16} />}>Create Registry</Button>
        </Link>
      </div>

      {registries.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral-500 dark:text-neutral-400 mb-4">
            You haven't created any registries yet.
          </p>
          <Link href={`/${locale}/registries/new`}>
            <Button variant="light">Create your first registry</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {registries.map((registry: any) => (
            <Link
              key={registry.id}
              href={`/${locale}/registries/${registry.id}`}
              className="group relative rounded-lg border p-6 hover:shadow-lg transition-all"
            >
              <div className="mb-2">
                <span className="text-xs uppercase text-neutral-500">
                  {registry.type.replace('_', ' ')}
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{registry.title}</h3>
              {registry.eventDate && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                  {new Date(registry.eventDate).toLocaleDateString()}
                </p>
              )}
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {registry._count.items} items • {registry.isPublic ? 'Public' : 'Private'}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
