import { Card, Container } from '@mantine/core';

type Props = {
  children: React.ReactNode;
};

export default function AuthLayout({ children }: Props) {
  return (
    <Container size="sm" py="xl">
      <Card shadow="md" radius="md" p="xl" withBorder>
        {children}
      </Card>
    </Container>
  );
}
