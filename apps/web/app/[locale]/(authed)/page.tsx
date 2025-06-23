import { getDictionary } from "@/i18n";
import { PageUI } from "@/components/PageUI";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({
  params,
}: HomePageProps): Promise<React.JSX.Element> {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  return <PageUI dictionary={dictionary} />;
}

// Static route configuration for PPR optimization
export const dynamic = "auto";
export const revalidate = 3600; // Revalidate every hour
