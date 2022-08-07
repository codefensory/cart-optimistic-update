import { OrderRepository, OrderEntity, Order } from "../../domain";
import { Result } from "oxide.ts";
import shortid from "shortid";

export class CreateOrderApplication {
  constructor(private readonly repository: OrderRepository) {}

  async execute(): Promise<Result<OrderEntity, Error>> {
    const order = Order.create({
      id: shortid.generate(),
      code: shortid.generate(),
      total: 0,
    });

    const saveResult = await this.repository.save(order);

    return saveResult;
  }
}
