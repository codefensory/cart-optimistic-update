import { Result, Ok, Err } from "oxide.ts";
import { Order, OrderLines, OrderRepository } from "../../domain";
import { DeleteOrderLineDTO } from "./DeleteOrderLineDTO";

export class DeleteOrderLineApplication {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(dto: DeleteOrderLineDTO): Promise<Result<OrderLines, Error>> {
    const orderResult = await this.orderRepository.getOrder(dto.orderId);

    if (orderResult.isErr()) {
      return Err(orderResult.unwrapErr());
    }

    let order = orderResult.unwrap();

    let lines = order.lines;

    if (!lines) {
      return Ok(OrderLines.create());
    }

    lines.deleteLine(dto.productId, dto.quantity);

    order = Order.create({ ...order.get(), lines });

    const saveResult = await this.orderRepository.save(order);

    if (saveResult.isErr()) {
      return Err(saveResult.unwrapErr());
    }

    const linesRaw = saveResult.unwrap().lines;

    lines = OrderLines.fromPersistence(linesRaw ?? []);

    return Ok(lines);
  }
}
