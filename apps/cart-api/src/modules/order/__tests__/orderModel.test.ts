import shortid from "shortid";
import { expect, beforeEach, describe, it } from "vitest";
import { OrderModel, OrderEntity, OrderLineEntity } from "../domain";
import { orderRepository } from "../infrastructure/OrderRepository";

describe("order model", () => {
  const orderTemplate: OrderEntity = OrderModel.generateOrder();

  const lineTemplate: OrderLineEntity = {
    id: shortid.generate(),
    product: {
      id: shortid.generate(),
      name: "libro",
      price: 10,
    },
    quantity: 10,
  };

  let orderModel: OrderModel;

  beforeEach(() => {
    orderModel = new OrderModel({ ...orderTemplate }, orderRepository);
  });

  it("add products in order", () => {
    orderModel.addOrderLine(lineTemplate);

    orderModel.addOrderLine({
      ...lineTemplate,
      product: { ...lineTemplate.product, id: shortid.generate() },
      quantity: 20,
    });

    const order = orderModel.getOrder();

    expect(order.lines?.[0].quantity).toBe(10);

    expect(order.lines?.[0].total).toBe(100);

    expect(order.lines?.[1].quantity).toBe(20);

    expect(order.lines?.[1].total).toBe(200);

    expect(order.lines?.length).toBe(2);
  });

  it("ckeck if can increment product in order if exists", () => {
    orderModel.addOrderLine(lineTemplate);

    orderModel.addOrderLine({
      ...lineTemplate,
      product: { ...lineTemplate.product, id: shortid.generate() },
      quantity: 20,
    });

    orderModel.addOrderLine(lineTemplate);

    let lines = orderModel.getOrderLines();

    expect(lines[0].quantity).toBe(20);

    expect(lines[1].quantity).toBe(20);

    expect(lines.length).toBe(2);
  });

  it("delete complete a product in order", () => {
    orderModel.addOrderLine(lineTemplate);

    let lines = orderModel.getOrderLines();

    expect(lines.length).toBe(1);

    orderModel.deleteOrderLine(lineTemplate.product.id);

    lines = orderModel.getOrderLines();

    expect(lines.length).toBe(0);
  });

  it("decrement quantity product in order", () => {
    orderModel.addOrderLine(lineTemplate);

    orderModel.addOrderLine({
      ...lineTemplate,
      product: { ...lineTemplate.product, id: shortid.generate() },
    });

    orderModel.deleteOrderLine(lineTemplate.product.id, 4);

    const lines = orderModel.getOrderLines();

    expect(lines[0].quantity).toBe(6);

    expect(lines[1].quantity).toBe(10);

    expect(lines.length).toBe(2);
  });

  it("checks if orderLines allows negative quantity", () => {
    orderModel.addOrderLine(lineTemplate);

    orderModel.deleteOrderLine(lineTemplate.product.id, 15);

    const lines = orderModel.getOrderLines();

    expect(lines[0].quantity).toBe(-5);
  });

  it("check if total is price * quantity", () => {
    orderModel.addOrderLine(lineTemplate);

    let order = orderModel.getOrder();

    expect(order.total).toBe(100);

    orderModel.addOrderLine(lineTemplate);

    order = orderModel.getOrder();

    expect(order.total).toBe(200);
  });

  it("check immutable returns", () => {
    orderModel.addOrderLine(lineTemplate);

    const order = orderModel.getOrder();

    const lines = orderModel.getOrderLines();

    orderModel.addOrderLine({
      ...lineTemplate,
      product: { ...lineTemplate.product, id: shortid.generate() },
    });

    expect(lines.length).toBe(1);
    expect(order.lines?.length).toBe(1);
  });
});
