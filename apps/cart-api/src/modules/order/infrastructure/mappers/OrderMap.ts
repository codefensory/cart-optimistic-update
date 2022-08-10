import { Order, OrderEntity, OrderLineEntity, OrderLines } from "../../domain";
import { OrderLineProductIDEntity } from "./OrderLineMap";

export type OrderWithProductsIDEntity = {
  lines?: OrderLineProductIDEntity[];
} & Omit<OrderEntity, "lines">;

export class OrderMap {
  static toOnlyProductsID(order: Order): OrderWithProductsIDEntity {
    const orderRaw = order.toPersistence();

    const lines = orderRaw.lines?.map((line) => ({
      ...line,
      product: {
        id: line.product.id,
      },
    }));

    return { ...orderRaw, lines: lines };
  }
}
