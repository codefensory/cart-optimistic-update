import { Option } from "oxide.ts";
import debug from "debug";

import { IntelliItem } from ".";
import { findPendingState, verifyIfNextItemsIsLast } from "./utils";

const log = debug("spot-system:IntelligentPromises");

type RejectReason<V> = {
  item: IntelliItem<V>;
  err: Error;
};

export interface PromiseItem<V, R = any> {
  item: IntelliItem<V, R>;
  resolve(value: R): void;
  reject(reason: RejectReason<V>): void;
}

export class IntelligentPromises<V> {
  public promises: PromiseItem<V>[] = [];

  public isPending = false;

  private lastPromise: PromiseItem<V> | undefined = undefined;

  private lastValueCompleted: V | undefined;

  private promisesPending = 0;

  constructor(private listener?: (isPending: boolean) => void) {}

  /**
   * add a new promise to the queue
   *
   * @param intelliItem item to add
   * */
  public add<R>(
    intelliItem: IntelliItem<V, R>
  ): Promise<V | R | null | undefined> {
    this.promisesPending++;

    if (!this.isPending) {
      this.isPending = true;

      this.notifyQueueStatus();
    }

    return new Promise((resolve) => {
      this.enqueue(intelliItem)
        .then((value) => {
          if (value === null) {
            return resolve(null);
          }

          const item = value.item;

          let isLast = false;

          if (item.nextItem?.isPartialComplete() || item.nextItem?.isError()) {
            isLast = verifyIfNextItemsIsLast(
              item.nextItem,
              this.lastPromise?.item.id
            );
          } else {
            isLast =
              this.lastPromise?.item.id === item.id &&
              !item.isPartialComplete();
          }

          item.onComplete?.(isLast, value.result, this.lastValueCompleted);

          resolve(value.result);
        })
        .catch((reason: RejectReason<V>) => {
          const item = reason?.item;

          const isLast = this.lastPromise?.item.id === item?.id;

          const value = this.lastValueCompleted;

          item.onError?.(isLast, value);

          resolve(value);
        })
        .finally(() => {
          this.promisesPending--;

          if (this.promisesPending < 0) {
            throw new Error("Count pending promises is negative!");
          }

          if (this.promisesPending === 0) {
            this.isPending = false;

            this.notifyQueueStatus();
          }
        });
    });
  }

  /**
   * processes and adds a promise to the queue
   *
   * @param intelliItem item to add
   */
  private enqueue<R>(
    intelliItem: IntelliItem<V, R>
  ): Promise<{ item: IntelliItem<V, R>; result: R }> {
    return new Promise((resolve, reject) => {
      // new element to add
      const queuePromise: PromiseItem<V> = {
        item: intelliItem,
        resolve,
        reject,
      };

      const lastPromiseEnqueued = this.promises[this.promises.length - 1];

      if (lastPromiseEnqueued?.item.isBlock()) {
        intelliItem.block();

        if (intelliItem.canReplaceItem(lastPromiseEnqueued.item)) {
          intelliItem.prevItem = lastPromiseEnqueued.item.prevItem;

          this.lastPromise = queuePromise;

          this.promises[this.promises.length - 1] = queuePromise;

          log(`➤ skip ${intelliItem.name} ${intelliItem.id}`);

          // when replaced, the replaced item will respond as if it was completed correctly
          // but returning null
          lastPromiseEnqueued.resolve(null);

          return;
        }
      }

      if (this.lastPromise && !this.lastPromise.item.isComplete()) {
        // if we have the previous item inside waitFor, and it is different from isComplete, isError and isCanceled, then we block the new item
        if (
          (intelliItem.containWaitForByName(this.lastPromise.item.name) ||
            intelliItem.containDependsByName(this.lastPromise.item.name)) &&
          (this.lastPromise.item.isBlock() ||
            this.lastPromise.item.isPending() ||
            this.lastPromise.item.isPartialComplete())
        ) {
          intelliItem.block();
        } else {
          this.lastPromise.item.nextItem = intelliItem;
        }

        intelliItem.prevItem = this.lastPromise.item;
      }

      log(`➤ enqueue ${intelliItem.name} ${intelliItem.id}`);

      this.lastPromise = queuePromise;

      this.promises.push(queuePromise);

      this.processQueue();
    });
  }

  public async processQueue() {
    const queuePromiseWrap = this.peek();

    // if there are no other elements, it exits
    if (queuePromiseWrap.isNone()) {
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

    if (item.prevItem?.isPartialComplete()) {
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

        item.value = result;

        this.lastValueCompleted = result;

        if (
          item.prevItem?.isPartialComplete() ||
          findPendingState(item.prevItem)
        ) {
          item.partialComplete();

          queuePromise.resolve({ item, result });

          return;
        }

        queuePromise.resolve({ item, result });

        item.complete();

        // at the end of executing the promise, re-execute the process
        this.processQueue();
      })
      .catch((err) => {
        log("\x1b[31m%s\x1b[0m", "✖ Error", item.name, item.id);

        item.error();

        queuePromise.reject({ item, err });

        // at the end of executing the promise, re-execute the process
        this.processQueue();
      });

    // if there are no items in the queue, re-execute the process.
    if (this.peek().isSome()) {
      this.processQueue();
    }
  }

  private notifyQueueStatus() {
    this.listener?.(this.isPending);
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
