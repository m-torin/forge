import { Button, Container, Group, Text, Title } from "@mantine/core";
import { IconHome } from "@tabler/icons-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <Container size="md" style={{ textAlign: "center", paddingTop: "10rem" }}>
      <Title size="h1" mb="md">
        404
      </Title>
      <Title order={2} mb="md">
        Page Not Found
      </Title>
      <Text mb="xl" c="dimmed">
        The page you are looking for does not exist.
      </Text>
      <Group justify="center">
        <Button
          component={Link}
          href={"/" as any}
          leftSection={<IconHome size={16} />}
          variant="filled"
        >
          Back to Home
        </Button>
      </Group>
    </Container>
  );
}
