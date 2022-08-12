import { Result } from "oxide.ts";
import { OrderEntity } from "../domain";
import { orderServer } from "./orderServer";

export const getOrderService = async (): Promise<
  Result<OrderEntity, Error>
> => {
  const request = orderServer.get("/");
};
