import { Accordion, Box, Button, Container, Grid, Stack, Text, Title } from '@mantine/core';
import { IconPhone } from '@tabler/icons-react';
import Link from 'next/link';

import type { Dictionary } from '@repo/internationalization';

interface FAQProps {
  dictionary: Dictionary;
}

export const FAQ = ({ dictionary }: FAQProps) => (
  <Box py={{ base: 40, lg: 80 }} w="100%">
    <Container size="xl">
      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <Stack gap="xl">
            <Stack gap="md">
              <Stack gap="xs">
                <Title order={4} style={{ letterSpacing: '-0.05em' }} fw={400} maw={600} size="h1">
                  {dictionary.web.home.faq.title}
                </Title>
                <Text style={{ lineHeight: 1.6 }} c="dimmed" maw={{ base: 600, lg: 400 }} size="lg">
                  {dictionary.web.home.faq.description}
                </Text>
              </Stack>
              <Box>
                <Button
                  href="/contact"
                  component={Link}
                  leftSection={<IconPhone size={16} />}
                  variant="default"
                >
                  {dictionary.web.home.faq.cta}
                </Button>
              </Box>
            </Stack>
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <Accordion radius="md" variant="separated">
            {dictionary.web.home.faq.items.map((item) => (
              <Accordion.Item key={item.question} value={item.question}>
                <Accordion.Control>{item.question}</Accordion.Control>
                <Accordion.Panel>{item.answer}</Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        </Grid.Col>
      </Grid>
    </Container>
  </Box>
);
