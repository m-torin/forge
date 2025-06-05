'use client';

import { Anchor, Button, PasswordInput, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { createClientAnalytics, track, flag, flags } from '@repo/analytics/client';
import { signIn, signInWithGitHub, signInWithGoogle } from '@repo/auth-new/client';

import { AuthForm } from './auth-form';

export interface UnifiedSignInProps {
  /**
   * Route to forgot password page
   * @default '/forgot-password'
   */
  forgotPasswordRoute?: string;
  /**
   * Callback when user wants to navigate to forgot password
   * If provided, will be used instead of forgotPasswordRoute
   */
  onForgotPasswordNavigate?: () => void;
}

export const UnifiedSignIn = ({
  forgotPasswordRoute = '/forgot-password',
  onForgotPasswordNavigate,
}: UnifiedSignInProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authFlags, setAuthFlags] = useState<any>(null);

  // Feature flag hooks for individual auth methods
  const googleOAuthEnabled = useFlag(FLAGS.auth.oauth.google);
  const githubOAuthEnabled = useFlag(FLAGS.auth.oauth.github);
  const magicLinkEnabled = useFlag(FLAGS.auth.magicLink);

  useEffect(() => {
    // Load auth flags for analytics
    const loadAuthFlags = async () => {
      try {
        const flags = await getAuthFlags();
        setAuthFlags(flags);

        // Track auth methods availability
        analytics.capture('auth_methods_loaded', {
          githubOAuthEnabled: flags.githubOAuthEnabled,
          googleOAuthEnabled: flags.googleOAuthEnabled,
          magicLinkEnabled: flags.magicLinkEnabled,
          passkeyEnabled: flags.passkeyEnabled,
          source: 'unified_sign_in',
          twoFactorEnabled: flags.twoFactorOptional || flags.twoFactorRequired,
        });
      } catch (error) {
        console.error('Failed to load auth flags:', error);
      }
    };

    loadAuthFlags();
  }, []);

  const form = useForm({
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email address'),
      password: (value) => (value.length < 1 ? 'Password is required' : null),
    },
    initialValues: {
      email: '',
      password: '',
    },
  });

  const handleEmailSignIn = async (values: typeof form.values) => {
    setIsLoading(true);
    setError(null);

    analytics.capture('sign_in_attempted', {
      authMethodsAvailable: {
        github: githubOAuthEnabled,
        google: googleOAuthEnabled,
        magicLink: magicLinkEnabled,
        passkey: authFlags?.passkeyEnabled || false,
        twoFactor: authFlags?.twoFactorOptional || authFlags?.twoFactorRequired || false,
      },
      featureFlagsLoaded: !!authFlags,
      method: 'email',
      source: 'unified_sign_in',
    });

    try {
      await signIn.email({
        email: values.email,
        password: values.password,
      });

      analytics.capture('sign_in_completed', {
        authMethodsAvailable: {
          github: githubOAuthEnabled,
          google: googleOAuthEnabled,
          magicLink: magicLinkEnabled,
        },
        method: 'email',
        source: 'unified_sign_in',
      });

      analytics.identify(values.email);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
      setError(errorMessage);

      analytics.capture('sign_in_failed', {
        authMethodsAvailable: {
          github: githubOAuthEnabled,
          google: googleOAuthEnabled,
          magicLink: magicLinkEnabled,
        },
        error: errorMessage,
        method: 'email',
        source: 'unified_sign_in',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'github') => {
    // Check if provider is enabled via feature flag
    const isProviderEnabled = provider === 'google' ? googleOAuthEnabled : githubOAuthEnabled;

    if (!isProviderEnabled) {
      analytics.capture('sign_in_blocked', {
        method: provider,
        reason: 'feature_flag_disabled',
        source: 'unified_sign_in',
      });
      setError(`${provider} sign-in is currently unavailable`);
      return;
    }

    setIsSocialLoading(provider);
    setError(null);

    analytics.capture('sign_in_attempted', {
      authMethodsAvailable: {
        github: githubOAuthEnabled,
        google: googleOAuthEnabled,
        magicLink: magicLinkEnabled,
        passkey: authFlags?.passkeyEnabled || false,
        twoFactor: authFlags?.twoFactorOptional || authFlags?.twoFactorRequired || false,
      },
      featureFlagsLoaded: !!authFlags,
      method: provider,
      source: 'unified_sign_in',
    });

    try {
      if (provider === 'google') {
        await signInWithGoogle?.({ providerId: 'google' });
      } else {
        await signInWithGitHub?.({ providerId: 'github' });
      }

      analytics.capture('sign_in_completed', {
        authMethodsAvailable: {
          github: githubOAuthEnabled,
          google: googleOAuthEnabled,
          magicLink: magicLinkEnabled,
        },
        method: provider,
        source: 'unified_sign_in',
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : `Failed to sign in with ${provider}`;
      setError(errorMessage);

      analytics.capture('sign_in_failed', {
        authMethodsAvailable: {
          github: githubOAuthEnabled,
          google: googleOAuthEnabled,
          magicLink: magicLinkEnabled,
        },
        error: errorMessage,
        method: provider,
        source: 'unified_sign_in',
      });
    } finally {
      setIsSocialLoading(null);
    }
  };

  // Determine which social options to show based on feature flags
  const availableSocialMethods = {
    github: githubOAuthEnabled,
    google: googleOAuthEnabled,
  };
  const showSocialOptions = googleOAuthEnabled || githubOAuthEnabled;

  return (
    <AuthForm
      availableSocialMethods={availableSocialMethods}
      error={error}
      isLoading={isLoading}
      mode="signin"
      onSocialSignIn={handleSocialSignIn}
      showMagicLink={magicLinkEnabled}
      showSocialOptions={showSocialOptions}
      socialLoading={isSocialLoading}
    >
      <form onSubmit={form.onSubmit(handleEmailSignIn)}>
        <Stack>
          <TextInput
            placeholder="your@email.com"
            disabled={isSocialLoading !== null}
            label="Email address"
            required
            {...form.getInputProps('email')}
          />

          <PasswordInput
            placeholder="Your password"
            disabled={isSocialLoading !== null}
            label="Password"
            required
            {...form.getInputProps('password')}
          />

          <Stack gap="xs">
            <Button
              fullWidth
              loading={isLoading}
              disabled={isSocialLoading !== null}
              size="md"
              type="submit"
            >
              Sign in with Email
            </Button>

            <Text size="sm" ta="center">
              {onForgotPasswordNavigate ? (
                <Anchor
                  component="button"
                  onClick={onForgotPasswordNavigate}
                  c="dimmed"
                  type="button"
                >
                  Forgot your password?
                </Anchor>
              ) : (
                <Anchor href={forgotPasswordRoute as any} component={Link} c="dimmed">
                  Forgot your password?
                </Anchor>
              )}
            </Text>
          </Stack>
        </Stack>
      </form>
    </AuthForm>
  );
};
