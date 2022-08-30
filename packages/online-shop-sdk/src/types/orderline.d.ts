import { Product } from "./product";

export type OrderLine = {
  id: string;
  product: Product;
  quantity: number;
  orderId?: string;
  total?: number;
};
