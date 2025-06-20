import { AppLayoutProvider } from '@/components/layout';
import { ServerAppLayout } from '@/components/layout/ServerAppLayout';
import { getDictionary } from '@/i18n';

export default async function MainLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const [{ locale }, dict] = await Promise.all([
    params,
    params.then((p) => getDictionary(p.locale)),
  ]);

  return (
    <AppLayoutProvider
      initialState={{
        headerEnabled: true,
        navbarEnabled: true,
        asideEnabled: true,
        footerEnabled: false,
      }}
    >
      <ServerAppLayout dict={dict} locale={locale} padding="md">
        {children}
      </ServerAppLayout>
    </AppLayoutProvider>
  );
}
