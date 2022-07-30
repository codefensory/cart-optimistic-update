import Loki from "lokijs";

export const lokiDatabse = new Loki("database.db");

export const dbModels = {
  orders: lokiDatabse.addCollection("orders"),
};
