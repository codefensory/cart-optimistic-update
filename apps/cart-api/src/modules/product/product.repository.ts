import { isNil } from "lodash";
import { Err, Ok, Result } from "oxide.ts";
import { dbModels } from "../shared/database";
import { ProductEntity, ProductRepositoryInterface } from "./product.entity";

class ProductRepository implements ProductRepositoryInterface {
  async getProducts(): Promise<Result<ProductEntity[], Error>> {
    const products: ProductEntity[] | null = dbModels.products.find();

    if (isNil(products)) {
      return Err(Error("Products not found"));
    }

    return Ok(products);
  }

  async getProduct(
    id: ProductEntity["id"]
  ): Promise<Result<ProductEntity, Error>> {
    const product: ProductEntity | null = dbModels.products.findOne({ id });

    if (isNil(product)) {
      return Err(Error("Product not found"));
    }

    return Ok(product);
  }
}

export const productRepository = new ProductRepository();
