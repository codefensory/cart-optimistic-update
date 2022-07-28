import { List } from "immutable";
import { None, Option, Result, Some } from "oxide.ts";
import { OrderEntity, OrderLineEntity, OrderRepository } from "./order.entity";

export class OrderModel {
  static async getByIdFromRepository(
    orderId: number,
    repository: OrderRepository
  ): Promise<Result<OrderModel, any>> {
    const orderResult = await repository.getOrder(orderId);
    return orderResult.map((order) => new OrderModel(order));
  }

  constructor(private props: OrderEntity) {}

  getOrder(): OrderEntity {
    return { ...this.props };
  }

  getOrderLines(): Option<OrderLineEntity[]> {
    return Option(this.props.lines);
  }

  getOrderLineById(
    id: number
  ): Option<{ index: number; line: OrderLineEntity }> {
    if (!this.props.lines) {
      return None;
    }

    const lines = this.props.lines;

    const lineIndex = lines?.findIndex((line) => line.product.id === id);

    if (lineIndex !== -1) {
      return Some({
        index: lineIndex,
        line: { ...this.props.lines[lineIndex] },
      });
    }

    return None;
  }

  addOrderLine(newLine: OrderLineEntity): void {
    const lineWrap = this.getOrderLineById(newLine.product.id);

    if (lineWrap.isSome()) {
      const { index, line } = lineWrap.unwrap();

      line.quantity = line.quantity + newLine.quantity;

      this.updateOrderLineByIndex(index, line);
    } else {
      this.pushOrderLine(newLine);
    }
  }

  deleteOrderLine(productId: number, quantity?: number): void {
    const lineWrap = this.getOrderLineById(productId);

    if (lineWrap.isSome()) {
      const { index, line } = lineWrap.unwrap();

      // If not send quantity, delete the line
      if (!quantity) {
        this.deleteOrderByIndex(index);
        return;
      }

      line.quantity = line.quantity - quantity;
      this.updateOrderLineByIndex(index, line);
    }
  }

  private deleteOrderByIndex(index: number): void {
    if (this.props.lines) {
      const lines = List(this.props.lines);
      this.props.lines = lines.delete(index).toArray();
    }
  }

  private pushOrderLine(newLine: OrderLineEntity): void {
    const lines = List(this.props.lines ?? []);
    this.props.lines = lines.push(newLine).toArray();
  }

  private updateOrderLineByIndex(index: number, newLine: OrderLineEntity) {
    if (this.props.lines) {
      const line = this.props.lines[index];

      this.props.lines[index] = this.prepareOrderLine({
        ...line,
        ...newLine,
      });
    }
  }

  private prepareOrderLine(line: OrderLineEntity): OrderLineEntity {
    const productPrice = line.product.price;
    const total = productPrice * line.quantity;
    return { ...line, total };
  }
}
