import { getDictionary } from "@/i18n";
import { AccountPageUI } from "./account-ui";

interface AccountPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AccountPage({
  params,
}: AccountPageProps): Promise<React.JSX.Element> {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  return <AccountPageUI dictionary={dictionary} />;
}

// Static route configuration for PPR optimization
export const dynamic = "auto";
export const revalidate = 300; // Revalidate every 5 minutes for auth-sensitive content
