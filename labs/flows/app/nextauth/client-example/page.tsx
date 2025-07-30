import { auth } from '#/auth';
import ClientExample from '#/auth-components/client-example';
import { SessionProvider } from 'next-auth/react';

export default async function ClientPage() {
  const session = await auth();
  if (session?.user) {
    // TODO: Look into https://react.dev/reference/react/experimental_taintObjectReference
    // filter out sensitive data before passing to client.
    session.user = {
      name: session.user.name ?? null,
      email: session.user.email ?? null,
      image: session.user.image ?? null,
    };
  }

  return (
    <SessionProvider basePath="/auth" session={session}>
      <ClientExample />
    </SessionProvider>
  );
}
