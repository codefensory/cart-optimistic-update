import { OrderLine } from ".";

export type Order = {
  id: string;
  lines: OrderLine[];
  total?: number;
};
