import Loki from "lokijs";
import { OrderModel } from "../order/domain";
import { productsMock } from "../products/product.mock";

export const lokiDatabse = new Loki("database.db");

export const dbModels = {
  orders: lokiDatabse.addCollection("orders"),
  products: lokiDatabse.addCollection("products"),
};

function createDefaultOrders() {
  const order = OrderModel.generateOrder();
  order.id = "123";
  dbModels.orders.insert(order);
}

function createDefaultProducts() {
  dbModels.products.insert(productsMock);
}

createDefaultProducts();
createDefaultOrders();
