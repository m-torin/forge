"use client";

import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import {
  TextInput,
  Button,
  Paper,
  Title,
  Text,
  Checkbox,
  Group,
  Stack,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconMail, IconCheck, IconX } from "@tabler/icons-react";
import { z } from "zod";
import { subscribeToNewsletter } from "@/app/actions/newsletter";
import { useState } from "react";

// Define the schema for the form
const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  weekly: z.boolean().default(true),
  productUpdates: z.boolean().default(false),
  promotions: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export function NewsletterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    validate: zodResolver(formSchema),
    initialValues: {
      email: "",
      name: "",
      weekly: true,
      productUpdates: false,
      promotions: false,
    },
  });

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    try {
      // Create FormData for server action
      const formData = new FormData();
      formData.append("email", values.email);
      formData.append("name", values.name);
      if (values.weekly) formData.append("weekly", "on");
      if (values.productUpdates) formData.append("productUpdates", "on");
      if (values.promotions) formData.append("promotions", "on");

      // Call server action
      const result = await subscribeToNewsletter(formData);

      if (result.success) {
        notifications.show({
          title: "Success!",
          message: result.message,
          color: "green",
          icon: <IconCheck size={16} />,
        });
        form.reset();
      } else {
        notifications.show({
          title: "Error",
          message: result.message,
          color: "red",
          icon: <IconX size={16} />,
        });

        // Show field-specific errors if available
        if ("errors" in result && result.errors) {
          result.errors.forEach((error) => {
            form.setFieldError(error.path as keyof FormValues, error.message);
          });
        }
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Something went wrong. Please try again.",
        color: "red",
        icon: <IconX size={16} />,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper radius="md" p="xl" withBorder>
      <Title order={3} className="text-center mb-4">
        Subscribe to Our Newsletter
      </Title>
      <Text size="sm" c="dimmed" className="text-center mb-6">
        Get the latest updates delivered to your inbox
      </Text>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Name"
            placeholder="Your name"
            withAsterisk
            data-testid="newsletter-name-input"
            {...form.getInputProps("name")}
          />

          <TextInput
            label="Email"
            placeholder="your@email.com"
            withAsterisk
            leftSection={<IconMail size={16} />}
            data-testid="newsletter-email-input"
            {...form.getInputProps("email")}
          />

          <Stack gap="xs">
            <Text size="sm" fw={500}>
              Email preferences
            </Text>
            <Checkbox
              label="Weekly newsletter"
              data-testid="newsletter-weekly-checkbox"
              {...form.getInputProps("weekly", { type: "checkbox" })}
            />
            <Checkbox
              label="Product updates"
              data-testid="newsletter-updates-checkbox"
              {...form.getInputProps("productUpdates", { type: "checkbox" })}
            />
            <Checkbox
              label="Promotions and offers"
              data-testid="newsletter-promotions-checkbox"
              {...form.getInputProps("promotions", { type: "checkbox" })}
            />
          </Stack>

          <Button
            type="submit"
            fullWidth
            loading={isSubmitting}
            data-testid="newsletter-submit-button"
          >
            Subscribe
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
