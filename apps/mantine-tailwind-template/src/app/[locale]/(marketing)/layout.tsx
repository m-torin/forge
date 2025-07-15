import { Container } from '@mantine/core';

type Props = {
  children: React.ReactNode;
};

export default function MarketingLayout({ children }: Props) {
  return (
    <Container size="xl" py="md">
      {children}
    </Container>
  );
}
