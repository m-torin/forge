import { Anchor, Group, Text } from '@mantine/core';
import { IconBrandFramerMotion } from '@tabler/icons-react';
import Link from 'next/link';
import { type FC } from 'react';

interface LogoProps {
  className?: string;
  'data-testid'?: string;
  locale?: string;
}

const Logo: FC<LogoProps> = ({ className = '', 'data-testid': testId = 'logo', locale = 'en' }) => {
  return (
    <Anchor
      className={className}
      component={Link}
      data-testid={testId}
      href={`/${locale}`}
      underline="never"
    >
      <Group ta="center" gap="xs">
        <IconBrandFramerMotion className="text-blue-500 dark:text-blue-400" size={32} />
        <Text className="text-neutral-900 dark:text-white" fw={700} size="lg">
          WebApp
        </Text>
      </Group>
    </Anchor>
  );
};

export default Logo;
