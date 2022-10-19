import { useQuery } from "@tanstack/react-query";
import { onlineShop } from "../../shared/onlineShop";
import { cacheKeys } from "../../shared/utils/contants";

export const useLineItems = () => {
  const orderId = onlineShop.order.id();

  return useQuery(cacheKeys.lineItems(orderId), onlineShop.order.getLines);
};
