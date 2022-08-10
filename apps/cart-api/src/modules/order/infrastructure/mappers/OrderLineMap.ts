import { ProductEntity } from "../../../product/domain";
import { OrderLineEntity, OrderLines } from "../../domain";

export type OrderLineProductIDEntity = {
  product: Pick<ProductEntity, "id">;
} & Omit<OrderLineEntity, "product">;

export class OrderLineMap {
  static toOnlyProductsID(orderLine: OrderLines): OrderLineProductIDEntity[] {
    const orderLineRaw = orderLine.toPersistence();

    const lines = orderLineRaw?.map((line) => ({
      ...line,
      product: {
        id: line.product.id,
      },
    }));

    return lines;
  }
}
