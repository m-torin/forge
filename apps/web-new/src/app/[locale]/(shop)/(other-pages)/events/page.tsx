import { type Metadata } from "next";
import Link from "next/link";

import {
  Breadcrumb,
} from "@repo/design-system/mantine-ciseco";

export const metadata: Metadata = {
  description: "Discover upcoming events and special occasions",
  title: "Events",
};

// Mock data - replace with real API calls
async function getEvents() {
  return [
    {
      id: "1",
      name: "Summer Music Festival 2024",
      type: "festival",
      date: "July 15-17, 2024",
      location: "Central Park, NY",
      productCount: 450,
      slug: "summer-music-festival-2024",
    },
    {
      id: "2",
      name: "Fashion Week NYC",
      type: "fashion",
      date: "September 5-12, 2024",
      location: "Various Venues, NYC",
      productCount: 1200,
      slug: "fashion-week-nyc",
    },
    {
      id: "3",
      name: "Black Friday Sale",
      type: "sale",
      date: "November 29, 2024",
      location: "Online & In-Store",
      productCount: 5000,
      slug: "black-friday-2024",
    },
    {
      id: "4",
      name: "Holiday Gift Guide",
      type: "seasonal",
      date: "December 1-25, 2024",
      location: "Worldwide",
      productCount: 3200,
      slug: "holiday-gift-guide-2024",
    },
    {
      id: "5",
      name: "Spring Collection Launch",
      type: "launch",
      date: "March 20, 2024",
      location: "All Stores",
      productCount: 800,
      slug: "spring-collection-2024",
    },
    {
      id: "6",
      name: "Outdoor Gear Expo",
      type: "expo",
      date: "June 8-10, 2024",
      location: "Denver, CO",
      productCount: 650,
      slug: "outdoor-gear-expo-2024",
    },
  ];
}

const eventTypeColors: Record<string, string> = {
  expo: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  fashion: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  festival:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  launch: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  sale: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  seasonal: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

export default async function EventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const events = await getEvents();

  return (
    <div className="container py-16 lg:py-28">
      <div className="space-y-10 lg:space-y-14">
        <div className="max-w-screen-sm">
          <Breadcrumb
            items={[{ name: "Home", href: `/${locale}` }, { name: "Events" }]}
          />
          <h1 className="mt-4 text-3xl font-semibold md:text-4xl">
            Events & Special Occasions
          </h1>
          <span className="mt-4 block text-neutral-500 dark:text-neutral-400">
            Shop curated collections for upcoming events and special occasions
          </span>
        </div>

        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/${locale}/events/${event.slug}`}
              className="group relative overflow-hidden rounded-3xl border border-neutral-200 bg-white p-6 transition-all hover:shadow-xl dark:border-neutral-700 dark:bg-neutral-900"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-3 inline-flex">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${eventTypeColors[event.type]}`}
                    >
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </span>
                  </div>

                  <h3 className="mb-3 text-xl font-semibold text-neutral-900 group-hover:text-primary-600 dark:text-neutral-100">
                    {event.name}
                  </h3>

                  <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <div className="flex items-center gap-2">
                      <svg
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                      >
                        <path
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>{event.date}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <svg
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                      >
                        <path
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>{event.location}</span>
                    </div>
                  </div>

                  <div className="mt-4 text-sm font-medium text-primary-600 dark:text-primary-400">
                    {event.productCount} products →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
