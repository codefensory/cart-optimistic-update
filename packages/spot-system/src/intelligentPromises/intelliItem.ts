import shortid from "shortid";

export enum IntelliState {
  None = 1,
  Block = 1 << 1,
  Pending = 1 << 2,
  Complete = 1 << 3,
  Error = 1 << 4,
  Canceled = 1 << 5,
}

export interface IntelliProps<V> {
  name: string;
  action: () => Promise<any>;
  depends?: string[];
  waitFor?: string[];
  canReplace?: boolean;

  value?: V;

  onError(isLast: boolean, value: any): void;
}

export interface IntelliItem<V> {
  id: string;
  name: string;
  value: V | undefined;
  state: IntelliState;
  canReplace: boolean;
  prevItem: IntelliItem<V> | undefined;

  onError: ((isLast: boolean, value: V | undefined) => void) | undefined;

  block(): void;
  error(): void;
  pending(): void;
  complete(): void;
  cancel(): void;

  isPending(): boolean;
  isBlock(): boolean;
  isComplete(): boolean;
  isError(): boolean;
  isCanceled(): boolean;
  isFinally(): boolean;

  promise(): Promise<any>;
  canReplaceItem(item: IntelliItem<V> | undefined): boolean;
  containWaitForByName(itemName: string | undefined): boolean;
  containDependsByName(itemName: string | undefined): boolean;
  isWaitingForPendingState(): boolean;
  isDependencyError(): boolean;
  allIsFinally(): boolean;

  getCompletedValue(): V | undefined;
}

export class BaseIntelliItem<V> implements IntelliItem<V> {
  public id: string;
  public name: string;
  public action: () => Promise<any>;
  public state: IntelliState;
  public depends: string[];
  public waitFor: string[];
  public canReplace: boolean;

  public value: V | undefined;

  public prevItem: IntelliItem<V> | undefined;

  public onError: ((isLast: boolean, value: V | undefined) => void) | undefined;

  constructor(options: IntelliProps<V>) {
    this.id = shortid.generate();
    this.name = options.name;
    this.action = options.action;
    this.state = IntelliState.None;
    this.depends = options.depends ?? [];
    this.waitFor = options.waitFor ?? this.depends;
    this.canReplace = !!options.canReplace;
    this.value = options.value;
    this.onError = options.onError;
  }

  block() {
    this.state = IntelliState.Block;
  }

  error() {
    this.state = IntelliState.Error;
  }

  pending() {
    this.state = IntelliState.Pending;
  }

  complete() {
    this.state = IntelliState.Complete;
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
    return this.findItemByState(this.prevItem, IntelliState.Complete)?.value;
  }

  allIsFinally() {
    return !!!this.findItemByState(
      this.prevItem,
      IntelliState.Block | IntelliState.Pending | IntelliState.None
    );
  }

  isWaitingForPendingState() {
    if (!this.containWaitForByName(this.prevItem?.name)) {
      return false;
    }

    return this.findPendingState(this.prevItem);
  }

  isDependencyError() {
    if (!this.containDependsByName(this.prevItem?.name)) {
      return false;
    }

    return !!(this.prevItem?.isError() || this.prevItem?.isCanceled());
  }

  private findItemByState(
    item: IntelliItem<V> | undefined,
    states: IntelliState
  ): IntelliItem<V> | undefined {
    if (!item) {
      return;
    }

    if (!!(item.state & states)) {
      return item;
    }

    return this.findItemByState(item.prevItem, states);
  }

  private findPendingState(item: IntelliItem<V> | undefined): boolean {
    if (!item) {
      return false;
    }

    if (item.isPending()) {
      return true;
    }

    if (item.isError() || item.isCanceled()) {
      return this.findPendingState(item.prevItem);
    }

    return false;
  }
}
