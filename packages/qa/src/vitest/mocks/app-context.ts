export interface CreateAppContextMockOptions {
  favorites?: Array<{ id: string; [key: string]: any }>;
  cart?: Array<{ id: string; quantity?: number; price?: number; [key: string]: any }>;
  toggleFavorite?: (item: { id: string; [key: string]: any }) => void;
  removeFavorite?: (id: string) => void;
  setFavorites?: (items: Array<{ id: string; [key: string]: any }>) => void;
  addToCart?: (item: { id: string; [key: string]: any }) => void;
  updateCartItem?: (id: string, quantity: number) => void;
  removeFromCart?: (id: string) => void;
  clearCart?: () => void;
  isFavorite?: (id: string) => boolean;
}

export interface AppContextMockResult {
  context: {
    favorites: Array<{ id: string; [key: string]: any }>;
    toggleFavorite: (item: { id: string; [key: string]: any }) => void;
    removeFavorite: (id: string) => void;
    setFavorites: (items: Array<{ id: string; [key: string]: any }>) => void;
    cart: Array<{ id: string; quantity?: number; price?: number; [key: string]: any }>;
    addToCart: (item: { id: string; [key: string]: any }) => void;
    updateCartItem: (id: string, quantity: number) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
  };
  favorites: {
    favorites: Array<{ id: string; [key: string]: any }>;
    favoriteCount: number;
    isFavorite: (id: string) => boolean;
    toggleFavorite: (item: { id: string; [key: string]: any }) => void;
    removeFavorite: (id: string) => void;
    setFavorites: (items: Array<{ id: string; [key: string]: any }>) => void;
  };
  cartTotals: {
    cart: Array<{ id: string; quantity?: number; price?: number; [key: string]: any }>;
    cartCount: number;
    cartSubtotal: number;
    cartTotal: number;
    addToCart: (item: { id: string; [key: string]: any }) => void;
    updateCartItem: (id: string, quantity: number) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
  };
}

export function createAppContextMock(
  options: CreateAppContextMockOptions = {},
): AppContextMockResult {
  const favorites = options.favorites ?? [];
  const cart = options.cart ?? [];

  const toggleFavorite = options.toggleFavorite ?? (() => {});
  const removeFavorite = options.removeFavorite ?? (() => {});
  const setFavorites = options.setFavorites ?? (() => {});
  const addToCart = options.addToCart ?? (() => {});
  const updateCartItem = options.updateCartItem ?? (() => {});
  const removeFromCart = options.removeFromCart ?? (() => {});
  const clearCart = options.clearCart ?? (() => {});

  const isFavoriteFn =
    options.isFavorite ?? ((id: string) => favorites.some(item => item.id === id));

  const cartSubtotal = cart.reduce((total, item) => {
    const price = Number.isFinite(item.price) ? Number(item.price) : 0;
    const quantity = Number.isFinite(item.quantity) ? Number(item.quantity) : 0;
    return total + price * quantity;
  }, 0);

  const cartCount = cart.reduce((total, item) => {
    const quantity = Number.isFinite(item.quantity) ? Number(item.quantity) : 0;
    return total + quantity;
  }, 0);

  return {
    context: {
      favorites,
      toggleFavorite,
      removeFavorite,
      setFavorites,
      cart,
      addToCart,
      updateCartItem,
      removeFromCart,
      clearCart,
    },
    favorites: {
      favorites,
      favoriteCount: favorites.length,
      isFavorite: isFavoriteFn,
      toggleFavorite,
      removeFavorite,
      setFavorites,
    },
    cartTotals: {
      cart,
      cartCount,
      cartSubtotal,
      cartTotal: cartSubtotal,
      addToCart,
      updateCartItem,
      removeFromCart,
      clearCart,
    },
  };
}
