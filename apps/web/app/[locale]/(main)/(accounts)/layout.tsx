import React from 'react';
import { type Metadata } from 'next';
import { createMetadata } from '@repo/seo/server/next';
import { redirect } from 'next/navigation';
import { auth } from '@repo/auth/server/next';

import { Divider, Footer, Header2 } from '@/components/ui';
import { PageTab } from '@/components/guest';
import { AccountHeader } from './account-header';
import { AccountLayoutClient } from './account-layout-client';

interface Props {
  children?: React.ReactNode;
  params?: Promise<{ locale: string }>;
}

// Export metadata for all account pages to be noindexed
export const metadata: Metadata = createMetadata({
  title: 'Account',
  description: 'Manage your account settings and preferences',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
});

const Layout = async ({ children, params }: Props) => {
  const session = await auth();
  const resolvedParams = params ? await params : { locale: 'en' };

  // Check authentication for all account pages
  if (!session?.user) {
    redirect(`/${resolvedParams.locale}/login`);
  }

  return (
    <>
      <Header2 />
      <div className="container">
        <div className="mt-14 sm:mt-20">
          <div className="mx-auto max-w-4xl">
            <AccountHeader />
            <Divider className="mt-10" />
            <PageTab />
            <Divider />
          </div>
        </div>
        <div className="mx-auto max-w-4xl pb-24 pt-14 sm:pt-20 lg:pb-32">
          <AccountLayoutClient>{children}</AccountLayoutClient>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Layout;
