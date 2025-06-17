'use client';

import { Button, PasswordInput, TextInput, Checkbox } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconBrandFacebook, IconBrandGoogle, IconBrandTwitter } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { useState } from 'react';

import { authClient } from '@repo/auth/client/next';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginClientProps {
  dict: any;
  locale: string;
}

export default function LoginClient({ dict, locale }: LoginClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormData>({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    validate: zodResolver(loginSchema),
  });

  const handleSubmit = async (values: LoginFormData) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
      });

      if (error) {
        notifications.show({
          title: 'Login Failed',
          message: error.message || 'Invalid email or password',
          color: 'red',
        });
        return;
      }

      if (data) {
        notifications.show({
          title: 'Welcome back!',
          message: 'You have been successfully logged in.',
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
      console.error('Login error:', error);
      notifications.show({
        title: 'Error',
        message: 'An unexpected error occurred during login',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'twitter') => {
    try {
      setIsLoading(true);
      
      // Check for return URL to include in callback
      const returnUrl = searchParams.get('returnUrl');
      const callbackURL = returnUrl && isValidRedirect(returnUrl) 
        ? returnUrl 
        : `/${locale}/account`;

      await authClient.signIn.social({
        provider,
        callbackURL,
      });
    } catch (error) {
      console.error(`${provider} login error:`, error);
      notifications.show({
        title: 'Social Login Error',
        message: `Failed to login with ${provider}. Please try again.`,
        color: 'red',
      });
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="container mb-24 lg:mb-32">
        <h1 className="my-20 flex items-center justify-center text-3xl font-semibold leading-[115%] text-neutral-900 md:text-5xl md:leading-[115%] dark:text-neutral-100">
          {dict.auth?.login || 'Login'}
        </h1>
        <div className="mx-auto flex max-w-md flex-col gap-y-6">
          <div className="grid gap-3">
            <Button
              variant="default"
              size="lg"
              leftSection={<IconBrandFacebook size={20} />}
              onClick={() => handleSocialLogin('facebook')}
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
              onClick={() => handleSocialLogin('twitter')}
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
              onClick={() => handleSocialLogin('google')}
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

          {/* Login Form */}
          <form onSubmit={form.onSubmit(handleSubmit)} className="grid grid-cols-1 gap-6">
            <TextInput
              label={dict.auth?.email || 'Email address'}
              placeholder={dict.auth?.emailPlaceholder || 'example@email.com'}
              type="email"
              size="lg"
              {...form.getInputProps('email')}
            />

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  {dict.auth?.password || 'Password'}
                </label>
                <Link
                  href={`/${locale}/forgot-password`}
                  className="text-primary-600 text-sm hover:underline"
                >
                  {dict.auth?.forgotPasswordQuestion || 'Forgot password?'}
                </Link>
              </div>
              <PasswordInput
                placeholder="Enter your password"
                size="lg"
                {...form.getInputProps('password')}
              />
            </div>

            <Checkbox
              label={dict.auth?.rememberMe || 'Remember me'}
              {...form.getInputProps('rememberMe', { type: 'checkbox' })}
            />

            <Button 
              type="submit" 
              size="lg" 
              fullWidth
              loading={isLoading}
              disabled={isLoading}
            >
              {dict.auth?.continue || 'Continue'}
            </Button>
          </form>

          {/* Sign up link */}
          <span className="block text-center text-neutral-700 dark:text-neutral-300">
            {dict.auth?.newUser || 'New user?'}{' '}
            <Link href={`/${locale}/signup`} className="text-primary-600 hover:underline">
              {dict.auth?.createAccount || 'Create an account'}
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
