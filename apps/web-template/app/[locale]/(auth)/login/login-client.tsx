'use client';

import { Button, PasswordInput, TextInput } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconBrandFacebook, IconBrandGoogle, IconBrandTwitter } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginClientProps {
  dict: any;
  locale: string;
}

export default function LoginClient({ dict, locale }: LoginClientProps) {
  const router = useRouter();
  
  const form = useForm<LoginFormData>({
    initialValues: {
      email: '',
      password: '',
    },
    validate: zodResolver(loginSchema),
  });

  const handleSubmit = async (values: LoginFormData) => {
    try {
      // TODO: Implement actual Better Auth login
      // For now, we'll simulate the login
      console.log('Login attempt:', values);
      
      notifications.show({
        title: 'Demo Mode',
        message: 'Authentication is not yet connected. This is a UI demo.',
        color: 'blue',
      });

      // Simulate successful login
      setTimeout(() => {
        router.push(`/${locale}`);
      }, 1000);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'An unexpected error occurred',
        color: 'red',
      });
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'twitter') => {
    notifications.show({
      title: 'Demo Mode',
      message: `Social login with ${provider} is not yet implemented`,
      color: 'blue',
    });
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
            
            <Button type="submit" size="lg" fullWidth>
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