'use client';

import { Carousel } from '@mantine/carousel';
import { Box, Container, Paper, Stack, Text, Title } from '@mantine/core';
import { useEffect, useState } from 'react';

import type { Dictionary } from '@repo/internationalization';

interface CasesProps {
  dictionary: Dictionary;
}

export const Cases = ({ dictionary }: CasesProps) => {
  const [embla, setEmbla] = useState<any>(null);

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
    }, 1000);

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
            {dictionary.web.home.cases.title}
          </Title>
          <Carousel
            slideGap="md"
            slideSize={{ base: '25%', lg: '16.66%' }}
            withControls={false}
            getEmblaApi={setEmbla}
            w="100%"
          >
            {Array.from({ length: 15 }, (_, index) => index + 1).map((logoNumber) => (
              <Carousel.Slide key={`logo-${logoNumber}`}>
                <Paper style={{ aspectRatio: '1' }} bg="gray.0" p="xl" radius="md">
                  <Box
                    style={{
                      alignItems: 'center',
                      display: 'flex',
                      height: '100%',
                      justifyContent: 'center',
                    }}
                  >
                    <Text size="sm">Logo {logoNumber}</Text>
                  </Box>
                </Paper>
              </Carousel.Slide>
            ))}
          </Carousel>
        </Stack>
      </Container>
    </Box>
  );
};
