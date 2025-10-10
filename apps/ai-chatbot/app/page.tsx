import { redirect } from 'next/navigation';

import { ModeSelector } from '@/components/mode-selector';
import { auth } from './(auth)/auth';

export default async function Page() {
  const session = await auth();

  if (!session) {
    redirect('/api/auth/guest');
  }

  return <ModeSelector user={session.user} />;
}
