import { Line, Order, OrderLineEntity, OrderLines, OrderRepository } from "../../domain";
import { AddOrderLineDTO } from "./AddOrderLineDTO";
import { Result, Ok, Err } from "oxide.ts";
import { ProductRepository } from "../../../product/domain";

export class AddOrderLineApplication {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository
  ) {}

  async execute(dto: AddOrderLineDTO): Promise<Result<OrderLineEntity[], Error>> {
    const orderResult = await this.orderRepository.getOrder(dto.orderId);

    if (orderResult.isErr()) {
      return Err(orderResult.unwrapErr());
    }

    const productResult = await this.productRepository.getProduct(dto.productId);

    if (productResult.isErr()) {
      return Err(productResult.unwrapErr());
    }

    let order = orderResult.unwrap();

    let lines = order.lines ?? OrderLines.create();

    const product = productResult.unwrap();

    const newLine = Line.fromProduct(product, dto.quantity);

    lines.addLine(newLine);

    order = Order.create({ ...order.get(), lines });

    const orderSaveResult = await this.orderRepository.save(order);

    if (orderSaveResult.isErr()) {
      return Err(orderSaveResult.unwrapErr());
    }

    const linesRaw = orderSaveResult.unwrap().lines;

    return Ok(linesRaw ?? []);
  }
}
