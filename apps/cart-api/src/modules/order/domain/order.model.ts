import { List } from "immutable";
import { nanoid } from "nanoid";
import { None, Option, Result, Some } from "oxide.ts";
import { Immutable } from "../../../utils/immutable";
import {
  OrderEntity,
  OrderLineEntity,
  OrderRepositoryInterface,
} from "./order.entity";

export class OrderModel {
  static async getByIdFromRepository(
    orderId: OrderEntity["id"],
    repository: OrderRepositoryInterface
  ): Promise<Result<OrderModel, string>> {
    const orderResult = await repository.getOrder(orderId);
    return orderResult.map((order) => new OrderModel(order, repository));
  }

  static generateOrder(): OrderEntity {
    const order: OrderEntity = {
      id: nanoid(),
      code: "000",
      lines: [],
      total: 0,
    };

    return order;
  }

  constructor(
    private props: OrderEntity,
    private repository: OrderRepositoryInterface
  ) {}

  getOrder(): Immutable<OrderEntity> {
    return { ...this.props } as OrderEntity;
  }

  getOrderLines(): Immutable<OrderLineEntity[]> {
    return List(this.props.lines).toArray();
  }

  getOrderLineById(
    id: OrderLineEntity["id"]
  ): Option<{ index: number; line: Immutable<OrderLineEntity> }> {
    if (!this.props.lines) {
      return None;
    }

    const lines = this.getOrderLines();

    const lineIndex = lines.findIndex((line) => line.product.id === id);

    if (lineIndex !== -1) {
      return Some({
        index: lineIndex,
        line: { ...lines[lineIndex] },
      });
    }

    return None;
  }

  addOrderLine(newLine: Immutable<OrderLineEntity>): void {
    const lineWrap = this.getOrderLineById(newLine.product.id);

    if (lineWrap.isSome()) {
      const { index, line } = lineWrap.unwrap();

      const quantity = line.quantity + newLine.quantity;

      this.updateOrderLineByIndex(index, { ...line, quantity });
    } else {
      this.pushOrderLine(newLine);
    }

    this.calculeOrderTotal();
  }

  deleteOrderLine(productId: OrderLineEntity["id"], quantity?: number): void {
    const lineWrap = this.getOrderLineById(productId);

    if (lineWrap.isSome()) {
      const { index, line } = lineWrap.unwrap();

      // If not send quantity, delete the line
      if (!quantity) {
        this.deleteOrderByIndex(index);

        this.calculeOrderTotal();
        return;
      }

      const newQuantity = line.quantity - quantity;

      this.updateOrderLineByIndex(index, { ...line, quantity: newQuantity });

      this.calculeOrderTotal();
    }
  }

  async save(): Promise<Result<Immutable<OrderEntity>, string>> {
    const orderResult = await this.repository.save(
      this.getOrder() as OrderEntity
    );

    this.props = { ...orderResult.unwrap() };

    return orderResult;
  }

  private deleteOrderByIndex(index: number): void {
    const lines = List(this.props.lines);
    this.props = this.props = {
      ...this.props,
      lines: lines.delete(index).toArray(),
    };
  }

  private pushOrderLine(newLine: OrderLineEntity): void {
    const lines = List(this.props.lines);
    this.props = { ...this.props, lines: lines.push(newLine).toArray() };
  }

  private updateOrderLineByIndex(index: number, newLine: OrderLineEntity) {
    const order = { ...this.props } as OrderEntity;

    if (order.lines) {
      const line = { ...order.lines[index], ...newLine };

      const linePrepared = this.prepareOrderLine(line);

      order.lines[index] = linePrepared;

      this.props = order;
    }
  }

  private prepareOrderLine(line: OrderLineEntity): Immutable<OrderLineEntity> {
    const productPrice = line.product.price;
    const total = productPrice * line.quantity;
    return { ...line, total };
  }

  private calculeOrderTotal() {
    const lines = this.getOrderLines();

    const total = lines.reduce(
      (acc, curr) => acc + curr.product.price * curr.quantity,
      0
    );

    this.props = { ...this.props, total };
  }
}
