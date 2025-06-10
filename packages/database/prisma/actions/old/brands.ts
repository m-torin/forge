"use server";

import { unstable_cache } from "next/cache";
import {
  findManyBrands,
  findFirstBrand,
  countBrands,
} from "../../orm/ecommerce";

// Types for brand queries
export interface BrandsQueryOptions {
  page?: number;
  limit?: number;
  type?: string;
  sort?: "name" | "popular" | "newest";
}

export interface BrandWithCount {
  id: string;
  name: string;
  slug: string;
  type: string;
  status: string;
  copy: any;
  baseUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    products: number;
  };
}

// Server action to get brands
export async function getBrands(options: BrandsQueryOptions = {}) {
  "use server";

  const cached = unstable_cache(
    async () => {
      const { limit = 20, page = 1, sort = "name", type } = options;

      const where: any = {
        deletedAt: null,
        status: "ACTIVE",
      };

      if (type) {
        where.type = type;
      }

      const orderBy: any = {};
      switch (sort) {
        case "popular":
          orderBy.updatedAt = "desc";
          break;
        case "newest":
          orderBy.createdAt = "desc";
          break;
        case "name":
        default:
          orderBy.name = "asc";
          break;
      }

      const [brands, totalCount] = await Promise.all([
        findManyBrands({
          where,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            status: true,
            copy: true,
            baseUrl: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                products: true,
              },
            },
          },
        }),
        countBrands({ where }),
      ]);

      return {
        brands: brands.map((brand) => ({
          id: brand.id,
          name: brand.name,
          slug: brand.slug,
          description: (brand.copy as any)?.description || "",
          productCount: brand._count.products,
          type: brand.type,
          baseUrl: brand.baseUrl,
        })),
        currentPage: page,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      };
    },
    ["brands"],
    {
      revalidate: 3600,
      tags: ["brands"],
    },
  );

  return cached();
}

// Server action to get brand by handle
export async function getBrandByHandle(handle: string) {
  "use server";

  const cached = unstable_cache(
    async () => {
      const brand = await findFirstBrand({
        where: {
          OR: [
            { id: handle },
            { slug: handle },
          ],
          deletedAt: null,
          status: "ACTIVE",
        },
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
      });

      return brand as unknown as BrandWithCount | null;
    },
    [`brand-${handle}`],
    {
      revalidate: 3600,
      tags: [`brand-${handle}`, "brands"],
    },
  );

  return cached();
}

// Server action to get popular brands
export async function getPopularBrands(limit = 10) {
  "use server";

  const cached = unstable_cache(
    async () => {
      const brands = await findManyBrands({
        where: {
          deletedAt: null,
          status: "ACTIVE",
        },
        orderBy: [
          { updatedAt: "desc" },
        ],
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          copy: true,
          _count: {
            select: {
              products: true,
            },
          },
        },
      });

      return brands.map((brand) => ({
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        description: (brand.copy as any)?.description || "",
        productCount: brand._count.products,
      }));
    },
    ["popular-brands"],
    {
      revalidate: 3600,
      tags: ["brands"],
    },
  );

  return cached();
}