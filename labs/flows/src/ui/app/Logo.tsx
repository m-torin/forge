'use client';

import React, { memo, useState } from 'react';
import { Group, ActionIcon, Text, Anchor, rem } from '@mantine/core';
import { IconGitCherryPick } from '@tabler/icons-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@mantine/hooks';

interface AnimatedAnchorProps {
  href: string;
  text: string;
}

const AnimatedAnchor: React.FC<AnimatedAnchorProps> = ({ href, text }) => {
  const reduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  const anchorAnimation = reduceMotion
    ? {}
    : {
        initial: { scale: 1 },
        whileHover: { scale: 1.1 },
        whileFocus: { scale: 1.1 },
      };

  const actionIconAnimation = reduceMotion
    ? {}
    : {
        animate: hovered ? { rotate: 20 } : { rotate: 0 },
        transition: {
          type: 'spring',
          stiffness: 300,
          delay: hovered ? 0.05 : 0,
        },
      };

  const textAnimation = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        transition: { duration: 0.5 },
        whileHover: { color: '#00aaff' },
      };

  return (
    <motion.div {...anchorAnimation} style={{ willChange: 'transform' }}>
      <Anchor
        component={Link}
        href={href}
        underline="never"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Group gap={rem(5)}>
          <motion.div
            {...actionIconAnimation}
            style={{ willChange: 'transform' }}
          >
            <ActionIcon
              variant="light"
              size="lg"
              radius="md"
              aria-label="Settings"
              color="cyan.6"
            >
              <IconGitCherryPick size={rem(30)} stroke={1.5} />
            </ActionIcon>
          </motion.div>
          <motion.div
            {...textAnimation}
            style={{ willChange: 'opacity, transform, color' }}
          >
            <Text c="black" fw={700} visibleFrom="sm">
              {text}
            </Text>
          </motion.div>
        </Group>
      </Anchor>
    </motion.div>
  );
};

export const AnimatedAnchorMemo = memo(AnimatedAnchor);
