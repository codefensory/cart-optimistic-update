import { NowRequestHandler } from "fastify-now";
import { replyErrorMessage } from "../../../../shared/utils/returnError";
import { productLokiRepository } from "../../repository/productLokiRepository";

export const GET: NowRequestHandler = async (_req, reply) => {
  const productsResult = await productLokiRepository.getProducts();

  if (productsResult.isErr()) {
    return replyErrorMessage(reply, productsResult.unwrapErr());
  }

  const products = productsResult.unwrap();

  return { products: products.map((product) => product.toPersistence()) };
};
