import { Result } from "oxide.ts";
import { ProductEntity } from "../../product/product.entity";

export interface OrderLineEntity {
  id: string;
  product: ProductEntity;
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
  getOrder(id: string): Promise<Result<OrderEntity, Error>>;
  save(order: OrderEntity): Promise<Result<OrderEntity, Error>>;
}
