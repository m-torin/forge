'use client';

import { logger } from '@/lib/logger';
import { Button, PasswordInput, TextInput, Checkbox } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconBrandFacebook, IconBrandGoogle, IconBrandTwitter } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { useState } from 'react';

import { authClient } from '@repo/auth/client/next';

const signupSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

interface SignupClientProps {
  dict: any;
  locale: string;
}

export default function SignupClient({ dict, locale }: SignupClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignupFormData>({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
    validate: zodResolver(signupSchema),
  });

  const handleSubmit = async (values: SignupFormData) => {
    try {
      setIsLoading(true);

      const { data, error } = await authClient.signUp.email({
        email: values.email,
        password: values.password,
        name: values.name,
      });

      if (error) {
        notifications.show({
          title: 'Signup Failed',
          message: error.message || 'Failed to create account',
          color: 'red',
        });
        return;
      }

      if (data) {
        notifications.show({
          title: 'Account Created!',
          message: 'Welcome! Your account has been created successfully.',
          color: 'green',
        });

        // Check for return URL
        const returnUrl = searchParams.get('returnUrl');
        if (returnUrl && isValidRedirect(returnUrl)) {
          router.push(returnUrl);
        } else {
          // Default redirect to account page
          router.push(`/${locale}/account`);
        }
      }
    } catch (error) {
      logger.error('Signup error', error);
      notifications.show({
        title: 'Error',
        message: 'An unexpected error occurred during signup',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignup = async (provider: 'google' | 'facebook' | 'twitter') => {
    try {
      setIsLoading(true);

      // Check for return URL to include in callback
      const returnUrl = searchParams.get('returnUrl');
      const callbackURL =
        returnUrl && isValidRedirect(returnUrl) ? returnUrl : `/${locale}/account`;

      await authClient.signIn.social({
        provider,
        callbackURL,
      });
    } catch (error) {
      logger.error(`${provider} signup error`, error);
      notifications.show({
        title: 'Social Signup Error',
        message: `Failed to sign up with ${provider}. Please try again.`,
        color: 'red',
      });
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="container mb-24 lg:mb-32">
        <h1 className="my-20 flex items-center justify-center text-3xl font-semibold leading-[115%] text-neutral-900 md:text-5xl md:leading-[115%] dark:text-neutral-100">
          {dict.auth?.signup || 'Sign Up'}
        </h1>
        <div className="mx-auto flex max-w-md flex-col gap-y-6">
          <div className="grid gap-3">
            <Button
              variant="default"
              size="lg"
              leftSection={<IconBrandFacebook size={20} />}
              onClick={() => handleSocialSignup('facebook')}
              fullWidth
              disabled={isLoading}
              classNames={{
                root: 'hover:-translate-y-0.5 transition-transform',
              }}
            >
              {dict.auth?.continueWithFacebook || 'Continue with Facebook'}
            </Button>
            <Button
              variant="default"
              size="lg"
              leftSection={<IconBrandTwitter size={20} />}
              onClick={() => handleSocialSignup('twitter')}
              fullWidth
              disabled={isLoading}
              classNames={{
                root: 'hover:-translate-y-0.5 transition-transform',
              }}
            >
              {dict.auth?.continueWithTwitter || 'Continue with Twitter'}
            </Button>
            <Button
              variant="default"
              size="lg"
              leftSection={<IconBrandGoogle size={20} />}
              onClick={() => handleSocialSignup('google')}
              fullWidth
              disabled={isLoading}
              classNames={{
                root: 'hover:-translate-y-0.5 transition-transform',
              }}
            >
              {dict.auth?.continueWithGoogle || 'Continue with Google'}
            </Button>
          </div>

          {/* OR Divider */}
          <div className="relative text-center">
            <span className="relative z-10 inline-block bg-white px-4 text-sm font-medium dark:bg-neutral-900 dark:text-neutral-400">
              {dict.auth?.or || 'OR'}
            </span>
            <div className="absolute left-0 top-1/2 w-full -translate-y-1/2 border border-neutral-100 dark:border-neutral-800" />
          </div>

          {/* Signup Form */}
          <form onSubmit={form.onSubmit(handleSubmit)} className="grid grid-cols-1 gap-6">
            <TextInput
              label={dict.auth?.name || 'Full Name'}
              placeholder={dict.auth?.namePlaceholder || 'John Doe'}
              size="lg"
              {...form.getInputProps('name')}
            />

            <TextInput
              label={dict.auth?.email || 'Email address'}
              placeholder={dict.auth?.emailPlaceholder || 'example@email.com'}
              type="email"
              size="lg"
              {...form.getInputProps('email')}
            />

            <PasswordInput
              label={dict.auth?.password || 'Password'}
              placeholder="Create a password"
              size="lg"
              {...form.getInputProps('password')}
            />

            <PasswordInput
              label={dict.auth?.confirmPassword || 'Confirm Password'}
              placeholder="Confirm your password"
              size="lg"
              {...form.getInputProps('confirmPassword')}
            />

            <Checkbox
              label={
                <span className="text-sm">
                  I agree to the{' '}
                  <Link href={`/${locale}/terms`} className="text-primary-600 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href={`/${locale}/privacy`} className="text-primary-600 hover:underline">
                    Privacy Policy
                  </Link>
                </span>
              }
              {...form.getInputProps('agreeToTerms', { type: 'checkbox' })}
            />

            <Button type="submit" size="lg" fullWidth loading={isLoading} disabled={isLoading}>
              {dict.auth?.createAccount || 'Create Account'}
            </Button>
          </form>

          {/* Login link */}
          <span className="block text-center text-neutral-700 dark:text-neutral-300">
            {dict.auth?.alreadyHaveAccount || 'Already have an account?'}{' '}
            <Link href={`/${locale}/login`} className="text-primary-600 hover:underline">
              {dict.auth?.login || 'Login'}
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}

// Validate redirect URLs to prevent open redirect attacks
function isValidRedirect(url: string): boolean {
  // Must be a relative URL starting with /
  if (!url.startsWith('/')) return false;

  // Must not be a protocol-relative URL
  if (url.startsWith('//')) return false;

  // Must not contain @ (prevents user@host URLs)
  if (url.includes('@')) return false;

  return true;
}
