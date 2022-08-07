import shortid from "shortid";
import { describe, it, expect } from "vitest";
import { Product } from "../../product/domain";
import { Line, Order, OrderLines } from "../domain";

describe("new order model", () => {
  const bookProduct = Product.create({
    id: shortid.generate(),
    name: "book",
    discount: 50,
    price: 12,
  });

  const tableProduct = Product.create({
    id: shortid.generate(),
    name: "table",
    price: 12,
  });

  it("checks if get entity from toPersistence", () => {
    const orderLines = OrderLines.create();

    orderLines.addLine(Line.fromProduct(bookProduct, 2));

    orderLines.addLine(Line.fromProduct(tableProduct, 5));

    const order = Order.create({
      id: shortid.generate(),
      lines: orderLines,
    });

    const orderPersistence = order.toPersistence();

    expect(orderPersistence.lines?.[0].product.id).toBe(bookProduct.id);

    expect(orderPersistence.lines?.[1].product.id).toBe(tableProduct.id);
  });
});
