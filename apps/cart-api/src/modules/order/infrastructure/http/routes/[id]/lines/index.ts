import { NowRequestHandler } from "fastify-now";
import { productLokiRepository } from "../../../../../../product/infrastructure/repository/productLokiRepository";
import { replyErrorMessage } from "../../../../../../shared/utils/returnError";
import {
  AddOrderLineApplication,
  AddOrderLineDTO,
  DeleteOrderLineApplication,
  DeleteOrderLineDTO,
} from "../../../../../applications";
import { orderLokiRepository } from "../../../../repository/orderLokiRepository";

type AddLineBodyRequest = Omit<AddOrderLineDTO, "orderId">;

type DeleteLineBodyRequest = Omit<DeleteOrderLineDTO, "orderId">;

export const GET: NowRequestHandler<{ Params: { id: string } }> = async (req, reply) => {
  const orderResult = await orderLokiRepository.getOrder(req.params.id);

  if (orderResult.isErr()) {
    return replyErrorMessage(reply, orderResult.unwrapErr());
  }

  const order = orderResult.unwrap();

  return {
    lines: order.lines?.toPersistence(),
  };
};

export const POST: NowRequestHandler<{
  Params: { id: AddOrderLineDTO["orderId"] };
  Body: AddLineBodyRequest;
}> = async (req, reply) => {
  const addOrderLineApplication = new AddOrderLineApplication(
    orderLokiRepository,
    productLokiRepository
  );

  const addOrderLineResult = await addOrderLineApplication.execute({
    orderId: req.params.id,
    ...req.body,
  });

  if (addOrderLineResult.isErr()) {
    return replyErrorMessage(reply, addOrderLineResult.unwrapErr());
  }

  const lines = addOrderLineResult.unwrap();

  return { lines };
};

export const DELETE: NowRequestHandler<{
  Params: { id: DeleteOrderLineDTO["orderId"] };
  Body: DeleteLineBodyRequest;
}> = async (req, reply) => {
  const deleteOrderLineApplication = new DeleteOrderLineApplication(orderLokiRepository);

  const deleteOrderLineResult = await deleteOrderLineApplication.execute({
    orderId: req.params.id,
    ...req.body,
  });

  if (deleteOrderLineResult.isErr()) {
    return replyErrorMessage(reply, deleteOrderLineResult.unwrapErr());
  }

  const lines = deleteOrderLineResult.unwrap();

  return { lines };
};
