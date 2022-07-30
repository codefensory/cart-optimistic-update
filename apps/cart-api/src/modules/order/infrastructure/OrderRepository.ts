import { dbModels } from "../../shared/database";
import { OrderEntity, OrderRepositoryInterface } from "../domain";
import { isNil } from "lodash";
import { Err, Result, Ok } from "oxide.ts";

export class OrderRepository implements OrderRepositoryInterface {
  async getOrder(id: string): Promise<Result<OrderEntity, string>> {
    const order: OrderEntity | null = dbModels.orders.findOne({ id });

    if (isNil(order)) {
      return Err("Order not found");
    }

    return Ok(order);
  }

  async save(order: OrderEntity): Promise<Result<OrderEntity, string>> {
    let result;

    if (order.$loki) {
      result = dbModels.orders.update(order);
    } else {
      result = dbModels.orders.insert(order);
    }

    if (isNil(result)) {
      return Err("Error to save");
    }

    return Ok(result as OrderEntity);
  }
}
