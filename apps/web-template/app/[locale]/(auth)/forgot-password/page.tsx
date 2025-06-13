import { getDictionary } from '@/i18n';
import type { Metadata } from 'next';
import ForgotPasswordClient from './forgot-password-client';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const dict = await getDictionary(params.locale);
  return {
    description: dict.auth?.forgotPasswordDescription || 'Reset your password',
    title: dict.auth?.forgotPassword || 'Forgot Password',
  };
}

export default async function PageForgotPassword({ params }: { params: { locale: string } }) {
  const dict = await getDictionary(params.locale);
  
  return <ForgotPasswordClient dict={dict} locale={params.locale} />;
}