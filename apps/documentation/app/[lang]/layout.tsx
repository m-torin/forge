/* eslint-env node */
import { VercelIcon } from '@app/_icons';
import type { Metadata } from 'next';
import { Footer, LastUpdated, Layout, Link, LocaleSwitch, Navbar } from 'nextra-theme-docs';
import { Banner, Head } from 'nextra/components';
import { getPageMap } from 'nextra/page-map';
import type { FC, ReactNode } from 'react';
import { getDictionary, getDirection } from '../_dictionaries/get-dictionary';
import './styles.css';

export const metadata: Metadata = {
  description:
    'Forge is a modern, production-ready monorepo template for building scalable Next.js applications with TypeScript, authentication, payments, and more.',
  title: {
    absolute: '',
    template: '%s | Forge Documentation',
  },
  metadataBase: new URL('https://forge-docs.vercel.app'),
  openGraph: {
    images: '/og-image.png',
  },
  twitter: {
    site: '@forge',
  },
  appleWebApp: {
    title: 'Forge Docs',
  },
  other: {
    'msapplication-TileColor': '#fff',
  },
};

type LayoutProps = Readonly<{
  children: ReactNode;
  params: Promise<{
    lang: string;
  }>;
}>;

const RootLayout: FC<LayoutProps> = async ({ children, params }) => {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  const pageMap = await getPageMap(`/${lang}`);
  const banner = (
    <Banner storageKey="forge-docs-1">
      Welcome to Forge Documentation!{' '}
      <Link href="/docs/nextra-complete-example">Get Started →</Link>
    </Banner>
  );
  const navbar = (
    <Navbar
      logo={
        <>
          <span className="font-extrabold text-xl">📚</span>
          <span
            className="ms-2 select-none font-extrabold max-md:hidden"
            title="Forge Documentation"
          >
            Forge Docs
          </span>
        </>
      }
      projectLink="https://github.com/your-org/forge"
      chatLink="https://discord.com"
    >
      <LocaleSwitch lite />
    </Navbar>
  );
  const footer = (
    <Footer>
      <a
        rel="noreferrer"
        target="_blank"
        className="x:focus-visible:nextra-focus flex items-center gap-2 font-semibold"
        href={dictionary.link.vercel}
      >
        {dictionary.poweredBy} <VercelIcon height="20" />
      </a>
    </Footer>
  );
  return (
    <html lang={lang} dir={getDirection(lang)} suppressHydrationWarning>
      <Head
        backgroundColor={{
          dark: 'rgb(15,23,42)',
          light: 'rgb(254, 252, 232)',
        }}
        color={{
          hue: { dark: 120, light: 0 },
          saturation: { dark: 100, light: 100 },
        }}
      />
      <body>
        <Layout
          banner={banner}
          navbar={navbar}
          footer={footer}
          docsRepositoryBase="https://github.com/shuding/nextra/blob/main/examples/swr-site"
          i18n={[
            { locale: 'en', name: 'English' },
            { locale: 'es', name: 'Español RTL' },
            { locale: 'ru', name: 'Русский' },
          ]}
          sidebar={{
            defaultMenuCollapseLevel: 1,
            autoCollapse: true,
          }}
          toc={{
            backToTop: dictionary.backToTop,
            extraContent: (
              // eslint-disable-next-line @next/next/no-img-element -- we can't use with external urls
              <img alt="placeholder cat" src="https://placecats.com/300/200" />
            ),
          }}
          editLink={dictionary.editPage}
          pageMap={pageMap}
          nextThemes={{ defaultTheme: 'dark' }}
          lastUpdated={<LastUpdated>{dictionary.lastUpdated}</LastUpdated>}
          themeSwitch={{
            dark: dictionary.dark,
            light: dictionary.light,
            system: dictionary.system,
          }}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
};

export default RootLayout;
