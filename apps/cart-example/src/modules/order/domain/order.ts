import { OrderLineEntity } from "./orderLine";

export type OrderEntity = {
  id: string;
  code?: string;
  lines?: OrderLineEntity;
  total?: number;
};
