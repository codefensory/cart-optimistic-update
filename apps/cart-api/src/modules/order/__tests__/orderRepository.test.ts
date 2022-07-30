import { describe, it, expect, afterEach } from "vitest";
import { dbModels } from "../../shared/database";
import { OrderModel } from "../domain";
import { OrderRepository } from "../infrastructure/OrderRepository";

describe("order respository", () => {
  let orderRepository = new OrderRepository();

  afterEach(() => {
    dbModels.orders.clear();
  });

  it("create and get order", async () => {
    const orderModel = new OrderModel(
      OrderModel.generateOrder(),
      orderRepository
    );

    const orderCreated = orderModel.getOrder();

    const order = (await orderModel.save()).unwrap();

    expect(order.id).toBe(orderCreated.id);
  });

  it("update a existent order", async () => {
    const orderModel1 = new OrderModel(
      OrderModel.generateOrder(),
      orderRepository
    );

    const order1 = orderModel1.getOrder();

    orderModel1.addOrderLine({
      id: "wtf",
      product: {
        id: "product wtf",
        name: "libro",
        price: 10,
      },
      quantity: 1,
    });

    await orderModel1.save();

    const orderModel2 = (
      await OrderModel.getByIdFromRepository(order1.id, orderRepository)
    ).unwrap();

    orderModel2.addOrderLine({
      id: "wtf",
      product: {
        id: "product wtf",
        name: "libro",
        price: 10,
      },
      quantity: 2,
    });

    orderModel2.save();

    const order2 = orderModel2.getOrder();

    expect(order2.id).toBe(order1.id);

    expect(order2.lines?.length).toBe(1);

    expect(order2.total).toBe(30);
  });
});
