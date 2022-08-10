import { NowRequestHandler } from "fastify-now";
import { replyErrorMessage } from "../../../../shared/utils/returnError";
import { CreateOrderApplication } from "../../../applications/createOrder";
import { OrderMap } from "../../mappers/OrderMap";
import { orderLokiRepository } from "../../repository/orderLokiRepository";

export const POST: NowRequestHandler = async (_req, reply) => {
  const createOrderApplication = new CreateOrderApplication(orderLokiRepository);

  const createOrderResult = await createOrderApplication.execute();

  if (createOrderResult.isErr()) {
    return replyErrorMessage(reply, createOrderResult.unwrapErr());
  }

  const order = createOrderResult.unwrap();

  const orderRaw = order.toPersistence();

  return { order: orderRaw };
};
