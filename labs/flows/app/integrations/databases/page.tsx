// DatabaseSettings.tsx
import { Box, Container, Paper, Title } from '@mantine/core';
import { DatabaseForm } from './UI';

const DatabaseSettings = () => {
  return (
    <Container>
      <Title mt="lg" order={1}>
        Global Databases
      </Title>

      <Paper shadow="xs" p="0" mt="lg">
        <Box p="md">
          <DatabaseForm />
        </Box>
      </Paper>
    </Container>
  );
};

export default DatabaseSettings;
