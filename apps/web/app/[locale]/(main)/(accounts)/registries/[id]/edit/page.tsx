import { getRegistry } from '@/actions/registries';
import { auth } from '@repo/auth/server/next';
import { notFound, redirect } from 'next/navigation';
import RegistryEditForm from './registry-edit-form';

export default async function EditRegistryPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  const result = await getRegistry(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const registry = result.data;

  // Check if user can edit this registry
  const isOwner = registry.createdByUserId === session.user.id;
  const canEdit =
    isOwner ||
    registry.users?.some(
      (u: any) => u.userId === session.user.id && (u.role === 'OWNER' || u.role === 'EDITOR'),
    );

  if (!canEdit) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Edit Registry</h1>
      <RegistryEditForm registry={registry} locale={locale} />
    </div>
  );
}
