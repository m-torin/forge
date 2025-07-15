'use client';

import { Button, Stack } from '@mantine/core';
import {
  IconBrandAzure,
  IconBrandDiscord,
  IconBrandFacebook,
  IconBrandGithub,
  IconBrandGoogle,
} from '@tabler/icons-react';

export interface SocialLoginButtonsProps {
  onGoogleClick?: () => void;
  onGitHubClick?: () => void;
  onMicrosoftClick?: () => void;
  onFacebookClick?: () => void;
  onDiscordClick?: () => void;
  loading?: boolean;
  fullWidth?: boolean;
  variant?: 'default' | 'filled' | 'light' | 'outline' | 'subtle' | 'transparent' | 'gradient';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function SocialLoginButtons({
  onGoogleClick,
  onGitHubClick,
  onMicrosoftClick,
  onFacebookClick,
  onDiscordClick,
  loading = false,
  fullWidth = true,
  variant = 'default',
  size = 'md',
}: SocialLoginButtonsProps) {
  return (
    <Stack gap="sm">
      {onGoogleClick && (
        <Button
          variant={variant}
          size={size}
          leftSection={<IconBrandGoogle size={20} />}
          onClick={onGoogleClick}
          disabled={loading}
          fullWidth={fullWidth}
          data-testid="social-login-google"
        >
          Continue with Google
        </Button>
      )}

      {onGitHubClick && (
        <Button
          variant={variant}
          size={size}
          leftSection={<IconBrandGithub size={20} />}
          onClick={onGitHubClick}
          disabled={loading}
          fullWidth={fullWidth}
          data-testid="social-login-github"
        >
          Continue with GitHub
        </Button>
      )}

      {onMicrosoftClick && (
        <Button
          variant={variant}
          size={size}
          leftSection={<IconBrandAzure size={20} />}
          onClick={onMicrosoftClick}
          disabled={loading}
          fullWidth={fullWidth}
          data-testid="social-login-microsoft"
        >
          Continue with Microsoft
        </Button>
      )}

      {onFacebookClick && (
        <Button
          variant={variant}
          size={size}
          leftSection={<IconBrandFacebook size={20} />}
          onClick={onFacebookClick}
          disabled={loading}
          fullWidth={fullWidth}
          data-testid="social-login-facebook"
        >
          Continue with Facebook
        </Button>
      )}

      {onDiscordClick && (
        <Button
          variant={variant}
          size={size}
          leftSection={<IconBrandDiscord size={20} />}
          onClick={onDiscordClick}
          disabled={loading}
          fullWidth={fullWidth}
          data-testid="social-login-discord"
        >
          Continue with Discord
        </Button>
      )}
    </Stack>
  );
}
