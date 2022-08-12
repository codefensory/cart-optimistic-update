import { OnlineShop } from "..";
import { Product } from "../types";
import { getError } from "../utils";

export class ProductFeature {
  constructor(private shop: OnlineShop) {}

  async list(): Promise<Product[]> {
    try {
      return (await this.shop.server.get("/product/all")).data as Product[];
    } catch (err) {
      throw getError(err);
    }
  }
}
