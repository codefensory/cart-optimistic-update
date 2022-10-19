import { NowRequestHandler } from "fastify-now";
import { replyErrorMessage } from "../../../../../shared/utils/returnError";
import {
  UpdateOrderLineApplication,
  UpdateOrderLineDTO,
} from "../../../../applications/updateOrderLine";
import { OrderLineMap } from "../../../mappers/OrderLineMap";
import { OrderMap } from "../../../mappers/OrderMap";
import { orderLokiRepository } from "../../../repository/orderLokiRepository";

type UpdateOrderLineBody = Omit<UpdateOrderLineDTO, "productId">;

export const GET: NowRequestHandler<{ Params: { id: string } }> = async (req, reply) => {
  const orderResult = await orderLokiRepository.getOrder(req.params.id);

  if (orderResult.isErr()) {
    return replyErrorMessage(reply, orderResult.unwrapErr());
  }

  const order = OrderMap.toOnlyProductsID(orderResult.unwrap());

  return order.lines ?? [];
};

export const POST: NowRequestHandler<{
  Params: { id: string };
  Body: UpdateOrderLineBody;
}> = async (req, reply) => {
  const productId = req.params.id;

  const updateOrderLineApplication = new UpdateOrderLineApplication(orderLokiRepository);

  const updateOrderLineResult = await updateOrderLineApplication.execute({
    productId,
    ...req.body,
  });

  if (updateOrderLineResult.isErr()) {
    return replyErrorMessage(reply, updateOrderLineResult.unwrapErr());
  }

  const lines = OrderLineMap.toOnlyProductsID(updateOrderLineResult.unwrap());

  return lines;
};

POST.opts = {
  schema: {
    body: {
      type: "object",
      properties: {
        orderId: {
          type: "string",
        },
        quantity: {
          type: "number",
        },
      },
      required: ["orderId", "quantity"],
    },
  },
};
