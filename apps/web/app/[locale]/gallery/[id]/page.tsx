import {
  Avatar,
  Badge,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Image,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import Link from "next/link";

interface PhotoPageProps {
  params: Promise<{ id: string }>;
}

export default async function PhotoPage({ params }: PhotoPageProps) {
  const { id } = await params;

  // Mock photo data
  const photo = {
    id,
    camera: "Canon EOS R5",
    category: "Nature",
    description:
      "This is a beautiful photograph captured during golden hour. The lighting and composition create a stunning visual experience.",
    lens: "24-70mm f/2.8",
    likes: 567,
    photographer: {
      name: "John Doe",
      avatar: "JD",
    },
    settings: "ISO 100, f/8, 1/125s",
    tags: ["landscape", "sunset", "nature", "photography"],
    title: `Photo ${id}`,
    views: 1234,
  };

  const relatedPhotos = [
    { id: "10", title: "Similar Shot 1" },
    { id: "11", title: "Similar Shot 2" },
    { id: "12", title: "Similar Shot 3" },
  ];

  return (
    <Container py="xl" size="xl">
      <Link href="/gallery">
        <Button mb="md" variant="subtle">
          ← Back to Gallery
        </Button>
      </Link>

      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card withBorder>
            <Image
              alt={photo.title}
              radius="md"
              src={`https://placehold.co/800x600?text=${encodeURIComponent(photo.title)}`}
            />
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack>
            <Card withBorder>
              <Stack>
                <Group justify="space-between">
                  <Title order={2}>{photo.title}</Title>
                  <Badge color="blue" variant="light">
                    {photo.category}
                  </Badge>
                </Group>

                <Group>
                  <Avatar color="blue" radius="xl">
                    {photo.photographer.avatar}
                  </Avatar>
                  <div>
                    <Text fw={500} size="sm">
                      {photo.photographer.name}
                    </Text>
                    <Text c="dimmed" size="xs">
                      Photographer
                    </Text>
                  </div>
                </Group>

                <Text>{photo.description}</Text>

                <Group>
                  <Text c="dimmed" size="sm">
                    {photo.views.toLocaleString()} views
                  </Text>
                  <Text c="dimmed" size="sm">
                    {photo.likes} likes
                  </Text>
                </Group>

                <Group>
                  <Button fullWidth>Download</Button>
                  <Button fullWidth variant="outline">
                    Share
                  </Button>
                </Group>
              </Stack>
            </Card>

            <Card withBorder>
              <Title order={4} mb="md">
                Camera Details
              </Title>
              <Stack gap="xs">
                <Text size="sm">
                  <strong>Camera:</strong> {photo.camera}
                </Text>
                <Text size="sm">
                  <strong>Lens:</strong> {photo.lens}
                </Text>
                <Text size="sm">
                  <strong>Settings:</strong> {photo.settings}
                </Text>
              </Stack>
            </Card>

            <Card withBorder>
              <Title order={4} mb="md">
                Tags
              </Title>
              <Group gap="xs">
                {photo.tags.map((tag) => (
                  <Badge key={tag} variant="light">
                    {tag}
                  </Badge>
                ))}
              </Group>
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>

      <Card withBorder mt="xl">
        <Title order={3} mb="md">
          Related Photos
        </Title>
        <Grid>
          {relatedPhotos.map((related) => (
            <Grid.Col key={related.id} span={{ base: 12, sm: 4 }}>
              <Card
                href={`/gallery/${related.id}` as any}
                component={Link}
                withBorder
              >
                <Image
                  alt={related.title}
                  height={150}
                  src={`https://placehold.co/300x200?text=${encodeURIComponent(related.title)}`}
                />
                <Text mt="sm">{related.title}</Text>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </Card>
    </Container>
  );
}
