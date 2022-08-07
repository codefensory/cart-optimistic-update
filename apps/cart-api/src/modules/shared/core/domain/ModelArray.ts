import { Immutable, Values } from "../../../../utils/types";
import { ToPersistence } from ".";
import { List } from "immutable";
import { ModelBase } from "./ModelBase";

export abstract class ModelArray<T extends ToPersistence<P>, P> implements ToPersistence<P[]> {
  static create<T, R>(this: new (props: T[]) => R, props: T[] = []): R {
    return new this(props);
  }

  protected list: List<T>;

  constructor(list: T[] = []) {
    this.list = List(list);
  }

  toPersistence(): Immutable<P[]> {
    const result = [];

    for (let i = 0; i < this.list.count(); i++) {
      const line = this.list.get(i);

      if (line) {
        result.push(line.toPersistence());
      }
    }

    return result;
  }

  get(index: number): T | undefined {
    return this.list.get(index);
  }

  set(index: number, item: T) {
    this.list = this.list.set(index, item);
  }

  clone(): List<T> {
    return List(this.list.toArray());
  }

  push(item: T) {
    this.list = this.list.push(item);
  }

  delete(index: number) {
    this.list = this.list.delete(index);
  }
}
