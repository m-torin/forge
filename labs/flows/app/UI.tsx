'use client';

import { staggerContainer, createCommonVariants } from '#/ui/animations';
import { AppNav } from '#/ui/app';
// import { HeroGuideText } from '#/ui/marketing';
import {
  Box,
  Button,
  Center,
  Group,
  Portal,
  Stack,
} from '@mantine/core';
import {
  IconLogs,
  IconTable,
  IconNumber2,
  IconNumber3,
  IconDashboard,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const ActionButtons: React.FC = () => (
  <motion.div
    variants={staggerContainer}
    initial="initial"
    animate="animate"
    exit="exit"
  >
    <Group justify="center">
      <motion.div
        variants={createCommonVariants(0.2)}
        whileHover={{ scale: 1.1 }}
      >
        <Button
          leftSection={<IconTable size={16} />}
          component={Link}
          href="/flows"
          variant="light"
          color="indigo"
          size="lg"
        >
          All Flows
        </Button>
      </motion.div>

      <motion.div
        variants={createCommonVariants(0.2)}
        whileHover={{ scale: 1.1 }}
      >
        <Button
          leftSection={<IconTable size={16} />}
          component={Link}
          href="/tags"
          variant="light"
          color="orange"
          size="lg"
        >
          Tags
        </Button>
      </motion.div>

      <motion.div
        variants={createCommonVariants(0.4)}
        whileHover={{ scale: 1.1 }}
      >
        <Button
          leftSection={<IconDashboard size={16} />}
          component={Link}
          href="/monitoring"
          variant="light"
          color="blue"
          size="lg"
        >
          Monitoring
        </Button>
      </motion.div>

      <motion.div
        variants={createCommonVariants(0.6)}
        whileHover={{ scale: 1.1 }}
      >
        <Button
          leftSection={<IconLogs size={16} />}
          component={Link}
          href="/auditing"
          variant="light"
          color="cyan"
          size="lg"
        >
          Auditing
        </Button>
      </motion.div>
    </Group>
  </motion.div>
);

export const InstanceHomeUI = () => {
  const buttonStyle = { color: 'var(--mantine-color-gray-7)' };
  const _commonProps = {
    variant: '',
    color: 'gray.1',
    style: buttonStyle,
    radius: 'md',
    size: 'lg',
  };

  const _buttonData = [
    { icon: IconTable, text: 'All Flows', href: '/flows', color: 'indigo' },
    {
      icon: IconNumber2,
      text: 'New Company Experience',
      href: '',
      color: 'blue',
      disabled: true,
    },
    { icon: IconNumber3, text: 'Demo Instance', href: '/demo', color: 'cyan' },
  ];

  return (
    <>
      <Center h="calc(100vh - 60px)">
        <Stack gap="0">
          {/* <HeroGuideText
            titlePre="Say hi to"
            titleGradient="Flowbuilder"
            subtitle="Business Logic Engine at-scale"
            maxWidth={800}
            text={
              <>
                Government and enterprise friendly flow builder
                <br />
                with audit controls, data revisions, and multi-user support.
              </>
            }
          /> */}

          <Box mt="0">
            <ActionButtons />
          </Box>
        </Stack>
      </Center>

      <Portal target="#applayout-header-left">
        <AppNav />
      </Portal>

      {/* <Portal target="#applayout-header-right">
        <Autocomplete
          placeholder="Search everything"
          mr={rem(25)}
          leftSection={
            <IconSearch
              style={{ width: rem(16), height: rem(16) }}
              stroke={1.5}
            />
          }
          data={[
            'React',
            'Angular',
            'Vue',
            'Next.js',
            'Riot.js',
            'Svelte',
            'Blitz.js',
          ]}
          visibleFrom="xs"
        />
      </Portal> */}
    </>
  );
};
