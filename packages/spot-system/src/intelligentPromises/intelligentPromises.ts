import { Option } from "oxide.ts";
import debug from "debug";

import { IntelliItem } from ".";

const log = debug("spot-system:IntelligentPromises");

type RejectReason<V> = {
  item: IntelliItem<V>;
  err: Error;
};

export interface PromiseItem<V> {
  item: IntelliItem<V>;
  resolve(value: any): void;
  reject(reason: RejectReason<V>): void;
}

export class IntelligentPromises<V> {
  public promises: PromiseItem<V>[] = [];

  private lastPromise: PromiseItem<V> | undefined = undefined;

  private isPending: boolean = false;

  constructor(
    private pendingCallback: ((isPending: boolean) => void) | undefined
  ) {}

  /**
   * add a new promise to the queue
   *
   * @param intelliItem item to add
   * */
  public add(intelliItem: IntelliItem<V>) {
    return new Promise((resolve, reject) => {
      this.enqueue(intelliItem)
        .then(resolve)
        .catch((reason: RejectReason<V>) => {
          const item = reason?.item;

          const isLast = this.lastPromise?.item.id === item?.id;

          const value = item.getCompletedValue();

          item.onError?.(isLast, value);

          reject(reason.err);
        });
    });
  }

  /**
   * processes and adds a promise to the queue
   *
   * @param intelliItem item to add
   */
  private enqueue(intelliItem: IntelliItem<V>) {
    return new Promise((resolve, reject) => {
      if (!this.isPending) {
        log("STARTED");

        this.isPending = true;

        this.pendingCallback?.(this.isPending);
      }

      // new element to add
      const queuePromise: PromiseItem<V> = {
        item: intelliItem,
        resolve,
        reject,
      };

      log(`➤ enqueue ${intelliItem.name} ${intelliItem.id}`);

      const lastPromiseEnqueued = this.promises[this.promises.length - 1];

      if (lastPromiseEnqueued?.item.isBlock()) {
        intelliItem.block();

        if (intelliItem.canReplaceItem(lastPromiseEnqueued.item)) {
          intelliItem.prevItem = lastPromiseEnqueued.item.prevItem;

          this.lastPromise = queuePromise;

          this.promises[this.promises.length - 1] = queuePromise;

          // when replaced, the replaced item will respond as if it was completed correctly
          // but returning null
          lastPromiseEnqueued.resolve(null);
          return;
        }
      }

      if (this.lastPromise && !this.lastPromise.item.isComplete()) {
        // if we have the previous item inside waitFor, and it is different from isComplete, isError and isCanceled, then we block the new item
        if (
          intelliItem.containWaitForByName(this.lastPromise?.item.name) &&
          (this.lastPromise?.item.isBlock() ||
            this.lastPromise?.item.isPending())
        ) {
          intelliItem.block();
        }

        intelliItem.prevItem = this.lastPromise?.item;
      }

      this.lastPromise = queuePromise;

      this.promises.push(queuePromise);

      this.processQueue();
    });
  }

  public async processQueue() {
    let queuePromiseWrap = this.peek();

    // if there are no other elements, it exits
    if (queuePromiseWrap.isNone()) {
      if (
        !this.lastPromise?.item.isPending() &&
        !this.lastPromise?.item.isBlock() &&
        this.isPending
      ) {
        log("ENDED");

        this.isPending = false;

        this.pendingCallback?.(this.isPending);
      }

      return;
    }

    let queuePromise = queuePromiseWrap.unwrap();

    let item = queuePromise.item;

    // if the previous element is blocked, the status is changed to blocked and exits
    if (item.prevItem?.isBlock()) {
      item.block();

      return;
    }

    // if it is on the waiting list and is pending, the status is changed to blocked and it exits.
    if (item.isWaitingForPendingState()) {
      item.block();

      return;
    }

    queuePromise = this.dequeue().unwrap();

    item = queuePromise.item;

    // if it depends on the previous item and the previous item has an error or is canceled, then cancel this item.
    if (item.isDependencyError()) {
      log("\x1b[31m%s\x1b[0m", "✖ Canceled", item.name, item.id);

      item.cancel();

      queuePromise.reject({ item, err: new Error("Promise canceled") });

      this.processQueue();

      return;
    }

    log("\x1b[38;5;178m%s\x1b[0m", "⇅ calling", item.name, item.id);

    // executes the promise
    item
      .promise()
      .then((result) => {
        log("\x1b[32m%s\x1b[0m", "✔ Complete", item.name, item.id);

        item.complete();

        queuePromise.resolve(result);
      })
      .catch((err) => {
        log("\x1b[31m%s\x1b[0m", "✖ Error", item.name, item.id);

        item.error();

        queuePromise.reject({ item, err });
      })
      // at the end of executing the promise, re-execute the process
      .finally(() => this.processQueue());

    // if there are no items in the queue, re-execute the process.
    if (this.peek().isSome()) {
      this.processQueue();
    }
  }

  // peek next item
  public peek(): Option<PromiseItem<V>> {
    return Option(this.promises[0]);
  }

  // get and remove the next item from the queue
  private dequeue(): Option<PromiseItem<V>> {
    return Option(this.promises.shift());
  }
}
