'use client';

import React from 'react';
import { Container, Flex, Stack, Text, Title, rem } from '@mantine/core';
import { motion } from 'framer-motion';
import { commonVariants, staggerContainer } from '#/ui/animations';

import classes from './PageFrame.module.scss';

interface PageFrameProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  sideContent?: React.ReactNode;
  animate?: boolean;
}

const PageFrameComponent: React.FC<PageFrameProps> = ({
  title,
  description,
  children,
  sideContent,
  animate = false,
}) => {
  const Wrapper = animate ? motion.div : React.Fragment;

  return (
    <Container size="lg" className={classes.container}>
      <Wrapper
        {...(animate && {
          initial: 'initial',
          animate: 'animate',
          exit: 'exit',
          variants: staggerContainer,
        })}
      >
        <Flex
          w="100%"
          gap="md"
          justify="space-between"
          align="flex-start"
          direction="row"
          wrap="nowrap"
          my={title ? rem(20) : 0}
        >
          {(title || description) && (
            <Stack gap={rem(4)}>
              {title &&
                (animate ? (
                  <motion.div variants={commonVariants}>
                    <Title order={1} lh={1} className={classes.title}>
                      {title}
                    </Title>
                  </motion.div>
                ) : (
                  <Title order={1} lh={1} className={classes.title}>
                    {title}
                  </Title>
                ))}

              {description &&
                (animate ? (
                  <motion.div variants={commonVariants}>
                    <Text size="lg" c="dimmed" className={classes.description}>
                      {description}
                    </Text>
                  </motion.div>
                ) : (
                  <Text size="lg" c="dimmed" className={classes.description}>
                    {description}
                  </Text>
                ))}
            </Stack>
          )}

          {sideContent && (
            <Flex w="auto" justify="flex-end" align="flex-start">
              {animate ? (
                <motion.div variants={commonVariants}>{sideContent}</motion.div>
              ) : (
                sideContent
              )}
            </Flex>
          )}
        </Flex>

        {animate ? (
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={commonVariants}
          >
            {children}
          </motion.div>
        ) : (
          children
        )}
      </Wrapper>
    </Container>
  );
};

export const PageFrame = React.memo(PageFrameComponent);
