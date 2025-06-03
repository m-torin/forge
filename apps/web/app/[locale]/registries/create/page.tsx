"use client";

import {
  Alert,
  Button,
  Card,
  Container,
  Group,
  Select,
  Stack,
  Switch,
  TagsInput,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { IconCalendar, IconInfoCircle } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { analytics } from "@repo/analytics";

const registryTypes = [
  { label: "Wedding Registry", value: "wedding" },
  { label: "Baby Shower", value: "baby" },
  { label: "Birthday Wishlist", value: "birthday" },
  { label: "Housewarming", value: "housewarming" },
  { label: "Holiday Wishlist", value: "holiday" },
  { label: "Other", value: "other" },
];

export default function CreateRegistryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    validate: {
      name: (value) => (!value ? "Registry name is required" : null),
      type: (value) => (!value ? "Registry type is required" : null),
      coOwners: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmails = value.filter((email) => !emailRegex.test(email));
        return invalidEmails.length > 0
          ? `Invalid email(s): ${invalidEmails.join(", ")}`
          : null;
      },
      customType: (value, values) =>
        values.type === "other" && !value
          ? "Please specify the registry type"
          : null,
      description: (value) =>
        value.length > 500 ? "Description is too long" : null,
    },
    initialValues: {
      hideItemPrices: false,
      name: "",
      type: "wedding",
      allowContributions: true,
      coOwners: [] as string[],
      customType: "",
      deliveryAddress: "",
      description: "",
      eventDate: null as Date | null,
      isPublic: true,
      thankYouMessage: "",
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setIsLoading(true);

    // Track registry creation
    analytics.capture("registry_created", {
      coOwnerCount: values.coOwners.length,
      hasEventDate: !!values.eventDate,
      isPublic: values.isPublic,
      registryType: values.type,
    });

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In a real app, this would return the created registry ID
    const newRegistryId = Math.random().toString(36).substr(2, 9);

    router.push(`/registries/${newRegistryId}` as any);
  };

  const getTypeDescription = (type: string) => {
    switch (type) {
      case "wedding":
        return "Perfect for couples planning their special day";
      case "baby":
        return "Help welcome a new bundle of joy";
      case "birthday":
        return "Create a wishlist for your birthday";
      case "housewarming":
        return "Get essentials for your new home";
      case "holiday":
        return "Share your holiday wishlist with loved ones";
      default:
        return "Create a custom registry for any occasion";
    }
  };

  return (
    <Container py="xl" size="md">
      <Link href="/registries">
        <Button mb="md" variant="subtle">
          ← Back to Registries
        </Button>
      </Link>

      <Title order={1} mb="md">
        Create New Registry
      </Title>
      <Text c="dimmed" mb="xl">
        Set up your gift registry in just a few steps
      </Text>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          <Card withBorder>
            <Title order={3} mb="md">
              Basic Information
            </Title>
            <Stack>
              <TextInput
                placeholder="e.g., John & Jane's Wedding Registry"
                label="Registry Name"
                required
                {...form.getInputProps("name")}
              />

              <Select
                placeholder="Select registry type"
                data={registryTypes}
                label="Registry Type"
                required
                {...form.getInputProps("type")}
              />

              {form.values.type === "other" && (
                <TextInput
                  placeholder="e.g., Graduation, Anniversary, Retirement"
                  label="Custom Registry Type"
                  required
                  {...form.getInputProps("customType")}
                />
              )}

              <Text c="dimmed" size="sm">
                {getTypeDescription(form.values.type)}
              </Text>

              <Textarea
                placeholder="Tell your guests about your registry..."
                rows={4}
                label="Description"
                {...form.getInputProps("description")}
              />

              <DateInput
                leftSection={<IconCalendar size={16} />}
                placeholder="Select event date"
                clearable
                label="Event Date (optional)"
                {...form.getInputProps("eventDate")}
              />
            </Stack>
          </Card>

          <Card withBorder>
            <Title order={3} mb="md">
              Co-Owners
            </Title>
            <Stack>
              <Alert
                color="blue"
                icon={<IconInfoCircle size={16} />}
                variant="light"
              >
                Co-owners can manage the registry, add/remove items, and view
                purchase information
              </Alert>

              <TagsInput
                description="Press Enter after each email address"
                placeholder="Enter email addresses"
                label="Add co-owners by email"
                {...form.getInputProps("coOwners")}
                data={[]}
              />

              {form.values.type === "wedding" &&
                form.values.coOwners.length === 0 && (
                  <Text c="dimmed" size="sm">
                    For wedding registries, consider adding your partner as a
                    co-owner
                  </Text>
                )}
            </Stack>
          </Card>

          <Card withBorder>
            <Title order={3} mb="md">
              Privacy Settings
            </Title>
            <Stack>
              <Switch
                description="Allow anyone with the link to view your registry"
                label="Make registry public"
                {...form.getInputProps("isPublic", { type: "checkbox" })}
              />

              <Switch
                description="Let guests contribute partial amounts toward expensive items"
                label="Allow contributions"
                {...form.getInputProps("allowContributions", {
                  type: "checkbox",
                })}
              />

              <Switch
                description="Guests can see items but not their prices"
                label="Hide item prices from guests"
                {...form.getInputProps("hideItemPrices", { type: "checkbox" })}
              />
            </Stack>
          </Card>

          <Card withBorder>
            <Title order={3} mb="md">
              Additional Details
            </Title>
            <Stack>
              <Textarea
                placeholder="Where should gifts be delivered?"
                rows={3}
                label="Delivery Address (optional)"
                {...form.getInputProps("deliveryAddress")}
              />

              <Textarea
                placeholder="A message to show guests after they purchase an item..."
                rows={3}
                label="Thank You Message (optional)"
                {...form.getInputProps("thankYouMessage")}
              />
            </Stack>
          </Card>

          <Group justify="flex-end">
            <Button
              href={"/registries" as any}
              component={Link}
              variant="subtle"
            >
              Cancel
            </Button>
            <Button loading={isLoading} size="md" type="submit">
              Create Registry
            </Button>
          </Group>
        </Stack>
      </form>
    </Container>
  );
}
