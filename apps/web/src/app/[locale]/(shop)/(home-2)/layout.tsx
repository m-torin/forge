import { type Metadata } from "next";

import { Header2 } from "@repo/design-system/mantine-ciseco";

import { ApplicationLayout } from "../application-layout";

export const metadata: Metadata = {
  description:
    "Ciseco is a modern and elegant template for Next.js, Tailwind CSS, and TypeScript. It is designed to be simple and easy to use, with a focus on performance and accessibility.",
  keywords: [
    "Next.js",
    "Tailwind CSS",
    "TypeScript",
    "Ciseco",
    "Headless UI",
    "Fashion",
    "E-commerce",
  ],
  title: "Ciseco",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ApplicationLayout header={<Header2 hasBorder={false} />}>
      {children}
    </ApplicationLayout>
  );
}
