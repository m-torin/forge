import { redirect } from 'next/navigation';
import { auth } from '@repo/auth/server/next';
import { RegistryForm } from './registry-form';
import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Registry',
  description: 'Create a new gift registry',
};

export default async function NewRegistryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Create New Registry</h1>
      <RegistryForm locale={locale} />
    </div>
  );
}
