import { ProductEntity } from "../../product/domain";

export type OrderLineEntity = {
  id: string;
  productId: ProductEntity["id"];
};
