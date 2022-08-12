import { useQuery } from "@tanstack/react-query";
import { CACHE_KEYS } from "../../shared/utils/contants";
import { onlineShop } from "../../shared/onlineShop";

export const useProducts = () => {
  const {
    data: products,
    isLoading,
    isError,
  } = useQuery(CACHE_KEYS.PRODUCTS, async () => {
    return onlineShop.product.list();
  });

  return {
    products,
    isLoading,
    isError,
  };
};
