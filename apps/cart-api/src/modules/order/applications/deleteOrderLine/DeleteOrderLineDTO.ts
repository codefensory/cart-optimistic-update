import { ProductEntity } from "../../../product/domain";
import { OrderLineEntity } from "../../domain";

export type DeleteOrderLineDTO = {
  orderId: OrderLineEntity["id"];
  productId: ProductEntity["id"];
  quantity?: OrderLineEntity["quantity"];
};
