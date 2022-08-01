import { dbModels } from "../../shared/database";
import { OrderEntity, OrderRepositoryInterface } from "../domain";
import { isNil } from "lodash";
import { Err, Result, Ok } from "oxide.ts";

class OrderRepository implements OrderRepositoryInterface {
  async getOrder(id: string): Promise<Result<OrderEntity, Error>> {
    const order: OrderEntity | null = dbModels.orders.findOne({ id });

    if (isNil(order)) {
      return Err(Error("Order not found"));
    }

    return Ok(order);
  }

  async save(order: OrderEntity): Promise<Result<OrderEntity, Error>> {
    let result;

    if (order.$loki) {
      result = dbModels.orders.update(order);
    } else {
      result = dbModels.orders.insert(order);
    }

    if (isNil(result)) {
      return Err(Error("Error to save"));
    }

    return Ok(result as OrderEntity);
  }
}

export const orderRepository = new OrderRepository();
