'use client';

import { Button, PasswordInput, TextInput } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconBrandFacebook, IconBrandGoogle, IconBrandTwitter } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

import { authClient } from '@repo/auth/client/next';

const signupSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
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

  const form = useForm<SignupFormData>({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: zodResolver(signupSchema),
  });

  const handleSubmit = async (values: SignupFormData) => {
    try {
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
          message: 'Your account has been created successfully. You can now login.',
          color: 'green',
        });

        // Redirect to login page or home if auto-login happened
        router.push(`/${locale}/login`);
      }
    } catch (error) {
      console.error('Signup error:', error);
      notifications.show({
        title: 'Error',
        message: 'An unexpected error occurred during signup',
        color: 'red',
      });
    }
  };

  const handleSocialSignup = async (provider: 'google' | 'facebook' | 'twitter') => {
    try {
      // Map provider names to Better Auth provider names
      const providerMap = {
        google: 'google',
        facebook: 'facebook',
        twitter: 'twitter',
      };

      await authClient.signIn.social({
        provider: providerMap[provider],
        callbackURL: `/${locale}/home`,
      });
    } catch (error) {
      console.error(`${provider} signup error:`, error);
      notifications.show({
        title: 'Social Signup Error',
        message: `Failed to sign up with ${provider}. Please try again.`,
        color: 'red',
      });
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

            <Button type="submit" size="lg" fullWidth>
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

          {/* Terms */}
          <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
            {dict.auth?.bySigningUp || 'By signing up, you agree to our'}{' '}
            <Link href={`/${locale}/terms`} className="text-primary-600 hover:underline">
              {dict.auth?.terms || 'Terms'}
            </Link>{' '}
            {dict.auth?.and || 'and'}{' '}
            <Link href={`/${locale}/privacy`} className="text-primary-600 hover:underline">
              {dict.auth?.privacyPolicy || 'Privacy Policy'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
