import { Container, Grid } from '@mantine/core';

type Props = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: Props) {
  return (
    <Container size="xl" py="md">
      <Grid>
        <Grid.Col span={12}>{children}</Grid.Col>
      </Grid>
    </Container>
  );
}
