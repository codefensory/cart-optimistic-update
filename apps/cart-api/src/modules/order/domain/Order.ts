import { ModelBase } from "../../shared/core/domain/ModelBase";
import { OrderLineEntity } from ".";
import { OrderLines } from ".";
import { Line } from "./Line";
import { List } from "immutable";

export type OrderEntity = {
  id: string;
  code?: string;
  lines?: OrderLineEntity[];
  total?: number;
  $loki?: string;
};

type OrderProps = {
  lines?: OrderLines;
} & Omit<OrderEntity, "lines">;

export class Order extends ModelBase<OrderProps, OrderEntity> {
  get lines(): OrderLines | undefined {
    return this.props.lines;
  }

  static fromPersistence(raw: OrderEntity): Order {
    const lines = OrderLines.fromPersistence(raw.lines ?? []);
    return Order.create({ ...raw, lines });
  }

  get(): OrderProps {
    const props = super.get();
    props.total = this.lines?.clone().reduce((acc, curr) => acc + (curr.get().total ?? 0), 0);
    props.lines = OrderLines.create(
      props.lines
        ?.clone()
        .map((line) => Line.create({ ...line.get(), orderId: props.id }))
        .toArray()
    );
    return props;
  }
}
