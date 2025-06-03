'use client';

import { Alert, Button, Divider, Paper, Stack } from '@mantine/core';
import { IconBrandGithub, IconBrandGoogle, IconKey } from '@tabler/icons-react';
import { type ReactNode } from 'react';

interface AuthFormProps {
  availableSocialMethods?: {
    google?: boolean;
    github?: boolean;
  };
  children: ReactNode;
  error?: string | null;
  isLoading?: boolean;
  mode?: 'signin' | 'signup';
  onSocialSignIn?: (provider: 'google' | 'github') => void;
  showMagicLink?: boolean;
  showSocialOptions?: boolean;
  socialLoading?: string | null;
}

export const AuthForm = ({
  availableSocialMethods = { github: true, google: true },
  children,
  error,
  isLoading = false,
  mode = 'signin',
  onSocialSignIn,
  showMagicLink = true,
  showSocialOptions = true,
  socialLoading,
}: AuthFormProps) => {
  const isAnyLoading = isLoading || socialLoading !== null;

  return (
    <Paper shadow="sm" withBorder p="xl" radius="md">
      <Stack gap="lg">
        {error && (
          <Alert color="red" title={`${mode === 'signin' ? 'Sign in' : 'Sign up'} failed`}>
            {error}
          </Alert>
        )}

        {showSocialOptions && (
          <>
            <Stack gap="sm">
              {availableSocialMethods.google && (
                <Button
                  fullWidth
                  leftSection={<IconBrandGoogle size={20} />}
                  loading={socialLoading === 'google'}
                  onClick={() => onSocialSignIn?.('google')}
                  disabled={isAnyLoading}
                  size="md"
                  variant="outline"
                >
                  Continue with Google
                </Button>
              )}

              {availableSocialMethods.github && (
                <Button
                  fullWidth
                  leftSection={<IconBrandGithub size={20} />}
                  loading={socialLoading === 'github'}
                  onClick={() => onSocialSignIn?.('github')}
                  disabled={isAnyLoading}
                  size="md"
                  variant="outline"
                >
                  Continue with GitHub
                </Button>
              )}

              {showMagicLink && mode === 'signin' && (
                <Button
                  fullWidth
                  leftSection={<IconKey size={20} />}
                  onClick={() => {
                    // TODO: Implement magic link functionality
                    console.log('Magic link sign in not yet implemented');
                  }}
                  disabled={isAnyLoading}
                  size="md"
                  variant="outline"
                >
                  Sign in with Magic Link
                </Button>
              )}
            </Stack>

            <Divider labelPosition="center" label="or" />
          </>
        )}

        {children}
      </Stack>
    </Paper>
  );
};
