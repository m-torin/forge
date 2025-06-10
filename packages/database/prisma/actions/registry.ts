"use server";

import { unstable_cache, revalidateTag } from "next/cache";
import {
  findManyRegistries,
  findFirstRegistry,
  createRegistry,
  updateRegistry,
  findManyRegistryItems,
  createRegistryItem,
  deleteRegistryItem,
  countRegistryItems,
} from "../orm/registry";

// Get user's registries
export async function getUserRegistries(userId: string) {
  "use server";
  
  const cached = unstable_cache(
    async () => {
      return findManyRegistries({
        where: {
          users: {
            some: {
              userId,
            },
          },
          deletedAt: null,
        },
        include: {
          _count: {
            select: {
              items: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    },
    [`user-registries-${userId}`],
    {
      revalidate: 3600,
      tags: [`user-${userId}-registries`, "registries"],
    }
  );
  
  return cached();
}

// Get registry with items
export async function getRegistryWithItems(registryId: string) {
  "use server";
  
  const cached = unstable_cache(
    async () => {
      return findFirstRegistry({
        where: {
          id: registryId,
          deletedAt: null,
        },
        include: {
          items: {
            where: { deletedAt: null },
            include: {
              product: {
                include: {
                  media: {
                    take: 1,
                    orderBy: { createdAt: "asc" },
                  },
                },
              },
            },
          },
          users: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      });
    },
    [`registry-${registryId}`],
    {
      revalidate: 3600,
      tags: [`registry-${registryId}`, "registries"],
    }
  );
  
  return cached();
}

// Add item to registry
export async function addItemToRegistry(
  registryId: string,
  productId: string,
  quantity = 1,
) {
  "use server";
  
  const item = await createRegistryItem({
    data: {
      registryId,
      productId,
      quantity,
      purchased: false,
    },
  });
  
  // Revalidate cache
  revalidateTag(`registry-${registryId}`);
  
  return item;
}