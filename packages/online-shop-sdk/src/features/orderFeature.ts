import { OnlineShop } from "../onlineShop";
import { Order, OrderLine, Product } from "../types";

const URL: string = "/order";

const ORDER_ID_KEY = "orderId";

export class OrderFeature {
  constructor(private shop: OnlineShop) {}

  id() {
    const orderId = this.shop.storage.get(ORDER_ID_KEY);
    return !!orderId ? orderId : undefined;
  }

  setId(id: string) {
    this.shop.storage.set(ORDER_ID_KEY, id);
  }

  async get(): Promise<Order | undefined> {
    const orderId = this.id();

    if (!orderId) {
      return;
    }

    return (await this.shop.server.get(`${URL}/${orderId}`)).data as Order;
  }

  async create(): Promise<Order> {
    const response = await this.shop.server.post(`${URL}/create`);

    const order = response.data as Order;

    this.setId(order.id);

    return order;
  }

  async addLine(
    productId: Product["id"],
    quantity?: OrderLine["quantity"]
  ): Promise<OrderLine[]> {
    const orderId = this.id();

    const orderLine = (
      await this.shop.server.post(`${URL}/lines`, {
        orderId,
        productId,
        quantity,
      })
    ).data as OrderLine[];

    if (!orderId) {
      this.setId(orderLine[0].orderId ?? "");
    }

    return orderLine;
  }

  async deleteLine(productId: string): Promise<OrderLine[]> {
    const orderId = this.id();

    return (
      await this.shop.server.delete(`${URL}/lines`, {
        data: {
          orderId,
          productId,
        },
      })
    ).data as OrderLine[];
  }

  async updateLine(productId: string, quantity: number): Promise<OrderLine[]> {
    const orderId = this.id();

    return (
      await this.shop.server.post(`${URL}/lines/${productId}`, {
        orderId,
        quantity,
      })
    ).data as OrderLine[];
  }
}
