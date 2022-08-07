import { NowRequestHandler } from "fastify-now";
import { replyErrorMessage } from "../../../../../shared/utils/returnError";
import { orderLokiRepository } from "../../../repository/orderLokiRepository";

export const GET: NowRequestHandler<{ Params: { id: string } }> = async (req, reply) => {
  const orderResult = await orderLokiRepository.getOrder(req.params.id);

  if (orderResult.isErr()) {
    return replyErrorMessage(reply, orderResult.unwrapErr());
  }

  const orderModel = orderResult.unwrap();

  return { order: orderModel.toPersistence() };
};
