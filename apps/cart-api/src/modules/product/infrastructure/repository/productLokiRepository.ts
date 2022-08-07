import { isNil } from "lodash";
import { Err, Ok, Result } from "oxide.ts";
import { dbModels } from "../../../shared/database";
import { ProductEntity, Product, ProductRepository } from "../../domain";

class ProductLokiRepository implements ProductRepository {
  async getProducts(): Promise<Result<Product[], Error>> {
    const products: ProductEntity[] | null = dbModels.products.find();

    if (isNil(products)) {
      return Err(Error("Products not found"));
    }

    return Ok(products.map((product) => Product.fromPersistence(product)));
  }

  async getProduct(id: ProductEntity["id"]): Promise<Result<Product, Error>> {
    const product: ProductEntity | null = dbModels.products.findOne({ id });

    if (isNil(product)) {
      return Err(Error("Product not found"));
    }

    return Ok(Product.fromPersistence(product));
  }
}

export const productLokiRepository = new ProductLokiRepository();
