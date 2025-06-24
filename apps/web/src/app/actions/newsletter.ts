"use server";

import { z } from "zod";

// Define the schema for newsletter subscription
const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  preferences: z
    .object({
      weekly: z.boolean().default(true),
      productUpdates: z.boolean().default(false),
      promotions: z.boolean().default(false),
    })
    .optional(),
});

export type NewsletterFormData = z.infer<typeof newsletterSchema>;

export async function subscribeToNewsletter(formData: FormData) {
  try {
    // Parse and validate the form data
    const rawData = {
      email: formData.get("email"),
      name: formData.get("name"),
      preferences: {
        weekly: formData.get("weekly") === "on",
        productUpdates: formData.get("productUpdates") === "on",
        promotions: formData.get("promotions") === "on",
      },
    };

    const validated = newsletterSchema.parse(rawData);

    // TODO: Implement actual newsletter subscription logic here
    // For now, we'll simulate a successful subscription
    console.log("Newsletter subscription:", validated);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Send notification (if implemented)
    // await notifications.send({
    //   to: validated.email,
    //   subject: 'Welcome to our newsletter!',
    //   // ... other notification details
    // });

    return {
      success: true,
      message: `Thank you ${validated.name}! You've been subscribed to our newsletter.`,
      data: validated,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation failed",
        errors: error.errors.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        })),
      };
    }

    console.error("Newsletter subscription error:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}

// Example of a simple server action with inline validation
export async function quickSubscribe(email: string) {
  const result = z.string().email().safeParse(email);

  if (!result.success) {
    return {
      success: false,
      message: "Please provide a valid email address",
    };
  }

  // TODO: Implement quick subscription logic
  console.log("Quick subscription for:", result.data);

  return {
    success: true,
    message: "You have been subscribed!",
  };
}
