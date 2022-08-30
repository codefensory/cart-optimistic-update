import { NowRequestHandler } from "fastify-now";
import { productLokiRepository } from "../../../../../product/infrastructure/repository/productLokiRepository";
import { replyErrorMessage } from "../../../../../shared/utils/returnError";
import {
  AddOrderLineApplication,
  AddOrderLineDTO,
  DeleteOrderLineApplication,
  DeleteOrderLineDTO,
} from "../../../../applications";
import { OrderLineMap } from "../../../mappers/OrderLineMap";
import { OrderMap } from "../../../mappers/OrderMap";
import { orderLokiRepository } from "../../../repository/orderLokiRepository";

export const GET: NowRequestHandler<{ Params: { id: string } }> = async (req, reply) => {
  const orderResult = await orderLokiRepository.getOrder(req.params.id);

  if (orderResult.isErr()) {
    return replyErrorMessage(reply, orderResult.unwrapErr());
  }

  const order = OrderMap.toOnlyProductsID(orderResult.unwrap());

  return order.lines ?? [];
};

export const POST: NowRequestHandler<{
  Body: AddOrderLineDTO;
}> = async (req, reply) => {
  const addOrderLineApplication = new AddOrderLineApplication(
    orderLokiRepository,
    productLokiRepository
  );

  const addOrderLineResult = await addOrderLineApplication.execute({
    ...req.body,
  });

  if (addOrderLineResult.isErr()) {
    return replyErrorMessage(reply, addOrderLineResult.unwrapErr());
  }

  const lines = OrderLineMap.toOnlyProductsID(addOrderLineResult.unwrap());

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
        productId: {
          type: "string",
        },
        quantity: {
          type: "number",
        },
      },
      required: ["productId"],
    },
  },
};

export const DELETE: NowRequestHandler<{
  Body: DeleteOrderLineDTO;
}> = async (req, reply) => {
  const deleteOrderLineApplication = new DeleteOrderLineApplication(orderLokiRepository);

  const deleteOrderLineResult = await deleteOrderLineApplication.execute({
    ...req.body,
  });

  if (deleteOrderLineResult.isErr()) {
    return replyErrorMessage(reply, deleteOrderLineResult.unwrapErr());
  }

  const lines = OrderLineMap.toOnlyProductsID(deleteOrderLineResult.unwrap());

  return lines;
};

DELETE.opts = {
  schema: {
    body: {
      type: "object",
      properties: {
        orderId: {
          type: "string",
        },
        productId: {
          type: "string",
        },
        quantity: {
          type: "number",
        },
      },
      required: ["orderId", "productId"],
    },
  },
};
