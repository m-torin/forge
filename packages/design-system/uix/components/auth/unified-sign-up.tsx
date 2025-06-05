'use client';

import { Button, Checkbox, PasswordInput, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect, useState } from 'react';

import { createClientAnalytics, track, flag, flags } from '@repo/analytics/client';
import { signInWithGitHub, signInWithGoogle, signUp } from '@repo/auth-new/client';

import { AuthForm } from './auth-form';

export const UnifiedSignUp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authFlags, setAuthFlags] = useState<any>(null);

  // Feature flag hooks for individual auth methods
  const [googleOAuthEnabled, setGoogleOAuthEnabled] = useState(false);
  const [githubOAuthEnabled, setGithubOAuthEnabled] = useState(false);

  useEffect(() => {
    // Load auth flags for analytics
    const loadAuthFlags = async () => {
      try {
        const analytics = await createClientAnalytics({
          providers: {
            posthog: {
              apiKey: process.env.NEXT_PUBLIC_POSTHOG_API_KEY!,
              config: {
                api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
              },
            },
          },
        });

        // Evaluate individual flags
        const googleOAuth = await flag.evaluate('auth.oauth.google', false);
        const githubOAuth = await flag.evaluate('auth.oauth.github', false);
        const magicLink = await flag.evaluate('auth.magic-link', false);
        const passkey = await flag.evaluate('auth.passkey', false);
        const twoFactorOptional = await flag.evaluate('auth.two-factor-optional', false);
        const twoFactorRequired = await flag.evaluate('auth.two-factor-required', false);

        setGoogleOAuthEnabled(googleOAuth.value);
        setGithubOAuthEnabled(githubOAuth.value);
        setAuthFlags({
          googleOAuthEnabled: googleOAuth.value,
          githubOAuthEnabled: githubOAuth.value,
          magicLinkEnabled: magicLink.value,
          passkeyEnabled: passkey.value,
          twoFactorOptional: twoFactorOptional.value,
          twoFactorRequired: twoFactorRequired.value,
        });

        // Track auth methods availability for sign-up
        await analytics.emit(track('auth_methods_loaded', {
          githubOAuthEnabled: githubOAuth.value,
          googleOAuthEnabled: googleOAuth.value,
          magicLinkEnabled: magicLink.value,
          passkeyEnabled: passkey.value,
          source: 'unified_sign_up',
          twoFactorEnabled: twoFactorOptional.value || twoFactorRequired.value,
        }));
      } catch (error) {
        console.error('Failed to load auth flags:', error);
      }
    };

    loadAuthFlags();
  }, []);

  const form = useForm({
    validate: {
      name: (value) => (value.length < 2 ? 'Name must have at least 2 characters' : null),
      acceptTerms: (value) => (!value ? 'You must accept the terms of service' : null),
      confirmPassword: (value, values) =>
        value !== values.password ? 'Passwords do not match' : null,
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email address'),
      password: (value) => (value.length < 8 ? 'Password must be at least 8 characters' : null),
    },
    initialValues: {
      name: '',
      acceptTerms: false,
      confirmPassword: '',
      email: '',
      password: '',
    },
  });

  const handleEmailSignUp = async (values: typeof form.values) => {
    setIsLoading(true);
    setError(null);

    analytics.capture('sign_up_attempted', {
      authMethodsAvailable: {
        github: githubOAuthEnabled,
        google: googleOAuthEnabled,
        passkey: authFlags?.passkeyEnabled || false,
        twoFactor: authFlags?.twoFactorOptional || authFlags?.twoFactorRequired || false,
      },
      featureFlagsLoaded: !!authFlags,
      hasAcceptedTerms: values.acceptTerms,
      method: 'email',
      source: 'unified_sign_up',
    });

    try {
      await signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      analytics.capture('sign_up_completed', {
        authMethodsAvailable: {
          github: githubOAuthEnabled,
          google: googleOAuthEnabled,
        },
        method: 'email',
        source: 'unified_sign_up',
        userName: values.name,
      });

      analytics.identify(values.email, {
        name: values.name,
        created_at: new Date().toISOString(),
        signup_method: 'email',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign up';
      setError(errorMessage);

      analytics.capture('sign_up_failed', {
        authMethodsAvailable: {
          github: githubOAuthEnabled,
          google: googleOAuthEnabled,
        },
        error: errorMessage,
        method: 'email',
        source: 'unified_sign_up',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignUp = async (provider: 'google' | 'github') => {
    // Check if provider is enabled via feature flag
    const isProviderEnabled = provider === 'google' ? googleOAuthEnabled : githubOAuthEnabled;

    if (!isProviderEnabled) {
      analytics.capture('sign_up_blocked', {
        method: provider,
        reason: 'feature_flag_disabled',
        source: 'unified_sign_up',
      });
      setError(`${provider} sign-up is currently unavailable`);
      return;
    }

    setIsSocialLoading(provider);
    setError(null);

    analytics.capture('sign_up_attempted', {
      authMethodsAvailable: {
        github: githubOAuthEnabled,
        google: googleOAuthEnabled,
        passkey: authFlags?.passkeyEnabled || false,
        twoFactor: authFlags?.twoFactorOptional || authFlags?.twoFactorRequired || false,
      },
      featureFlagsLoaded: !!authFlags,
      method: provider,
      source: 'unified_sign_up',
    });

    try {
      if (provider === 'google') {
        await signInWithGoogle?.({ providerId: 'google' });
      } else {
        await signInWithGitHub?.({ providerId: 'github' });
      }

      analytics.capture('sign_up_completed', {
        authMethodsAvailable: {
          github: githubOAuthEnabled,
          google: googleOAuthEnabled,
        },
        method: provider,
        source: 'unified_sign_up',
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : `Failed to sign up with ${provider}`;
      setError(errorMessage);

      analytics.capture('sign_up_failed', {
        authMethodsAvailable: {
          github: githubOAuthEnabled,
          google: googleOAuthEnabled,
        },
        error: errorMessage,
        method: provider,
        source: 'unified_sign_up',
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
      mode="signup"
      onSocialSignIn={handleSocialSignUp}
      showMagicLink={false}
      showSocialOptions={showSocialOptions}
      socialLoading={isSocialLoading}
    >
      <form onSubmit={form.onSubmit(handleEmailSignUp)}>
        <Stack>
          <TextInput
            placeholder="John Doe"
            disabled={isSocialLoading !== null}
            label="Full name"
            required
            {...form.getInputProps('name')}
          />

          <TextInput
            placeholder="your@email.com"
            disabled={isSocialLoading !== null}
            label="Email address"
            required
            {...form.getInputProps('email')}
          />

          <PasswordInput
            placeholder="Create a secure password"
            disabled={isSocialLoading !== null}
            label="Password"
            required
            {...form.getInputProps('password')}
          />

          <PasswordInput
            placeholder="Confirm your password"
            disabled={isSocialLoading !== null}
            label="Confirm password"
            required
            {...form.getInputProps('confirmPassword')}
          />

          <Checkbox
            disabled={isSocialLoading !== null}
            label="I accept the Terms of Service and Privacy Policy"
            required
            {...form.getInputProps('acceptTerms', { type: 'checkbox' })}
          />

          <Button
            fullWidth
            loading={isLoading}
            disabled={isSocialLoading !== null}
            size="md"
            type="submit"
          >
            Create Account
          </Button>
        </Stack>
      </form>
    </AuthForm>
  );
};
