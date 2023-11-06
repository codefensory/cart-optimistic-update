import { ModelArray, ToPersistence } from ".";
import { Values } from "../../../../utils/types";

export abstract class ModelBase<T, P = T> implements ToPersistence<P> {
  static create<T, R>(this: new (props: T) => R, props: T): R {
    return new this({ ...props });
  }

  constructor(protected props: T) {}

  toPersistence(): P {
    const result = {} as { [K in keyof P]: P[K] | undefined };

    const props = this.get();

    const keys = Object.keys(props as any);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      result[key as keyof P] = this.getValueObject(props[key as keyof T]);
    }

    return result as P;
  }

  get(): T {
    return { ...this.props };
  }

  private getValueObject(prop: Values<T> | Values<P> | undefined): Values<P> | undefined {
    if (!prop) {
      return undefined;
    }

    if (prop instanceof ModelBase || prop instanceof ModelArray) {
      return prop.toPersistence() as Values<P>;
    }

    return prop as Values<P>;
  }
}
