import { Anchor, Center, Container, Group, Stack, Text, Title } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';

import { createMetadata } from '@repo/seo/metadata';

import type { Metadata, Route } from 'next';

interface BlogPostProperties {
  readonly params: Promise<{
    slug: string;
  }>;
}

export const generateMetadata = async ({ params }: BlogPostProperties): Promise<Metadata> => {
  const { slug: _slug } = await params;
  return createMetadata({
    description: 'A placeholder page',
    title: 'Hello World',
  });
};

export const generateStaticParams = async (): Promise<{ slug: string }[]> => {
  return [{ slug: 'hello-world' }];
};

const BlogPost = async ({ params }: BlogPostProperties) => {
  const { slug } = await params;

  return (
    <Container py={64}>
      <Anchor href={'/blog' as Route} component={Link} c="dimmed" size="sm" underline="never">
        <Group align="center" gap={4}>
          <IconArrowLeft size={16} />
          Back to Blog
        </Group>
      </Anchor>
      <Center mih={400} mt={64}>
        <Stack align="center" gap="md">
          <Title fw={700} size={72}>
            Hello World
          </Title>
          <Text c="dimmed" size="xl">
            Slug: {slug}
          </Text>
        </Stack>
      </Center>
    </Container>
  );
};

export default BlogPost;
