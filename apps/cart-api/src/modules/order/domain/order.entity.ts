import { Result } from "oxide.ts";

export interface OrderLineEntity {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
  };
  quantity: number;
  total?: number;
}

export interface OrderEntity {
  $loki?: string;

  id: string;
  code?: string;
  lines?: OrderLineEntity[];
  total?: number;
}

export interface OrderRepositoryInterface {
  getOrder(id: string): Promise<Result<OrderEntity, string>>;
  save(order: OrderEntity): Promise<Result<OrderEntity, string>>;
}
