import { Box, Center, Container, Stack, Title } from '@mantine/core';

import { getDictionary } from '@repo/internationalization';
import { JsonLd } from '@repo/seo/json-ld';
import { createMetadata } from '@repo/seo/metadata';

import type { Blog, WithContext } from '@repo/seo/json-ld';
import type { Metadata } from 'next';

interface BlogProps {
  params: Promise<{
    locale: string;
  }>;
}

export const generateMetadata = async ({ params }: BlogProps): Promise<Metadata> => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return createMetadata(dictionary.web.blog.meta);
};

const BlogIndex = async ({ params }: BlogProps) => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  const jsonLd: WithContext<Blog> = {
    '@type': 'Blog',
    '@context': 'https://schema.org',
  };

  return (
    <>
      <JsonLd code={jsonLd} />
      <Box py={{ base: 80, lg: 160 }}>
        <Container size="xl">
          <Stack gap={56}>
            <Box>
              <Title order={1} fw={400} maw={600} size="h1">
                {dictionary.web.blog.meta.title}
              </Title>
            </Box>
            <Center mih={400}>
              <Title fw={700} size={72}>
                Hello World
              </Title>
            </Center>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default BlogIndex;
