import { OrderFeature, ProductFeature, StorageFeature } from "./features";
import axios from "axios";

export type OnlineShopOptions = {
  prefix?: string;
};

export class OnlineShop {
  public storage: StorageFeature;
  public product: ProductFeature;
  public order: OrderFeature;

  public server;

  constructor(apiUrl: string, options?: OnlineShopOptions) {
    this.server = axios.create({
      baseURL: `${apiUrl}`,
    });

    this.storage = new StorageFeature(this, options?.prefix);
    this.product = new ProductFeature(this);
    this.order = new OrderFeature(this);
  }
}
