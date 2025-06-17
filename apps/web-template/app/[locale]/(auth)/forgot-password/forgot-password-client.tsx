'use client';

import { Button, TextInput } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { z } from 'zod';

import { authClient } from '@repo/auth/client/next';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordClientProps {
  dict: any;
  locale: string;
}

export default function ForgotPasswordClient({ dict, locale }: ForgotPasswordClientProps) {
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ForgotPasswordFormData>({
    initialValues: {
      email: '',
    },
    validate: zodResolver(forgotPasswordSchema),
  });

  const handleSubmit = async (values: ForgotPasswordFormData) => {
    try {
      const { data, error } = await authClient.forgetPassword({
        email: values.email,
        redirectTo: `${window.location.origin}/${locale}/reset-password`,
      });

      if (error) {
        notifications.show({
          title: 'Reset Failed',
          message: error.message || 'Failed to send reset email',
          color: 'red',
        });
        return;
      }

      if (data) {
        notifications.show({
          title: 'Reset Email Sent',
          message: 'Please check your email for password reset instructions.',
          color: 'green',
        });

        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      notifications.show({
        title: 'Error',
        message: 'An unexpected error occurred while sending reset email',
        color: 'red',
      });
    }
  };

  if (isSubmitted) {
    return (
      <div className="container mb-24 lg:mb-32">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <div className="mb-8 rounded-full bg-green-100 p-4 dark:bg-green-900">
            <svg
              className="h-8 w-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
              />
            </svg>
          </div>

          <h1 className="mb-4 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            {dict.auth?.checkYourEmail || 'Check your email'}
          </h1>

          <p className="mb-8 text-neutral-600 dark:text-neutral-400">
            {dict.auth?.passwordResetEmailSent ||
              `We've sent a password reset link to ${form.values.email}`}
          </p>

          <Button onClick={() => router.push(`/${locale}/login`)} size="lg" fullWidth>
            {dict.auth?.backToLogin || 'Back to login'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="container mb-24 lg:mb-32">
        <h1 className="my-20 flex items-center justify-center text-3xl font-semibold leading-[115%] text-neutral-900 md:text-5xl md:leading-[115%] dark:text-neutral-100">
          {dict.auth?.forgotPassword || 'Forgot Password'}
        </h1>
        <div className="mx-auto flex max-w-md flex-col gap-y-6">
          <p className="text-center text-neutral-600 dark:text-neutral-400">
            {dict.auth?.forgotPasswordInstructions ||
              "Enter your email address and we'll send you a link to reset your password."}
          </p>

          {/* Reset Form */}
          <form onSubmit={form.onSubmit(handleSubmit)} className="grid grid-cols-1 gap-6">
            <TextInput
              label={dict.auth?.email || 'Email address'}
              placeholder={dict.auth?.emailPlaceholder || 'example@email.com'}
              type="email"
              size="lg"
              {...form.getInputProps('email')}
            />

            <Button type="submit" size="lg" fullWidth>
              {dict.auth?.sendResetLink || 'Send Reset Link'}
            </Button>
          </form>

          {/* Back to login */}
          <div className="text-center">
            <Link
              href={`/${locale}/login`}
              className="text-primary-600 hover:underline inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              {dict.auth?.backToLogin || 'Back to login'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
