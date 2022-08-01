import { Result } from "oxide.ts";

export interface ProductEntity {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
}

export interface ProductRepositoryInterface {
  getProduct: (
    id: ProductEntity["id"]
  ) => Promise<Result<ProductEntity, Error>>;
}
