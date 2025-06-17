import { getDictionary } from '@/i18n';
import { type Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@repo/auth/server/next';
import { getCurrentUser } from '@/actions/user';
import { EnhancedAccountForm } from './enhanced-account-form';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return {
    description: dict.account.accountDescription,
    title: dict.account.accountPage,
  };
}

const Page = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;
  const session = await auth();

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  const [dict, user] = await Promise.all([getDictionary(locale), getCurrentUser()]);

  if (!user) {
    redirect(`/${locale}/login`);
  }

  return (
    <div className="flex flex-col gap-y-10 sm:gap-y-12">
      {/* HEADING */}
      <h1 className="text-2xl font-semibold sm:text-3xl">{dict.account.personalInfo}</h1>
      <EnhancedAccountForm user={user} locale={locale} dict={dict} />
    </div>
  );
};

export default Page;
