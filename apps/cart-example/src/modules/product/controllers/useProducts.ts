import { useQuery } from "@tanstack/react-query";
import { CACHE_KEYS } from "../../shared/utils/contants";

export const useProducts = () => {
  const { data } = useQuery(CACHE_KEYS.PRODUCTS, () => {

  });
};
