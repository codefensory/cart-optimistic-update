import { ModelBase } from "../../shared/core/domain";

export type ProductEntity = {
  id: string;
  name: string;
  price: number;
  discount?: number;
  imageUrl?: string;
};

export class Product extends ModelBase<ProductEntity> {
  static fromPersistence(raw: ProductEntity): Product {
    return Product.create({ ...raw });
  }

  get id(): ProductEntity["id"] {
    return this.props.id;
  }
}
