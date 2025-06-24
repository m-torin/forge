"use server";

import { auth } from "@repo/auth/server/next";
import { redirect } from "next/navigation";
import { z } from "zod";

// Schema for sign-in form
const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().optional(),
});

// Schema for sign-up form
const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

export async function signIn(formData: FormData) {
  try {
    const rawData = {
      email: formData.get("email"),
      password: formData.get("password"),
      rememberMe: formData.get("rememberMe") === "on",
    };

    const validated = signInSchema.parse(rawData);

    // Use the auth instance from @repo/auth
    const result = await auth.signIn.email({
      email: validated.email,
      password: validated.password,
      rememberMe: validated.rememberMe,
    });

    if (result.error) {
      return {
        success: false,
        message: result.error.message || "Invalid credentials",
      };
    }

    // Redirect to dashboard on success
    redirect("/dashboard");
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

    console.error("Sign in error:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
}

export async function signUp(formData: FormData) {
  try {
    const rawData = {
      email: formData.get("email"),
      password: formData.get("password"),
      name: formData.get("name"),
      acceptTerms: formData.get("acceptTerms") === "on",
    };

    const validated = signUpSchema.parse(rawData);

    // Use the auth instance from @repo/auth
    const result = await auth.signUp.email({
      email: validated.email,
      password: validated.password,
      name: validated.name,
    });

    if (result.error) {
      return {
        success: false,
        message: result.error.message || "Failed to create account",
      };
    }

    // Redirect to verification page or dashboard
    redirect("/verify-email");
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

    console.error("Sign up error:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
}

export async function signOut() {
  try {
    await auth.signOut();
    redirect("/");
  } catch (error) {
    console.error("Sign out error:", error);
    return {
      success: false,
      message: "Failed to sign out",
    };
  }
}

export async function getSession() {
  try {
    const session = await auth.getSession();
    return session;
  } catch (error) {
    console.error("Get session error:", error);
    return null;
  }
}
