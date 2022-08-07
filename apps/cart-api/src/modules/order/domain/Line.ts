import { Product } from "../../product/domain";
import { OrderLineEntity } from ".";
import { ModelBase } from "../../shared/core/domain";
import shortid from "shortid";

export type OrderLineProps = {
  product: Product;
} & Omit<OrderLineEntity, "product">;

export class Line extends ModelBase<OrderLineProps, OrderLineEntity> {
  static fromProduct(product: Product, quantity?: OrderLineProps["quantity"]) {
    const id = shortid.generate();

    return new Line({
      id,
      product,
      quantity: quantity ?? 1,
    });
  }

  static fromPersistence(raw: OrderLineEntity): Line {
    const product = Product.fromPersistence(raw.product);
    return Line.create({ ...raw, product });
  }

  get product(): OrderLineProps["product"] {
    return this.props.product;
  }

  get quantity(): OrderLineProps["quantity"] {
    return this.props.quantity;
  }

  get(): OrderLineProps {
    let props = super.get();
    props = this.calculateTotal(props);
    return props;
  }

  private calculateTotal(props: OrderLineProps): OrderLineProps {
    const product = props.product.get();
    const price = product.price - product.price * ((product.discount ?? 0) / 100);
    const total = price * props.quantity;
    return { ...props, total };
  }
}
