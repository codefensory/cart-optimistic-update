import { expect, beforeEach, describe, it } from "vitest";
import { OrderModel, OrderEntity, OrderLineEntity } from "../domain";

describe("order model", () => {
  const orderTemplate: OrderEntity = {
    id: 0,
    lines: [],
  };

  const lineTemplate: OrderLineEntity = {
    id: 0,
    product: {
      id: 0,
      name: "libro",
      price: 10,
    },
    quantity: 10,
  };

  let orderModel: OrderModel;

  beforeEach(() => {
    orderModel = new OrderModel({ ...orderTemplate });
  });

  it("add products in order", () => {
    orderModel.addOrderLine(lineTemplate);

    orderModel.addOrderLine({
      ...lineTemplate,
      product: { ...lineTemplate.product, id: 1 },
      quantity: 20,
    });

    const order = orderModel.getOrder();

    expect(order.lines?.[0].quantity).toBe(10);

    expect(order.lines?.[1].quantity).toBe(20);

    expect(order.lines?.length).toBe(2);
  });

  it("ckeck if can increment product in order if exists", () => {
    orderModel.addOrderLine(lineTemplate);

    orderModel.addOrderLine({
      ...lineTemplate,
      product: { ...lineTemplate.product, id: 1 },
      quantity: 20,
    });

    orderModel.addOrderLine(lineTemplate);

    let lines = orderModel.getOrderLines().unwrap();

    expect(lines[0].quantity).toBe(20);

    expect(lines[1].quantity).toBe(20);

    expect(lines.length).toBe(2);
  });

  it("delete complete a product in order", () => {
    orderModel.addOrderLine(lineTemplate);

    let lines = orderModel.getOrderLines().unwrap();

    expect(lines.length).toBe(1);

    orderModel.deleteOrderLine(lineTemplate.product.id);

    lines = orderModel.getOrderLines().unwrap();

    expect(lines.length).toBe(0);
  });

  it("decrement quantity product in order", () => {
    orderModel.addOrderLine(lineTemplate);

    orderModel.addOrderLine({
      ...lineTemplate,
      product: { ...lineTemplate.product, id: 1 },
    });

    orderModel.deleteOrderLine(lineTemplate.product.id, 4);

    const lines = orderModel.getOrderLines().unwrap();

    expect(lines[0].quantity).toBe(6);

    expect(lines[1].quantity).toBe(10);

    expect(lines.length).toBe(2);
  });

  it("checks if orderLines allows negative quantity", () => {
    orderModel.addOrderLine(lineTemplate);

    orderModel.deleteOrderLine(lineTemplate.product.id, 15);

    const lines = orderModel.getOrderLines().unwrap();

    expect(lines[0].quantity).toBe(-5);
  });
});
