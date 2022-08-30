import { useQuery } from "@tanstack/react-query";
import { onlineShop } from "../../shared/onlineShop";
import { CACHE_KEYS } from "../../shared/utils/contants";

export const useOrder = () => {
  const { isLoading, data, isError } = useQuery(
    CACHE_KEYS.ORDERS,
    onlineShop.order.get,
    {
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );

  return {
    isLoading,
    order: data,
    isError,
  };
};
