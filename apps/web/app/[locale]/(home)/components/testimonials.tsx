'use client';

import { Carousel } from '@mantine/carousel';
import { Avatar, Box, Container, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { IconUser } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import type { Dictionary } from '@repo/internationalization';

interface TestimonialsProps {
  dictionary: Dictionary;
}

export const Testimonials = ({ dictionary }: TestimonialsProps) => {
  const [embla, setEmbla] = useState<any>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!embla) {
      return;
    }

    const interval = setInterval(() => {
      if (embla.canScrollNext()) {
        embla.scrollNext();
      } else {
        embla.scrollTo(0);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [embla]);

  return (
    <Box py={{ base: 40, lg: 80 }} w="100%">
      <Container size="xl">
        <Stack gap="xl">
          <Title
            order={2}
            style={{ letterSpacing: '-0.05em' }}
            fw={400}
            maw={{ lg: 600 }}
            size="h1"
          >
            {dictionary.web.home.testimonials.title}
          </Title>
          <Carousel
            slideGap="md"
            slideSize={{ base: '100%', lg: '50%' }}
            getEmblaApi={setEmbla}
            w="100%"
          >
            {dictionary.web.home.testimonials.items.map((item, index) => (
              <Carousel.Slide key={index}>
                <Paper style={{ aspectRatio: '16/9' }} bg="gray.0" h="100%" p="xl" radius="md">
                  <Stack h="100%" justify="space-between">
                    <IconUser stroke={1} size={32} />
                    <Stack gap="md">
                      <Stack gap="xs">
                        <Title order={3} style={{ letterSpacing: '-0.025em' }} fw={400} size="h4">
                          {item.title}
                        </Title>
                        <Text c="dimmed" maw={300}>
                          {item.description}
                        </Text>
                      </Stack>
                      <Group align="center" gap="xs">
                        <Text c="dimmed" size="sm">
                          By
                        </Text>
                        <Avatar size="sm" src={item.author.image}>
                          ??
                        </Avatar>
                        <Text size="sm">{item.author.name}</Text>
                      </Group>
                    </Stack>
                  </Stack>
                </Paper>
              </Carousel.Slide>
            ))}
          </Carousel>
        </Stack>
      </Container>
    </Box>
  );
};
