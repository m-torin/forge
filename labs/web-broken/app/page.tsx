import { getDictionary } from "@/i18n";
import { PageUI } from "@/components/PageUI";
import { RootPageWrapper } from "./RootPageWrapper";

/**
 * Root page that serves English content directly
 *
 * This page serves the default locale (English) content at the root URL
 * without showing /en in the URL (transparent routing).
 */
export default async function RootPage(): Promise<React.JSX.Element> {
  const dictionary = await getDictionary("en");

  return (
    <RootPageWrapper dictionary={dictionary}>
      <PageUI dictionary={dictionary} />
    </RootPageWrapper>
  );
}

// Static route configuration for PPR optimization
export const dynamic = "auto";
export const revalidate = 3600; // Revalidate every hour
