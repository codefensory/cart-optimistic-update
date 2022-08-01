import { NowRequestHandler } from "fastify-now";
import { replyErrorMessage } from "../../shared/utils/returnError";
import { OrderModel } from "../domain";
import { orderRepository } from "../infrastructure/OrderRepository";

export const POST: NowRequestHandler = async (req, reply) => {
  const orderTemplate = OrderModel.generateOrder();

  const orderModel = new OrderModel(orderTemplate, orderRepository);

  const orderResult = await orderModel.save();

  if (orderResult.isErr()) {
    return replyErrorMessage(reply, orderResult.unwrapErr());
  }

  const order = orderResult.unwrap();

  return { order: order };
};
