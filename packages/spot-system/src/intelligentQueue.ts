import { Option } from "oxide.ts";

export enum IntelliItemState {
  None,
  Block,
  Pending,
  Complete,
  Error,
}

export interface IntelliItem {
  id: string;
  name: string;
  action: () => Promise<any>;
  state?: IntelliItemState;
  depends?: string[];
  waitFor?: string[];
  canReplace?: boolean;

  value?: any;
  forcedError?: boolean;
  prevItem?: IntelliItem;

  onError(isLast: boolean, value: any): void;
}

export interface QueueItem<T> {
  data: T;
  resolve(value: any): void;
  reject(reason: { item: IntelliItem; err: any }): void;
}

export class IntelligentQueue<T extends IntelliItem> {
  public items: QueueItem<T>[] = [];

  private lastItem: QueueItem<T> | undefined = undefined;

  public add(itemData: T) {
    if (itemData.depends && !itemData.waitFor) {
      itemData.waitFor = itemData.depends;
    }

    return new Promise((resolve, reject) => {
      this.enqueue(itemData)
        .then(resolve)
        .catch((reason) => {
          const item = reason?.item as IntelliItem;

          const isLast = this.lastItem?.data.id === item?.id;

          const value = this.findCompleteValue(item);

          item.onError(isLast, value);

          reject();
        });
    });
  }

  private enqueue(itemData: T) {
    return new Promise((resolve, reject) => {
      const item = { data: itemData, resolve, reject };

      console.log("-->push", item.data.name, item.data.id);

      item.data.state = IntelliItemState.None;

      const lastI = this.items[this.items.length - 1];

      if (lastI) {
        if (lastI.data.state === IntelliItemState.Block) {
          item.data.state = IntelliItemState.Block;

          if (item.data.canReplace && lastI.data.name === item.data.name) {
            lastI.resolve(null);

            item.data.prevItem = lastI.data.prevItem;

            this.lastItem = item;

            this.items[this.items.length - 1] = item;

            return;
          }
        }

        if (
          item.data.waitFor &&
          item.data.waitFor.indexOf(this.lastItem?.data.name ?? "") !== -1 &&
          this.lastItem?.data.state !== IntelliItemState.Complete &&
          this.lastItem?.data.state !== IntelliItemState.Error
        ) {
          item.data.state = IntelliItemState.Block;
        }
      }

      item.data.prevItem = this.lastItem?.data;

      this.lastItem = item;

      this.items.push(item);

      this.process();
    });
  }

  private findCompleteValue(item: IntelliItem | undefined): any {
    if (!item) {
      return;
    }

    if (item.state === IntelliItemState.Complete) {
      return item.value;
    }

    return this.findCompleteValue(item.prevItem);
  }

  private isPending(item: IntelliItem | undefined): any {
    if (!item) {
      return false;
    }

    if (item.state === IntelliItemState.Pending) {
      return true;
    }

    if (item.state === IntelliItemState.Error && item.forcedError) {
      return this.isPending(item.prevItem);
    }

    return false;
  }

  public async process() {
    let itemWrap = this.peek();

    if (itemWrap.isNone()) {
      return;
    }

    let item = itemWrap.unwrap();

    if (item.data.prevItem?.state === IntelliItemState.Block) {
      item.data.state === IntelliItemState.Block;

      return;
    }

    const prevItem = item.data.prevItem;

    const waitFor = item.data.waitFor;

    if (
      waitFor &&
      waitFor.indexOf(prevItem?.name ?? "") !== -1 &&
      this.isPending(prevItem)
    ) {
      item.data.state = IntelliItemState.Block;
      return;
    }

    item = this.dequeue().unwrap();

    const depends = item.data.depends;

    if (
      depends &&
      depends.indexOf(prevItem?.name ?? "") !== -1 &&
      prevItem?.state === IntelliItemState.Error
    ) {
      item.data.state = IntelliItemState.Error;

      item.data.forcedError = true;

      item.reject({ item: item.data, err: "depends" });

      this.process();

      return;
    }

    item.data.state = IntelliItemState.Pending;

    console.log("- [ ] calling", item.data.name, item.data.id);

    item.data
      .action()
      .then((result) => {
        item.data.state = IntelliItemState.Complete;

        item.resolve(result);
      })
      .catch((err) => {
        item.data.state = IntelliItemState.Error;

        item.reject({ item: item.data, err });
      })
      .finally(() => this.process());

    if (this.peek().isSome()) {
      this.process();
    }
  }

  public peek(): Option<QueueItem<T>> {
    return Option(this.items[0]);
  }

  private dequeue(): Option<QueueItem<T>> {
    return Option(this.items.shift());
  }
}
