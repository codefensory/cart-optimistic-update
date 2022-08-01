import { NowRequestHandler } from "fastify-now";
import { replyErrorMessage } from "../../../shared/utils/returnError";
import { OrderModel } from "../../domain";
import { orderRepository } from "../../infrastructure/OrderRepository";

export const GET: NowRequestHandler<{ Params: { id: string } }> = async (
  req,
  reply
) => {
  const orderResult = await OrderModel.getByIdFromRepository(
    req.params.id,
    orderRepository
  );

  if (orderResult.isErr()) {
    return replyErrorMessage(reply, orderResult.unwrapErr());
  }

  return {
    order: orderResult.unwrap().getOrder(),
  };
};
