import { useQuery } from "@tanstack/react-query";
import { cacheKeys } from "../../shared/utils/contants";
import { onlineShop } from "../../shared/onlineShop";

export const useProducts = () => {
  const {
    data: products,
    isLoading,
    isError,
  } = useQuery(cacheKeys.products(), async () => {
    return onlineShop.product.list();
  });

  return {
    products,
    isLoading,
    isError,
  };
};
