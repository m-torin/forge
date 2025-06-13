import { AppLayout, AppLayoutProvider } from '@/components/layout';
import { getNavigationRoutes } from '@/data/navigation';
import { getDictionary } from '@/i18n';

export default async function MainLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const [{ locale }, dict, navigationMenu] = await Promise.all([
    params,
    params.then((p) => getDictionary(p.locale)),
    getNavigationRoutes(),
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
      <AppLayout dict={dict} locale={locale} navigationMenu={navigationMenu} padding="md">
        {children}
      </AppLayout>
    </AppLayoutProvider>
  );
}
