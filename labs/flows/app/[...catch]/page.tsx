import { Code, Container, Title } from '@mantine/core';

export default async function CatchAll({
  params,
}: {
  params: Promise<{ catch: string[] }>;
}) {
  const resolvedParams = await params;

  return (
    <Container size="sm">
      <Title order={1} mb="md">
        Catch-All Route
      </Title>
      <Code block>{JSON.stringify(resolvedParams, null, 2)}</Code>
    </Container>
  );
}
