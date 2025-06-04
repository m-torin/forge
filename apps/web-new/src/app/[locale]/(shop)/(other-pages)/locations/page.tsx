import { type Metadata } from "next";
import Link from "next/link";

import {
  Breadcrumb,
} from "@repo/design-system/mantine-ciseco";

export const metadata: Metadata = {
  title: "Shop by Location",
  description: "Find products available in your area or shop location-specific collections",
};

// Mock data - replace with real API calls
async function getLocations() {
  return [
    {
      id: "1",
      name: "New York",
      slug: "new-york",
      country: "United States",
      storeCount: 12,
      productCount: 8500,
      coordinates: { lat: 40.7128, lng: -74.0060 },
    },
    {
      id: "2",
      name: "Los Angeles",
      slug: "los-angeles",
      country: "United States",
      storeCount: 8,
      productCount: 6200,
      coordinates: { lat: 34.0522, lng: -118.2437 },
    },
    {
      id: "3",
      name: "London",
      slug: "london",
      country: "United Kingdom",
      storeCount: 15,
      productCount: 9800,
      coordinates: { lat: 51.5074, lng: -0.1278 },
    },
    {
      id: "4",
      name: "Paris",
      slug: "paris",
      country: "France",
      storeCount: 10,
      productCount: 7500,
      coordinates: { lat: 48.8566, lng: 2.3522 },
    },
    {
      id: "5",
      name: "Tokyo",
      slug: "tokyo",
      country: "Japan",
      storeCount: 18,
      productCount: 11200,
      coordinates: { lat: 35.6762, lng: 139.6503 },
    },
    {
      id: "6",
      name: "Sydney",
      slug: "sydney",
      country: "Australia",
      storeCount: 6,
      productCount: 4500,
      coordinates: { lat: -33.8688, lng: 151.2093 },
    },
  ];
}

// Group locations by country
function groupLocationsByCountry(locations: any[]) {
  return locations.reduce((acc, location) => {
    if (!acc[location.country]) {
      acc[location.country] = [];
    }
    acc[location.country].push(location);
    return acc;
  }, {} as Record<string, any[]>);
}

export default async function LocationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const locations = await getLocations();
  const locationsByCountry = groupLocationsByCountry(locations);

  return (
    <div className="container py-16 lg:py-28">
      <div className="space-y-10 lg:space-y-14">
        <div className="max-w-screen-sm">
          <Breadcrumb
            items={[
              { name: "Home", href: `/${locale}` },
              { name: "Locations" },
            ]}
          />
          <h1 className="mt-4 text-3xl font-semibold md:text-4xl">
            Shop by Location
          </h1>
          <span className="mt-4 block text-neutral-500 dark:text-neutral-400">
            Discover products and exclusive collections available in your area
          </span>
        </div>

        {/* Locations grouped by country */}
        <div className="space-y-12">
          {Object.entries(locationsByCountry).map(([country, countryLocations]) => (
            <div key={country}>
              <h2 className="mb-6 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                {country}
              </h2>
              
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {countryLocations.map((location) => (
                  <Link
                    key={location.id}
                    href={`/${locale}/locations/${location.slug}`}
                    className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all hover:shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
                  >
                    {/* Map placeholder - in production, use real map */}
                    <div className="relative h-48 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="h-16 w-16 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-neutral-900 group-hover:text-primary-600 dark:text-neutral-100">
                        {location.name}
                      </h3>
                      
                      <div className="mt-3 space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                        <div className="flex items-center justify-between">
                          <span>Stores</span>
                          <span className="font-medium">{location.storeCount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Products</span>
                          <span className="font-medium">{location.productCount.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 text-sm font-medium text-primary-600 group-hover:text-primary-700 dark:text-primary-400">
                        Explore location →
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}