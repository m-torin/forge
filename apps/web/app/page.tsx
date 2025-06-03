import { redirect } from "next/navigation";

// Fallback page for root URL
// This handles cases where the internationalization middleware
// doesn't properly rewrite the root path
export default function RootPage() {
  redirect("/en");
}
