import { Result } from "oxide.ts";
import { Product, ProductEntity } from ".";

export interface ProductRepository {
  getProducts: () => Promise<Result<Product[], Error>>;
  getProduct: (id: ProductEntity["id"]) => Promise<Result<Product, Error>>;
}
