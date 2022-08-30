import { ProductEntity } from "../../../product/domain";
import { OrderEntity, OrderLineEntity } from "../../domain";

export type UpdateOrderLineDTO = {
  orderId: OrderEntity["id"];
  productId: ProductEntity["id"];
  quantity: OrderLineEntity["quantity"];
};
