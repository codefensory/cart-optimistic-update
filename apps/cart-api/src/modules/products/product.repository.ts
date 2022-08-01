import { isNil } from "lodash";
import { Err, Ok, Result } from "oxide.ts";
import { dbModels } from "../shared/database";
import { ProductEntity, ProductRepositoryInterface } from "./product.entity";

class ProductRepository implements ProductRepositoryInterface {
  async getProduct(
    id: ProductEntity["id"]
  ): Promise<Result<ProductEntity, Error>> {
    const order: ProductEntity | null = dbModels.products.findOne({ id });

    if (isNil(order)) {
      return Err(Error("Product not found"));
    }

    return Ok(order);
  }
}

export const productRepository = new ProductRepository();
