/**
 * Login Page
 *
 * Server component that handles SEO and passes data to client login form
 */

// Force dynamic rendering since this page checks authentication state
import { getAuthContext } from "#/lib/auth-context";
import { getDictionary, type Locale } from "#/lib/i18n";
import { createAuthMetadata } from "#/lib/seo";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginPageUi from "./LoginPageUi";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return createAuthMetadata(locale, "login");
}

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ redirectTo?: string; error?: string }>;
}) {
  const { locale } = await params;
  const { redirectTo, error } = await searchParams;

  // Check if user is already authenticated
  const authContext = await getAuthContext();
  if (authContext.isAuthenticated) {
    redirect((redirectTo || `/${locale}`) as any);
  }

  // Get dictionary for translations
  const dict = await getDictionary(locale);

  return (
    <LoginPageUi
      locale={locale}
      dict={dict}
      redirectTo={redirectTo || `/${locale}`}
      error={error || null}
    />
  );
}
