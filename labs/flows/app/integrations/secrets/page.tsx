import { SecretManager } from '#/ui/shared';
import { Box, Container, Title } from '@mantine/core';

const SecretsPage = () => {
  return (
    <Container>
      <Title mt="lg" order={1}>
        Secrets & Credentials
      </Title>

      <Box p="md">
        <SecretManager />
      </Box>
    </Container>
  );
};

export default SecretsPage;
