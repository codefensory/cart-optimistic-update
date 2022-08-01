import axios from "axios";
import { Result, Err, Ok } from "oxide.ts";
import { ProductEntity } from "../domain";

const productApi = axios.create({
  baseURL: `${process.env.REACT_APP_API}/product`,
});

export const getProducts = async (): Promise<
  Result<ProductEntity[], Error>
> => {
  const request = await productApi.get("/all");

  if (request.status === 502) {
    return Err(Error(request.data.error));
  }

  return Ok(request.data.products as ProductEntity[]);
};
