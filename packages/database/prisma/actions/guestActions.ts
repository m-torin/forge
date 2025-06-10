"use server";

import { cookies } from "next/headers";
import {
  findManyFavoriteJoins,
  createFavoriteJoin,
  deleteFavoriteJoin,
  findManyGuestWishlists,
  createGuestWishlist,
  updateGuestWishlist,
} from "../orm";

// Re-export cart actions (guest cart is part of guest actions)
export * from "./old/cart";

// Guest favorites management
export async function getGuestFavorites(guestId: string) {
  "use server";
  
  const favorites = await findManyFavoriteJoins({
    where: { guestId },
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
  });
  
  return favorites.map(f => f.product);
}

export async function addGuestFavorite(guestId: string, productId: string) {
  "use server";
  
  return createFavoriteJoin({
    data: {
      guestId,
      productId,
    },
  });
}

export async function removeGuestFavorite(guestId: string, productId: string) {
  "use server";
  
  const favorites = await findManyFavoriteJoins({
    where: {
      guestId,
      productId,
    },
  });
  
  if (favorites.length > 0) {
    await deleteFavoriteJoin({
      where: { id: favorites[0].id },
    });
  }
}