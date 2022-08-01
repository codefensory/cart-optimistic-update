import { NowRequestHandler } from "fastify-now";
import { ProductEntity } from "../../../../products/product.entity";
import { productRepository } from "../../../../products/product.repository";
import { replyErrorMessage } from "../../../../shared/utils/returnError";
import { OrderEntity, OrderLineEntity, OrderModel } from "../../../domain";
import { orderRepository } from "../../../infrastructure/OrderRepository";

type BodyRequest = {
  productId: ProductEntity["id"];
  quantity?: OrderLineEntity["quantity"];
};

const getOrderById = (id: OrderEntity["id"]) => {
  return OrderModel.getByIdFromRepository(id, orderRepository);
};

export const GET: NowRequestHandler<{ Params: { id: string } }> = async (
  req,
  reply
) => {
  const orderResult = await getOrderById(req.params.id);

  if (orderResult.isErr()) {
    return replyErrorMessage(reply, orderResult.unwrapErr());
  }

  return {
    lines: orderResult.into(undefined)?.getOrder().lines,
  };
};

export const POST: NowRequestHandler<{
  Params: { id: OrderEntity["id"] };
  Body: BodyRequest;
}> = async (req, reply) => {
  const orderResult = await getOrderById(req.params.id);

  if (orderResult.isErr()) {
    return replyErrorMessage(reply, orderResult.unwrapErr());
  }

  const orderModel = orderResult.unwrap();

  const productResult = await productRepository.getProduct(req.body.productId);

  if (productResult.isErr()) {
    return replyErrorMessage(reply, productResult.unwrapErr());
  }

  const product = productResult.unwrap();

  orderModel.addOrderLine({
    id: req.params.id,
    quantity: req.body.quantity ?? 1,
    product,
  });

  await orderModel.save();

  return { lines: orderModel.getOrder().lines };
};

export const DELETE: NowRequestHandler<{
  Params: { id: OrderEntity["id"] };
  Body: BodyRequest;
}> = async (req, reply) => {
  const orderResult = await getOrderById(req.params.id);

  if (orderResult.isErr()) {
    return replyErrorMessage(reply, orderResult.unwrapErr());
  }

  const orderModel = orderResult.unwrap();

  orderModel.deleteOrderLine(req.body.productId, req.body.quantity);

  await orderModel.save();

  return { lines: orderModel.getOrder().lines };
};
