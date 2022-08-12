import { Product } from "./product";

export type OrderLine = {
  id: string;
  orderId?: string;
  product: Product;
  quantity: number;
  total?: number;
};
