import { auth } from '@repo/auth/server/next';

export async function AccountHeader() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-3xl font-semibold xl:text-4xl">Account</h2>
      <span className="mt-4 block text-base text-neutral-500 sm:text-lg dark:text-neutral-400">
        <span className="font-semibold text-neutral-900 dark:text-neutral-200">
          {session.user.name || 'User'},
        </span>{' '}
        {session.user.email}
      </span>
    </div>
  );
}
