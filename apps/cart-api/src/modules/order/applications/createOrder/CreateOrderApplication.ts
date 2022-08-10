import { OrderRepository, Order } from "../../domain";
import { Result, Err, Ok } from "oxide.ts";
import shortid from "shortid";

export class CreateOrderApplication {
  constructor(private readonly repository: OrderRepository) {}

  async execute(): Promise<Result<Order, Error>> {
    let order = Order.create({
      id: shortid.generate(),
      code: shortid.generate(),
      total: 0,
    });

    const saveResult = await this.repository.save(order);

    if (saveResult.isErr()) {
      return Err(saveResult.unwrapErr());
    }

    order = Order.fromPersistence(saveResult.unwrap());

    return Ok(order);
  }
}
