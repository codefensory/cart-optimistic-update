import axios from "axios";
import { Result, Err, Ok } from "oxide.ts";
import { ProductEntity } from "../domain";

const productApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/product`,
});

export const getProducts = async (): Promise<
  Result<ProductEntity[], Error>
> => {
  const request = await productApi.get("/all");

  if (request.status === 500) {
    return Err(Error(request.data.error));
  }

  return Ok(request.data.products as ProductEntity[]);
};
