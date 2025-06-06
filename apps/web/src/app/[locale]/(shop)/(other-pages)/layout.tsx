import { type Metadata } from "next";

import { ApplicationLayoutWithHeader } from "../application-layout-with-header";

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

export default function Layout({
  children,
  params: _params,
}: {
  children: React.ReactNode;
  params: any;
}) {
  return <ApplicationLayoutWithHeader>{children}</ApplicationLayoutWithHeader>;
}
