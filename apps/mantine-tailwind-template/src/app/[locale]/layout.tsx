import { getDictionary, type Locale } from '../../lib/i18n';
import type { Metadata } from 'next';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  
  return {
    title: dict.meta.title,
    description: dict.meta.description,
  };
}

export default function LocaleLayout({ children }: Props) {
  return children;
}