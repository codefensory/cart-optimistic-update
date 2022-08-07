import { Immutable } from "../../../../utils/types";

export interface ToPersistence<P> {
  toPersistence(): Immutable<P>;
}
