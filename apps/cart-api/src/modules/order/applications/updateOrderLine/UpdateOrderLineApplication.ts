import { Result, Ok, Err } from "oxide.ts";
import { OrderRepository, OrderLines, Line, Order } from "../../domain";
import { UpdateOrderLineDTO } from ".";

export class UpdateOrderLineApplication {
  constructor(private orderRepository: OrderRepository) {}

  async execute(dto: UpdateOrderLineDTO): Promise<Result<OrderLines, Error>> {
    if (dto.quantity <= 0) {
      return Err(new Error("quantity must be greater than 0"));
    }

    const orderResult = await this.orderRepository.getOrder(dto.orderId);

    if (orderResult.isErr()) {
      return Err(orderResult.unwrapErr());
    }

    let order = orderResult.unwrap();

    let lines = order.lines;

    const lineWrap = lines?.getByProductId(dto.productId);

    if (!lines || !lineWrap || lineWrap?.isNone()) {
      return Err(new Error("product not found"));
    }

    const { index, line } = lineWrap.unwrap();

    const newLine = Line.create({ ...line.get(), quantity: dto.quantity });

    lines.set(index, newLine);

    order = Order.create({ ...order.get(), lines });

    const orderSaveResult = await this.orderRepository.save(order);

    if (orderSaveResult.isErr()) {
      return Err(orderSaveResult.unwrapErr());
    }

    const linesRaw = orderSaveResult.unwrap().lines;

    lines = OrderLines.fromPersistence(linesRaw ?? []);

    return Ok(lines);
  }
}
