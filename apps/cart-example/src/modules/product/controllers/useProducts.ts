import { useQuery } from "@tanstack/react-query";
import { CACHE_KEYS } from "../../shared/utils/contants";
import { getProducts } from "../services/productService";

export const useProducts = () => {
  const {
    data: products,
    isLoading,
    isError,
  } = useQuery(CACHE_KEYS.PRODUCTS, async () => {
    const productsResult = await getProducts();

    if (productsResult.isErr()) {
      throw productsResult.unwrapErr();
    }

    const products = productsResult.unwrap();

    return products;
  });

  return {
    products,
    isLoading,
    isError,
  };
};
