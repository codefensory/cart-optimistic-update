import { dbModels } from "../../../shared/database";
import { OrderEntity, Order, OrderRepository } from "../../domain";
import { isNil } from "lodash";
import { Err, Result, Ok } from "oxide.ts";

class OrderLokiRepository implements OrderRepository {
  async getOrder(id: string): Promise<Result<Order, Error>> {
    const order: OrderEntity | null = dbModels.orders.findOne({ id });

    if (isNil(order)) {
      return Err(Error("Order not found"));
    }

    return Ok(Order.fromPersistence(order));
  }

  async save(order: Order): Promise<Result<OrderEntity, Error>> {
    let result: OrderEntity;

    let orderRaw = order.toPersistence();

    if (orderRaw.$loki) {
      result = dbModels.orders.update(orderRaw);
    } else {
      result = dbModels.orders.insert(orderRaw);
    }

    if (isNil(result)) {
      return Err(Error("Error to save"));
    }

    return Ok(result);
  }
}

export const orderLokiRepository = new OrderLokiRepository();
