import {
  Badge,
  Card,
  Container,
  Grid,
  Group,
  Image,
  Text,
  Title,
} from "@mantine/core";
import Link from "next/link";

const mockPhotos = [
  { id: "1", category: "Nature", title: "Sunset Beach", views: 1234 },
  { id: "2", category: "Urban", title: "City Lights", views: 5678 },
  { id: "3", category: "Nature", title: "Mountain Peak", views: 3456 },
  { id: "4", category: "Lifestyle", title: "Coffee Shop", views: 2345 },
  { id: "5", category: "Nature", title: "Forest Path", views: 4567 },
  { id: "6", category: "Astronomy", title: "Night Sky", views: 6789 },
  { id: "7", category: "Nature", title: "Ocean Waves", views: 3456 },
  { id: "8", category: "Urban", title: "Street Art", views: 2345 },
];

export default function GalleryPage() {
  return (
    <Container py="xl" size="xl">
      <Title order={1} mb="xl">
        Photo Gallery
      </Title>

      <Grid>
        {mockPhotos.map((photo) => (
          <Grid.Col key={photo.id} span={{ base: 12, lg: 3, md: 4, sm: 6 }}>
            <Card
              href={`/gallery/${photo.id}` as any}
              component={Link}
              withBorder
              style={{ cursor: "pointer" }}
              radius="md"
            >
              <Card.Section>
                <Image
                  alt={photo.title}
                  height={200}
                  src={`https://placehold.co/400x300?text=${encodeURIComponent(photo.title)}`}
                />
              </Card.Section>

              <Group justify="space-between" mt="md">
                <Text fw={500}>{photo.title}</Text>
                <Badge color="blue" size="sm" variant="light">
                  {photo.category}
                </Badge>
              </Group>

              <Text c="dimmed" mt="xs" size="sm">
                {photo.views.toLocaleString()} views
              </Text>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  );
}
