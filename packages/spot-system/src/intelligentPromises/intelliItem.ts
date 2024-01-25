import shortid from "shortid";
import { IntelliState } from "./contants";
import { findItemByState, findPendingState } from "./utils";

export interface IntelliProps<V, R> {
  name: string;
  action: () => Promise<R>;
  depends?: string[];
  waitFor?: string[];
  canReplace?: boolean;

  value?: V;

  onComplete?(isLast: boolean, value: R, lastValueCompleted?: V | R): void;
  onError?(isLast: boolean, value: V | undefined): void;
}

export interface IntelliItem<V, R = any> {
  id: string;
  name: string;
  value: V | R | undefined;
  state: IntelliState;
  canReplace: boolean;
  prevItem: IntelliItem<V> | undefined;
  nextItem: IntelliItem<V> | undefined;

  onComplete?:
    | ((isLast: boolean, value: R, lastValueCompleted?: V | R) => void)
    | undefined;
  onError?: ((isLast: boolean, value: V | undefined) => void) | undefined;

  block(): void;
  error(validPartial?: boolean): void;
  pending(): void;
  complete(validPartial?: boolean): void;
  partialComplete(): void;
  cancel(): void;

  isPending(): boolean;
  isBlock(): boolean;
  isComplete(): boolean;
  isPartialComplete(): boolean;
  isError(): boolean;
  isCanceled(): boolean;
  isFinally(): boolean;

  promise(): Promise<R>;
  canReplaceItem(item: IntelliItem<V> | undefined): boolean;
  containWaitForByName(itemName: string | undefined): boolean;
  containDependsByName(itemName: string | undefined): boolean;
  isWaitingForPendingState(): boolean;
  isDependencyError(): boolean;
  allIsFinally(): boolean;

  getCompletedValue(): V | undefined;
}

export class BaseIntelliItem<V, R> implements IntelliItem<V, R> {
  public id: string;
  public name: string;
  public action: () => Promise<R>;
  public state: IntelliState;
  public depends: string[];
  public waitFor: string[];
  public canReplace: boolean;

  public value: V | R | undefined;

  public prevItem: IntelliItem<V> | undefined;
  public nextItem: IntelliItem<V> | undefined;

  public onComplete:
    | ((isLast: boolean, value: R, lastValueCompleted?: V | R) => void)
    | undefined;
  public onError: ((isLast: boolean, value: V | undefined) => void) | undefined;

  constructor(options: IntelliProps<V, R>) {
    this.id = shortid.generate();
    this.name = options.name;
    this.action = options.action;
    this.state = IntelliState.None;
    this.depends = options.depends ?? [];
    this.waitFor = options.waitFor ?? this.depends;
    this.canReplace = !!options.canReplace;
    this.onComplete = options.onComplete;
    this.onError = options.onError;
  }

  block() {
    this.state = IntelliState.Block;
  }

  error(validPartial?: boolean) {
    this.state = IntelliState.Error;

    if (validPartial) {
      this.nextPartialToComplete(this.nextItem);
    }
  }

  pending() {
    this.state = IntelliState.Pending;
  }

  complete(validPartial?: boolean) {
    this.state = IntelliState.Complete;

    if (validPartial) {
      this.nextPartialToComplete(this.nextItem);
    }
  }

  partialComplete() {
    this.state = IntelliState.PartialComplete;
  }

  cancel() {
    this.state = IntelliState.Canceled;
  }

  isPending() {
    return this.state === IntelliState.Pending;
  }

  isFinally() {
    return !!(
      this.state &
      (IntelliState.Complete | IntelliState.Canceled | IntelliState.Error)
    );
  }

  isBlock() {
    return this.state === IntelliState.Block;
  }

  isComplete() {
    return this.state === IntelliState.Complete;
  }

  isPartialComplete() {
    return this.state === IntelliState.PartialComplete;
  }

  isError() {
    return this.state === IntelliState.Error;
  }

  isCanceled() {
    return this.state === IntelliState.Canceled;
  }

  setPrevItem(item: IntelliItem<V> | undefined) {
    this.prevItem = item;
  }

  canReplaceItem(item: IntelliItem<V> | undefined) {
    if (item?.canReplace && item?.isBlock() && item.name === this.name) {
      return true;
    }

    return false;
  }

  containWaitForByName(itemName: string | undefined) {
    if (!itemName) {
      return false;
    }

    return this.waitFor.indexOf(itemName) !== -1;
  }

  containDependsByName(itemName: string | undefined) {
    if (!itemName) {
      return false;
    }

    return this.depends.indexOf(itemName) !== -1;
  }

  promise() {
    this.state = IntelliState.Pending;

    return this.action();
  }

  getCompletedValue() {
    return findItemByState(this.prevItem, IntelliState.Complete)?.value;
  }

  allIsFinally() {
    return !findItemByState(
      this.prevItem,
      IntelliState.Block | IntelliState.Pending | IntelliState.None
    );
  }

  isWaitingForPendingState() {
    if (
      !this.containWaitForByName(this.prevItem?.name) &&
      !this.containDependsByName(this.prevItem?.name)
    ) {
      return false;
    }

    return findPendingState(this.prevItem);
  }

  isDependencyError() {
    if (!this.containDependsByName(this.prevItem?.name)) {
      return false;
    }

    return !!(this.prevItem?.isError() || this.prevItem?.isCanceled());
  }

  private nextPartialToComplete(item: IntelliItem<V> | undefined) {
    if (!item) {
      return;
    }

    if (item.isPartialComplete()) {
      item.complete(true);

      return;
    }

    if (item.isError()) {
      this.nextPartialToComplete(item.nextItem);

      return;
    }
  }
}
