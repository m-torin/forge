import WebHeader2 from "@/components/WebHeader2";
import { type ReactNode } from "react";

import { ApplicationLayout } from "./application-layout";

interface Props {
  children: ReactNode;
}

export async function ApplicationLayoutWithHeader({ children }: Props) {
  return (
    <ApplicationLayout header={<WebHeader2 />}>{children}</ApplicationLayout>
  );
}
