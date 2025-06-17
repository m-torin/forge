import { getDictionary } from '@/i18n';
import type { Metadata } from 'next';
import SignupClient from './signup-client';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const dict = await getDictionary(params.locale);
  return {
    description: dict.auth?.signupDescription || 'Create a new account',
    title: dict.auth?.signup || 'Sign Up',
  };
}

export default async function PageSignup({ params }: { params: { locale: string } }) {
  const dict = await getDictionary(params.locale);

  return <SignupClient dict={dict} locale={params.locale} />;
}
