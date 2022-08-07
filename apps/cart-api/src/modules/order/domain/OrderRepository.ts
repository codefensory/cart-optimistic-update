import { Result } from "oxide.ts";
import { Order, OrderEntity } from ".";

export interface OrderRepository {
  getOrder(id: OrderEntity["id"]): Promise<Result<Order, Error>>;
  save(order: Order): Promise<Result<OrderEntity, Error>>;
}
