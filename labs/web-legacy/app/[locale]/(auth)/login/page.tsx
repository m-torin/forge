import { getDictionary } from '@/i18n';
import type { Metadata } from 'next';
import LoginClient from './login-client';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const dict = await getDictionary(params.locale);
  return {
    description: dict.auth?.loginDescription || 'Login to your account',
    title: dict.auth?.login || 'Login',
  };
}

export default async function PageLogin({ params }: { params: { locale: string } }) {
  const dict = await getDictionary(params.locale);

  return <LoginClient dict={dict} locale={params.locale} />;
}
