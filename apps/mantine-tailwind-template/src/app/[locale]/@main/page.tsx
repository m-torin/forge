import { getAuthContext } from '#/lib/auth';
import { getAllFlagResults } from '#/lib/auth-flags';
import {
  enhancedFeatureCards,
  showBetaBanner,
  showLanguageSwitcher,
  welcomeMessageVariant,
} from '#/lib/flags';
import { getDictionary, type Locale } from '#/lib/i18n';
import { createHomeMetadata } from '#/lib/seo';
import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import PageUi from '../PageUi';

// Generate dynamic metadata based on feature flags and auth state
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const cookieStore = await cookies();
  const headerStore = await headers();

  // Get auth context
  const authContext = await getAuthContext();

  // Evaluate feature flags
  const showLangSwitcher = await showLanguageSwitcher();
  const welcomeVariant = await welcomeMessageVariant();
  const enhancedCards = await enhancedFeatureCards();
  const showBanner = await showBetaBanner();

  const flagResults = {
    showLangSwitcher,
    welcomeVariant,
    enhancedCards,
    showBanner,
  };

  const userContext = authContext.isAuthenticated
    ? {
        isAuthenticated: true,
        userName: authContext.user?.name,
        role: authContext.user?.role,
      }
    : {
        isAuthenticated: false,
      };

  return createHomeMetadata(locale, flagResults, userContext);
}

export default async function MainContent({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  // Get auth context
  const authContext = await getAuthContext();

  // Get comprehensive flag results (including auth-aware flags)
  const flagResults = await getAllFlagResults(authContext);

  return <PageUi locale={locale} dict={dict} flagResults={flagResults} authContext={authContext} />;
}
