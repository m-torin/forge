"use server";

import { z } from "zod";
import { prisma } from "@repo/database/prisma";

const checkUserSchema = z.object({
  email: z.string().email(),
});

type CheckUserResult = {
  exists: boolean;
  hasName: boolean;
  error?: string;
};

export async function checkUserExists(email: string): Promise<CheckUserResult> {
  try {
    // Validate input
    const result = checkUserSchema.safeParse({ email });

    if (!result.success) {
      return {
        exists: false,
        hasName: false,
        error: "Invalid email format",
      };
    }

    const validated = result.data;

    // Check if database is available
    try {
      // Check if user exists in database
      const user = await prisma.user.findUnique({
        where: {
          email: validated.email.toLowerCase(),
        },
        select: {
          id: true,
          name: true,
          // Don't expose sensitive information
        },
      });

      return {
        exists: !!user,
        hasName: !!user?.name,
      };
    } catch (dbError) {
      // Log database errors but don't expose them
      console.error("Database error in checkUserExists:", dbError);

      // Return safe default - assume user doesn't exist
      return {
        exists: false,
        hasName: false,
        error: "Unable to check user status",
      };
    }
  } catch (error) {
    // Catch any unexpected errors
    console.error("Unexpected error in checkUserExists:", error);

    return {
      exists: false,
      hasName: false,
      error: "An unexpected error occurred",
    };
  }
}
