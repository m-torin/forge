"use client";

import {
  Avatar,
  Badge,
  Button,
  Group,
  Image,
  Modal,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconDownload, IconHeart, IconShare, IconX } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface InterceptedPhotoPageProps {
  params: Promise<{ id: string }>;
}

export default function InterceptedPhotoPage({
  params,
}: InterceptedPhotoPageProps) {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    params
      .then((resolvedParams) => {
        setId(resolvedParams.id);
        return resolvedParams;
      })
      .catch((error) => {
        console.error("Error resolving params:", error);
      });
  }, [params]);

  if (!id) {
    return null; // or loading state
  }

  // Mock photo data
  const photo = {
    id,
    category: "Nature",
    likes: 567,
    photographer: {
      name: "John Doe",
      avatar: "JD",
    },
    title: `Photo ${id}`,
    views: 1234,
  };

  return (
    <Modal
      onClose={() => router.back()}
      opened={true}
      withCloseButton={false}
      styles={{
        body: { padding: 0 },
        content: { overflow: "hidden" },
      }}
      centered
      padding={0}
      size="xl"
    >
      <div style={{ position: "relative" }}>
        <Button
          color="dark"
          onClick={() => router.back()}
          style={{
            position: "absolute",
            right: 10,
            top: 10,
            zIndex: 10,
          }}
          size="compact-sm"
          variant="filled"
        >
          <IconX size={16} />
        </Button>

        <Image
          style={{ display: "block" }}
          alt={photo.title}
          src={`https://placehold.co/800x600?text=${encodeURIComponent(photo.title)}`}
        />

        <Stack gap="sm" p="md">
          <Group justify="space-between">
            <Title order={3}>{photo.title}</Title>
            <Badge color="blue" variant="light">
              {photo.category}
            </Badge>
          </Group>

          <Group justify="space-between">
            <Group gap="sm">
              <Avatar color="blue" radius="xl" size="sm">
                {photo.photographer.avatar}
              </Avatar>
              <Text size="sm">{photo.photographer.name}</Text>
            </Group>

            <Group gap="xs">
              <Text c="dimmed" size="sm">
                {photo.views.toLocaleString()} views
              </Text>
              <Text c="dimmed" size="sm">
                •
              </Text>
              <Text c="dimmed" size="sm">
                {photo.likes} likes
              </Text>
            </Group>
          </Group>

          <Group gap="xs">
            <Button
              leftSection={<IconHeart size={16} />}
              size="sm"
              variant="light"
            >
              Like
            </Button>
            <Button
              leftSection={<IconDownload size={16} />}
              size="sm"
              variant="light"
            >
              Download
            </Button>
            <Button
              leftSection={<IconShare size={16} />}
              size="sm"
              variant="light"
            >
              Share
            </Button>
            <Button
              onClick={() => {
                router.push(`/gallery/${id}` as any);
              }}
              size="sm"
              variant="subtle"
            >
              View Full Details
            </Button>
          </Group>
        </Stack>
      </div>
    </Modal>
  );
}
