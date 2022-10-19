export const CACHE_KEYS = {
  PRODUCTS: ["products", "cart-example"],
  ORDERS: ["orders", "cart-example"],
};

export const cacheKeys = {
  products: () => ["products"],
  order: () => ["order"],
  lineItems: (orderId: string | undefined) => ["order", "lineItem", orderId],
};
