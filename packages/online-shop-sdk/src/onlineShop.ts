import { ProductFeature, StorageFeature } from "./features";
import axios from "axios";

export type OnlineShopOptions = {
  prefix?: string;
};

export class OnlineShop {
  public storage: StorageFeature;
  public product: ProductFeature;

  public server;

  public prefix: string = "onlineshop_";

  constructor(apiUrl: string, options: OnlineShopOptions) {
    this.server = axios.create({
      baseURL: `${apiUrl}`,
    });

    this.prefix = options.prefix ?? this.prefix;

    this.storage = new StorageFeature(this);

    this.product = new ProductFeature(this);
  }
}
