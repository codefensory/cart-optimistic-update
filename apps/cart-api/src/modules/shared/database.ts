import Loki from "lokijs";
import shortid from "shortid";
import { Order } from "../order/domain";
import { productsMock } from "../product/data/productsMock";

export const lokiDatabse = new Loki("database.db");

export const dbModels = {
  orders: lokiDatabse.addCollection("orders"),
  products: lokiDatabse.addCollection("products"),
};

function createDefaultOrders() {
  const order = Order.create({ id: shortid.generate(), code: shortid.generate() });
  dbModels.orders.insert(order);
}

function createDefaultProducts() {
  dbModels.products.insert(productsMock);
}

createDefaultProducts();

createDefaultOrders();
