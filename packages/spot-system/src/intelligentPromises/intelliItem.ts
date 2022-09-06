import shortid from "shortid";

export enum IntelliState {
  None,
  Block,
  Pending,
  Complete,
  Error,
  Canceled,
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

  promise(): Promise<any>;
  canReplaceItem(item: IntelliItem<V> | undefined): boolean;
  containWaitForByName(itemName: string | undefined): boolean;
  containDependsByName(itemName: string | undefined): boolean;
  isWaitingForPendingState(): boolean;
  isDependencyError(): boolean;

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
    return this.findCompletedValue(this.prevItem);
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

  private findCompletedValue(item: IntelliItem<V> | undefined): V | undefined {
    if (!item) {
      return;
    }

    if (item.isComplete()) {
      return item.value;
    }

    return this.findCompletedValue(item.prevItem);
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
