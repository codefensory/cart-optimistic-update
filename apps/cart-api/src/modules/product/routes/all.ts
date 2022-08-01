import { NowRequestHandler } from "fastify-now";
import { replyErrorMessage } from "../../shared/utils/returnError";
import { productRepository } from "../product.repository";

export const GET: NowRequestHandler = async (req, reply) => {
  const productsResult = await productRepository.getProducts();

  if (productsResult.isErr()) {
    return replyErrorMessage(reply, productsResult.unwrapErr());
  }

  return { products: productsResult.unwrap() };
};
