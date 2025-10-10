import { getDictionary, type Locale } from "#/lib/i18n";
import { createAuthMetadata } from "#/lib/seo";
import type { Metadata } from "next";
import SignUpPageUi from "./SignUpPageUi";

type Props = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ redirectTo?: string; error?: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const _dict = await getDictionary(locale);

  return createAuthMetadata(locale, "login");
}

export default async function SignUpPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { redirectTo = "/", error = null } = await searchParams;
  const dict = await getDictionary(locale);

  return (
    <SignUpPageUi
      locale={locale}
      dict={dict}
      redirectTo={redirectTo}
      error={error}
    />
  );
}
