/**
 * Profile Page
 *
 * Protected page that requires authentication
 */

// Force dynamic rendering since this page requires authentication checks
import { trackProfileViewAction } from '#/app/actions/auth';
import { getAuthContext } from '#/lib/auth-context';
import { getDictionary, type Locale } from '#/lib/i18n';
import { createAuthMetadata } from '#/lib/seo';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import ProfilePageUi from './ProfilePageUi';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const authContext = await getAuthContext();

  const userContext = authContext.isAuthenticated
    ? {
        isAuthenticated: true,
        userName: authContext.user?.name,
      }
    : undefined;

  return createAuthMetadata(locale, 'profile', userContext);
}

export default async function ProfilePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;

  // Check authentication
  const authContext = await getAuthContext();
  if (!authContext.isAuthenticated || !authContext.user) {
    redirect(`/${locale}/login?redirectTo=${encodeURIComponent(`/${locale}/profile`)}`);
  }

  // Track profile view for analytics
  await trackProfileViewAction();

  // Get dictionary for translations
  const dict = await getDictionary(locale);

  return <ProfilePageUi locale={locale} dict={dict} user={authContext.user} />;
}
