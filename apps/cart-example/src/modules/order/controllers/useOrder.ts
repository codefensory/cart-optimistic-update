import { useQuery } from "@tanstack/react-query";
import { onlineShop } from "../../shared/onlineShop";
import { cacheKeys } from "../../shared/utils/contants";

export const useOrder = () => {
  const { isLoading, data, isError } = useQuery(
    cacheKeys.order(),
    async () => {
      let order = await onlineShop.order.get();

      if (!order) {
        order = await onlineShop.order.create();
      }

      return order;
    },
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
