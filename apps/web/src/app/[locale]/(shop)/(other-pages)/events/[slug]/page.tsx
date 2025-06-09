import { getProducts } from "@/lib/data-service";
import { seoManager } from "@/lib/seo-config";
import { type Metadata } from "next";
import { notFound } from "next/navigation";

import {
  Breadcrumb,
  CompletePagination,
  HeaderFilterSection,
  SidebarFilters,
} from "@repo/design-system/mantine-ciseco";
import {
  createStructuredData,
  JsonLd,
  structuredData,
} from "@repo/seo/structured-data";

import { EventClient } from "./EventClient";

import type { Event } from "schema-dts";

// ISR Configuration - Revalidate every 4 hours for event pages
export const revalidate = 14400; // 4 hours in seconds

// Generate static params for popular/upcoming events
export async function generateStaticParams() {
  // In production, fetch upcoming and popular events
  // const upcomingEvents = await getUpcomingEvents({ limit: 50 });
  // return upcomingEvents.map((event) => ({
  //   slug: event.slug,
  // }));
  return [];
}

// Mock data - replace with real API calls
async function getEventBySlug(slug: string) {
  const events = {
    "black-friday-2024": {
      id: "3",
      name: "Black Friday Sale",
      type: "sale",
      date: "November 29, 2024",
      description:
        "The biggest sale of the year! Incredible deals on all your favorite brands and products.",
      location: "Online & In-Store",
      productCount: 5000,
      slug: "black-friday-2024",
    },
    "fashion-week-nyc": {
      id: "2",
      name: "Fashion Week NYC",
      type: "fashion",
      date: "September 5-12, 2024",
      description:
        "Discover the latest runway trends and designer collections from New York Fashion Week.",
      location: "Various Venues, NYC",
      productCount: 1200,
      slug: "fashion-week-nyc",
    },
    "summer-music-festival-2024": {
      id: "1",
      name: "Summer Music Festival 2024",
      type: "festival",
      date: "July 15-17, 2024",
      description:
        "Get ready for the biggest music festival of the summer! Shop festival fashion, accessories, and essentials.",
      location: "Central Park, NY",
      productCount: 450,
      slug: "summer-music-festival-2024",
    },
  };
  return events[slug as keyof typeof events];
}

async function getEventProducts(eventSlug: string, page = 1, limit = 20) {
  // Get all products - in a real implementation, this would filter by event
  const allProducts = await getProducts();

  // Simulate filtering by event and pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const products = allProducts.slice(startIndex, endIndex);

  return {
    currentPage: page,
    products,
    totalCount: allProducts.length,
    totalPages: Math.ceil(allProducts.length / limit),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { locale: _locale, slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    return seoManager.createErrorMetadata(404);
  }

  return seoManager.createMetadata({
    alternates: {
      canonical: `/events/${event.slug}`,
      languages: {
        de: `/de/events/${event.slug}`,
        en: `/en/events/${event.slug}`,
        es: `/es/events/${event.slug}`,
        fr: `/fr/events/${event.slug}`,
        pt: `/pt/events/${event.slug}`,
      },
    },
    description: `${event.description} Browse ${event.productCount} curated products for ${event.name}. ${event.date} at ${event.location}.`,
    keywords: [
      event.name,
      "event",
      event.type,
      "fashion",
      "shopping",
      event.location.split(",")[0],
    ],
    title: `${event.name} | Shop Event Collection`,
  });
}

export default async function EventPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; locale: string }>;
  searchParams: Promise<{ page?: string; sort?: string; filter?: string }>;
}) {
  const { locale: _locale, slug } = await params;
  const { page = "1" } = await searchParams;

  const event = await getEventBySlug(slug);
  if (!event) {
    notFound();
  }

  const { currentPage, products, totalPages } = await getEventProducts(
    slug,
    parseInt(page),
  );

  // Generate structured data for the event
  const eventSchema = createStructuredData<Event>("Event", {
    name: event.name,
    description: event.description,
    endDate: event.date.includes("-")
      ? new Date(
          event.date.split("-")[1] || event.date.split("-")[0],
        ).toISOString()
      : new Date(event.date.split(",")[0]).toISOString(),
    eventAttendanceMode: event.location.includes("Online")
      ? "https://schema.org/MixedEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      name: event.location,
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: event.location.split(",")[0],
        addressRegion: event.location.split(",")[1]?.trim() || "",
      },
    },
    offers: {
      validFrom: new Date().toISOString(),
      "@type": "Offer",
      url: `https://ciseco.com/${_locale}/events/${event.slug}`,
      availability: "https://schema.org/InStock",
      priceCurrency: "USD",
    },
    organizer: {
      name: "Ciseco Events",
      "@type": "Organization",
      url: "https://ciseco.com",
    },
    startDate: new Date(event.date.split("-")[0]).toISOString(),
  });

  const breadcrumbSchema = structuredData.breadcrumbs([
    { name: "Home", url: `/${_locale}` },
    { name: "Events", url: `/${_locale}/events` },
    { name: event.name, url: `/${_locale}/events/${event.slug}` },
  ]);

  return (
    <>
      <JsonLd data={[eventSchema, breadcrumbSchema]} />
      <div className="container py-16 lg:py-28">
        <div className="space-y-10 lg:space-y-14">
          {/* Header */}
          <div>
            <Breadcrumb
              breadcrumbs={[
                { id: 1, name: "Home", href: `/${_locale}` },
                { id: 2, name: "Events", href: `/${_locale}/events` },
              ]}
              currentPage={event.name}
            />

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <h1 className="text-3xl font-bold md:text-4xl">{event.name}</h1>
                <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
                  {event.description}
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-700 dark:bg-neutral-800">
                <h3 className="mb-4 font-semibold">Event Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <svg
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      className="mt-0.5 h-5 w-5 text-neutral-500"
                      fill="none"
                    >
                      <path
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <div>
                      <div className="font-medium">Date</div>
                      <div className="text-neutral-600 dark:text-neutral-400">
                        {event.date}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <svg
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      className="mt-0.5 h-5 w-5 text-neutral-500"
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
                    <div>
                      <div className="font-medium">Location</div>
                      <div className="text-neutral-600 dark:text-neutral-400">
                        {event.location}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <svg
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      className="mt-0.5 h-5 w-5 text-neutral-500"
                      fill="none"
                    >
                      <path
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                    <div>
                      <div className="font-medium">Products</div>
                      <div className="text-neutral-600 dark:text-neutral-400">
                        {event.productCount} items
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Products */}
          <div className="flex flex-col lg:flex-row">
            {/* Sidebar */}
            <div className="pr-4 lg:w-1/3 xl:w-1/4">
              <SidebarFilters />
            </div>

            {/* Products Grid */}
            <div className="flex-shrink-0 mb-10 lg:mb-0 lg:mx-4 lg:w-2/3 xl:w-3/4">
              <HeaderFilterSection />
              <EventClient products={products} />

              {/* Pagination */}
              <div className="mt-12 flex justify-center">
                <CompletePagination
                  totalPages={totalPages}
                  baseUrl={`/${_locale}/events/${slug}`}
                  currentPage={currentPage}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
