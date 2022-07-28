import { Result } from "oxide.ts";

export interface OrderLineEntity {
  id: number;
  product: {
    id: number;
    name: string;
    price: number;
  };
  quantity: number;
  total?: number;
}

export interface OrderEntity {
  id: number;
  code?: string;
  lines?: OrderLineEntity[];
}

export interface OrderRepository {
  getOrder(id: number): Promise<Result<OrderEntity, any>>;
  saveOrder(order: OrderEntity): Promise<OrderEntity>;

  getLines(id: number): Promise<OrderLineEntity[]>;
  getLine(lineId: number): Promise<OrderLineEntity>;
  saveOrderLine(orderLine: OrderLineEntity): Promise<OrderLineEntity>;
}
