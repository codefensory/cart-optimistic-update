import { Line, Order, OrderLines, OrderRepository } from "../../domain";
import { AddOrderLineDTO } from "./AddOrderLineDTO";
import { Result, Ok, Err } from "oxide.ts";
import { ProductRepository } from "../../../product/domain";
import { CreateOrderApplication } from "../createOrder";

export class AddOrderLineApplication {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository
  ) {}

  async execute(dto: AddOrderLineDTO): Promise<Result<OrderLines, Error>> {
    let orderResult: Result<Order, Error>;

    if (!!dto.orderId) {
      orderResult = await this.orderRepository.getOrder(dto.orderId);
    } else {
      const createOrderApplication = new CreateOrderApplication(this.orderRepository);

      orderResult = await createOrderApplication.execute();
    }

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

    lines = OrderLines.fromPersistence(linesRaw ?? []);

    return Ok(lines);
  }
}
