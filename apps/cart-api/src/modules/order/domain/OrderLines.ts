import { Option, None, Some } from "oxide.ts";
import { ModelArray } from "../../shared/core/domain";
import { Line } from ".";
import { ProductEntity } from "../../product/domain";

export type OrderLineEntity = {
  id: string;
  product: ProductEntity;
  quantity: number;
  total?: number;
};

export class OrderLines extends ModelArray<Line, OrderLineEntity> {
  static fromPersistence(rawList: OrderLineEntity[]): OrderLines {
    const lines = rawList.map((line) => Line.fromPersistence(line));
    return OrderLines.create(lines);
  }

  addLine(newLine: Line) {
    const lineWrap = this.getByProductId(newLine.product.id);

    if (lineWrap.isSome()) {
      const { index, line } = lineWrap.unwrap();

      let lineData = line.get();

      const quantity = lineData.quantity + newLine.quantity;

      this.set(index, Line.create({ ...lineData, quantity }));
    } else {
      this.push(Line.create(newLine.get()));
    }
  }

  deleteLine(productId: ProductEntity["id"], quantity?: OrderLineEntity["quantity"]) {
    const lineWrap = this.getByProductId(productId);

    if (lineWrap.isSome()) {
      const { index, line } = lineWrap.unwrap();

      if (!quantity) {
        this.delete(index);
        return;
      }

      const newQuantity = line.quantity - quantity;

      this.set(index, Line.create({ ...line.get(), quantity: newQuantity }));
    }
  }

  getByProductId(
    productId: OrderLineEntity["product"]["id"]
  ): Option<{ index: number; line: Line }> {
    const lineIndex = this.list.findIndex((line) => line.product.id === productId);

    if (lineIndex === -1) {
      return None;
    }

    const line = this.list.get(lineIndex);

    if (!line) {
      return None;
    }

    return Some({
      index: lineIndex,
      line: line,
    });
  }
}
